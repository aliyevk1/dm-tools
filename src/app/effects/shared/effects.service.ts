import {EventEmitter, Injectable} from '@angular/core';
import {addDoc, collection, deleteDoc, doc, Firestore, getDocs} from '@angular/fire/firestore';
import {deleteObject, getDownloadURL, listAll, ref, Storage, uploadBytesResumable} from '@angular/fire/storage';
import {AuthService} from '../../core/auth.service';
import {Effect, EffectsGroup} from './effects';



@Injectable({
  providedIn: 'root'
})

export class EffectsService {

  uploadProgress: EventEmitter<{ fileName: string; progress: number }> = new EventEmitter();

  constructor(private firestore: Firestore, private storage: Storage, private authService: AuthService) {}

  //#region Effects Group operations
  // Fetch effects groups for logged-in user
  async getEffectsGroups(): Promise<EffectsGroup[]> {
    const user = this.authService.currentUserSig();
    if (user) {
      const groupsCollectionRef = collection(this.firestore, `users/${user.uid}/effectsGroups`);
      const snapshot = await getDocs(groupsCollectionRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data()["name"],
        effects: doc.data()["effects"] || []
      }));
    }
    return [];
  }

  // Add a new effects group
  async addEffectsGroup(groupName: string): Promise<EffectsGroup> {
    const user = this.authService.currentUserSig();
    if (user) {
      const groupsCollectionRef = collection(this.firestore, `users/${user.uid}/effectsGroups`);
      const groupData = { name: groupName, effects: [] };
      const docRef = await addDoc(groupsCollectionRef, groupData);
      return { id: docRef.id, name: groupName, effects: [] };
    }
    throw new Error('User not logged in');
  }

  // Delete an effects group and its related files
  async deleteEffectsGroup(groupId: string): Promise<void> {
    const user = this.authService.currentUserSig();
    if (user) {
      const groupDocRef = doc(this.firestore, `users/${user.uid}/effectsGroups/${groupId}`);

      // Fetch and delete all effects associated with the group from Firestore and Firebase Storage
      const effectsCollectionRef = collection(this.firestore, `users/${user.uid}/effectsGroups/${groupId}/effects`);
      const snapshot = await getDocs(effectsCollectionRef);

      for (const effectDoc of snapshot.docs) {
        const effectData = effectDoc.data();
        const effectUrl = effectData["url"];

        // Delete file from Firebase Storage
        if (effectUrl) {
          const fileRef = ref(this.storage, effectUrl);
          await deleteObject(fileRef).catch((error) => {
            console.error('Error deleting file from Firebase Storage:', error);
          });
        }

        // Delete the effect document from Firestore
        await deleteDoc(effectDoc.ref).catch((error) => {
          console.error('Error deleting effect document from Firestore:', error);
        });
      }

      // Finally, delete the group document from Firestore
      await deleteDoc(groupDocRef);
    } else {
      throw new Error('User not logged in');
    }
  }
  //#endregion

  async uploadFiles(groupId: string, files: File[]): Promise<void> {
    const user = this.authService.currentUserSig();
    if (user) {
      const userFilesRef = ref(this.storage, `users/${user.uid}/effects`);
      const existingFiles = await listAll(userFilesRef);
      const totalFilesCount = existingFiles.items.length;

      if (totalFilesCount + files.length > 50) {
        throw new Error('Total number of files exceeds the limit of 50.');
      }

      const uploadPromises = files.map((file) => {
        // Check the file size limit (15 MB)
        if (file.size > 15 * 1024 * 1024) {
          return Promise.reject(new Error(`File "${file.name}" exceeds the size limit of 15 MB.`));
        }

        return new Promise<void>((resolve, reject) => {
          const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`; // Generate unique ID using current time and random number
          const filePath = `users/${user.uid}/effects/${uniqueId}_${file.name}`; // Add the unique ID to the filename
          const fileRef = ref(this.storage, filePath);
          const uploadTask = uploadBytesResumable(fileRef, file);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              this.uploadProgress.emit({ fileName: file.name, progress: Math.round(progress) });
            },
            (error) => {
              console.error('Error uploading file:', error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                // Save effect metadata to Firestore
                await this.addEffectToGroup(groupId, this.beautifyFileName(file.name), downloadURL);
                resolve(); // Resolve when upload and metadata save are complete
              } catch (error) {
                console.error('Error saving effect metadata:', error);
                reject(error); // Reject in case of an error
              }
            }
          );
        });
      });

      await Promise.all(uploadPromises);
    } else {
      throw new Error('User not logged in');
    }
  }


  // Add effect metadata to Firestore
  async addEffectToGroup(groupId: string, effectName: string, fileUrl: string): Promise<Effect> {
    const user = await this.authService.currentUserSig();
    if (user) {
      const groupDocRef = doc(this.firestore, `users/${user.uid}/effectsGroups/${groupId}`);
      const effectData = { name: effectName, url: fileUrl };
      const groupRef = collection(groupDocRef, 'effects');
      const docRef = await addDoc(groupRef, effectData);
      return { id: docRef.id, name: effectName, groupId: groupId, url: fileUrl };
    }
    throw new Error('User not logged in');
  }

  // Fetch effects for a specific group
  async getEffectsForGroup(groupId: string): Promise<Effect[]> {
    const user = this.authService.currentUserSig();
    if (user) {
      const effectsCollectionRef = collection(this.firestore, `users/${user.uid}/effectsGroups/${groupId}/effects`);
      const snapshot = await getDocs(effectsCollectionRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data()['name'],
        url: doc.data()['url'],
        groupId: groupId
      }));
    }
    throw new Error('User not logged in');
  }

  // Delete an effect from Firestore and Firebase Storage
  async deleteEffect(groupId: string, effectId: string, effectUrl: string): Promise<void> {
    const user = this.authService.currentUserSig();
    if (user) {
      try {
        // Delete the file from Firebase Storage
        const fileRef = ref(this.storage, effectUrl);
        await deleteObject(fileRef);

        // Delete the effect document from Firestore
        const effectDocRef = doc(this.firestore, `users/${user.uid}/effectsGroups/${groupId}/effects/${effectId}`);
        await deleteDoc(effectDocRef);

      } catch (error) {
        console.error('Error deleting effect:', error);
        throw new Error('Failed to delete effect');
      }
    } else {
      throw new Error('User not logged in');
    }
  }

  beautifyFileName(fileName: string): string {
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
    const nameWithSpaces = nameWithoutExtension.replace(/[-_]/g, " ");
    return nameWithSpaces.replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

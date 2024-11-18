import {Inject, inject, Injectable} from '@angular/core';
import {addDoc, collection, deleteDoc, doc, Firestore, getDocs} from '@angular/fire/firestore';

import {DOCUMENT} from '@angular/common';
import {Header, Preset, Track} from './preset';
import {AuthService} from '../../core/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private localStorage;
  private localStorageKey = 'presets';
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.localStorage = document.defaultView?.localStorage;
  }

  //#region Preset operations

  async addPreset(newPresetName: string): Promise<Preset | void> {
    const user = await this.authService.currentUserSig(); // Get the user object

    if (user) {
      try {
        // If user is logged in, add preset to Firestore
        const presetsCollectionRef = collection(this.firestore, `users/${user.uid}/presets`);
        const presetData = {
          name: newPresetName,
        }; // Prepare preset data with the new structure

        const docRef = await addDoc(presetsCollectionRef, presetData); // Automatically generates the ID
        // Return the newly created preset including the auto-generated id
        return { id: docRef.id, name: newPresetName, ambienceHeaders: [], musicHeaders: []};
      } catch (error) {
        console.error('Error adding preset to Firestore:', error);
      }
    } else {
      if (this.localStorage) {
        // Get current presets from local storage or initialize empty array
        let presets: Preset[] = JSON.parse(this.localStorage.getItem(this.localStorageKey) || '[]');

        // Create new preset object
        const newPreset: Preset = {
          id: crypto.randomUUID(), // Generate unique ID for the preset
          name: newPresetName,
          ambienceHeaders: [],
          musicHeaders: []
        };

        // Add the new preset to the presets array
        presets.push(newPreset);

        // Save the updated presets array back to local storage
        this.localStorage.setItem(this.localStorageKey, JSON.stringify(presets));

        // Return the newly created preset
        return newPreset;
      }
    }
  }

  async getPresets(): Promise<Preset[]> {
    const user = await this.authService.currentUserSig(); // Get the user object

    if (user) {
      // If user is logged in, fetch presets from Firestore
      const presetsCollectionRef = collection(this.firestore, `users/${user.uid}/presets`);

      const snapshot = await getDocs(presetsCollectionRef);

      return snapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data['name'],
          ambienceHeaders: data['ambience-headers'] || [],
          musicHeaders: data['music-headers'] || []
        }; // Ensure correct structure
      });
    } else {
      if (this.localStorage) {
        // Fetch presets from local storage or return an empty array if none exist
        let presets: Preset[] = JSON.parse(this.localStorage.getItem(this.localStorageKey) || '[]');

        // If no presets exist, create a new "Default Local" preset
        if (presets.length === 0) {
          const defaultPreset: Preset = {
            id: crypto.randomUUID(), // Generate unique ID for the preset
            name: 'Default Local',
            ambienceHeaders: [],
            musicHeaders: [
              {
                id: crypto.randomUUID(), // Generate unique ID for the header
                name: 'Default Local',
                tracks: []
              }
            ]
          };

          // Add the default preset to the presets array
          presets = [defaultPreset];

          // Save the updated presets array back to local storage
          this.localStorage.setItem(this.localStorageKey, JSON.stringify(presets));
        }

        return presets;
      }

    }
    return [];
  }

  async deletePreset(presetId: string): Promise<void> {
    const user = await this.authService.currentUserSig(); // Get the user object

    if (user) {
      try {
        // If user is logged in, delete preset from Firestore
        const presetDocRef = doc(this.firestore, `users/${user.uid}/presets/${presetId}`);
        await deleteDoc(presetDocRef); // Delete the document by its reference
      } catch (error) {
        console.error('Error deleting preset from Firestore:', error);
      }
    } else {
      if (this.localStorage) {
        // Get current presets from local storage
        let presets: Preset[] = JSON.parse(this.localStorage.getItem(this.localStorageKey) || '[]');

        // Filter out the preset to be deleted
        presets = presets.filter(preset => preset.id !== presetId);

        // Save the updated presets array back to local storage
        this.localStorage.setItem(this.localStorageKey, JSON.stringify(presets));
      }
    }
  }


  //#endregion

  //#region Header operations

  async addHeader(presetId: string, type: 'music' | 'ambience', headerName: string): Promise<Header| null> {
    const newHeader = { name: headerName };

    const user = await this.authService.currentUserSig(); // Check if the user is logged in

    if (user) {
      // If user is logged in, add header to Firestore
      const headersDocRef = collection(this.firestore, `users/${user.uid}/presets/${presetId}/${type}-headers`);

      const docRef = await addDoc(headersDocRef, newHeader); // Set the new header

      return { id: docRef.id, name: headerName, tracks: [] }

    } else {
      if (this.localStorage) {
        // Get current presets from local storage
        let presets: Preset[] = JSON.parse(this.localStorage.getItem(this.localStorageKey) || '[]');

        // Find the preset where the header needs to be added
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
          // Create a new header
          const newHeader: Header = {
            id: crypto.randomUUID(), // Generate unique ID for the header
            name: headerName,
            tracks: []
          };

          // Add the header to the correct type (music or ambience)
          if (type === 'music') {
            preset.musicHeaders.push(newHeader);
          } else if (type === 'ambience') {
            preset.ambienceHeaders.push(newHeader);
          }

          // Save the updated presets array back to local storage
          this.localStorage.setItem(this.localStorageKey, JSON.stringify(presets));

          // Return the new header
          return newHeader;
        }
      }

    }

    return null; // Return null if the preset was not found
  }

  async getHeaders(presetId: string): Promise<{ musicHeaders: Header[]; ambienceHeaders: Header[] }> {
    const user = await this.authService.currentUserSig(); // Get the user object
    if (user) {
      // If user is logged in, fetch headers from Firestore
      const musicHeadersRef = collection(this.firestore, `users/${user.uid}/presets/${presetId}/music-headers`);

      const musicHeadersCollection = await getDocs(musicHeadersRef);

      const musicHeaders: Header[] = musicHeadersCollection.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data['name'],
          tracks: data['tracks'] || []
        }; // Ensure correct structure
      });

      // If user is logged in, fetch headers from Firestore
      const ambienceHeadersRef = collection(this.firestore, `users/${user.uid}/presets/${presetId}/ambience-headers`);

      const ambienceHeadersCollection = await getDocs(ambienceHeadersRef);

      const ambienceHeaders: Header[] = ambienceHeadersCollection.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data['name'],
          tracks: data['tracks'] || []
        }; // Ensure correct structure
      });

      return {musicHeaders, ambienceHeaders};
    }
    if (this.localStorage) {
      // Get current presets from local storage
      let presets: Preset[] = JSON.parse(this.localStorage.getItem(this.localStorageKey) || '[]');

      // Find the preset by its ID
      const preset = presets.find(p => p.id === presetId);
      if (preset) {
        return {
          musicHeaders: preset.musicHeaders,
          ambienceHeaders: preset.ambienceHeaders
        };
      }
    }


    return { musicHeaders: [], ambienceHeaders: [] }; // Return empty arrays if no data found
  }

  async deleteHeader(presetId: string, type: 'music' | 'ambience', headerId: string): Promise<boolean> {
    const user = await this.authService.currentUserSig(); // Get the user object

    if (user) {
      // If user is logged in, delete header from Firestore
      const headerDocRef = doc(this.firestore, `users/${user.uid}/presets/${presetId}/${type}-headers/${headerId}`);

      try {
        await deleteDoc(headerDocRef); // Delete the document in Firestore
        return true; // Return true if the delete was successful
      } catch (error) {
        console.error('Error deleting header:', error);
        return false; // Return false if an error occurred
      }
    } else {
      if (this.localStorage) {
        // Get current presets from local storage
        let presets: Preset[] = JSON.parse(this.localStorage.getItem(this.localStorageKey) || '[]');

        // Find the preset where the header needs to be deleted
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
          // Remove the header from the corresponding header list
          if (type === 'music') {
            preset.musicHeaders = preset.musicHeaders.filter(header => header.id !== headerId);
          } else if (type === 'ambience') {
            preset.ambienceHeaders = preset.ambienceHeaders.filter(header => header.id !== headerId);
          }

          // Save the updated presets array back to local storage
          this.localStorage.setItem(this.localStorageKey, JSON.stringify(presets));
        }
      }

    }

    return false;
  }

  //#endregion

  //#region Track operations
  async addTrack(presetId: string, type: 'music' | 'ambience', headerId: string, trackName: string, trackUrl: string): Promise<Track| null>{

    const user = await this.authService.currentUserSig(); // Get the user object
    const newTrack = { name: trackName, url: trackUrl };

    if (user) {
      // If user is logged in, add header to Firestore
      const tracksRef = collection(this.firestore, `users/${user.uid}/presets/${presetId}/${type}-headers/${headerId}/tracks`);

      const docRef = await addDoc(tracksRef, newTrack); // Set the new header

      return { id: docRef.id, name: newTrack.name, url: newTrack.url }

    } else {
      if (this.localStorage) {
        // Get current presets from local storage
        let presets: Preset[] = JSON.parse(this.localStorage.getItem(this.localStorageKey) || '[]');

        // Find the preset by ID
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
          // Find the header by ID within the selected preset
          const header = type === 'music'
            ? preset.musicHeaders.find(h => h.id === headerId)
            : preset.ambienceHeaders.find(h => h.id === headerId);

          if (header) {
            // Create a new track object
            const newTrack: Track = {
              id: crypto.randomUUID(), // Generate unique ID for the track
              name: trackName,
              url: trackUrl
            };

            // Add the new track to the header's tracks array
            header.tracks.push(newTrack);

            // Save the updated presets array back to local storage
            this.localStorage.setItem(this.localStorageKey, JSON.stringify(presets));

            // Return the new track
            return newTrack;
          }
        }
      }

    }

    return null; // Return null if the preset was not found

  }

  async getTracks(presetId: string, type: 'music' | 'ambience', headerId: string): Promise<Track[] | null> {
    const user = await this.authService.currentUserSig(); // Get the current user

    if (user) {
      // If the user is logged in, fetch tracks from Firestore
      const tracksRef = collection(this.firestore, `users/${user.uid}/presets/${presetId}/${type}-headers/${headerId}/tracks`);

      try {
        const tracksSnapshot = await getDocs(tracksRef); // Fetch the tracks collection
        return tracksSnapshot.docs.map(doc => {
          const trackData = doc.data() as Track;
          return {id: doc.id, name: trackData['name'], url: trackData['url']};
        }); // Return the list of tracks
      } catch (error) {
        console.error('Error fetching tracks:', error);
        return null; // Return null in case of an error
      }
    } else {
      if (this.localStorage) {
        // Get current presets from local storage
        let presets: Preset[] = JSON.parse(this.localStorage.getItem(this.localStorageKey) || '[]');

        // Find the preset and header
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
          const header = type === 'music'
            ? preset.musicHeaders.find(h => h.id === headerId)
            : preset.ambienceHeaders.find(h => h.id === headerId);

          if (header) {
            return header.tracks;
          }
        }
      }

    }

    return null; // Return null if user not found
  }

  async deleteTrack(presetId: string, type: 'music' | 'ambience', headerId: string, trackId: string): Promise<boolean> {
    const user = await this.authService.currentUserSig(); // Get the user object

    if (user) {
      // Reference to the specific track in Firestore
      const trackDocRef = doc(this.firestore, `users/${user.uid}/presets/${presetId}/${type}-headers/${headerId}/tracks/${trackId}`);

      try {
        await deleteDoc(trackDocRef); // Delete the track document
        console.log('Track successfully deleted:', trackId);
        return true;
      } catch (error) {
        console.error('Error deleting track:', error);
        return false;
      }
    } else {
      if (this.localStorage) {
        // Get current presets from local storage
        let presets: Preset[] = JSON.parse(this.localStorage.getItem(this.localStorageKey) || '[]');

        // Find the preset and header
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
          const header = type === 'music'
            ? preset.musicHeaders.find(h => h.id === headerId)
            : preset.ambienceHeaders.find(h => h.id === headerId);

          if (header) {
            // Remove the track from the header's track list
            header.tracks = header.tracks.filter(track => track.id !== trackId);

            // Save the updated presets array back to local storage
            this.localStorage.setItem(this.localStorageKey, JSON.stringify(presets));
          }
        }
      }

    }

    return false; // Return false if the user is not found or deletion fails
  }

  //#endregion

}

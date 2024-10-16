import { Component, effect, Inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import {ProgressBarMode, MatProgressBarModule} from '@angular/material/progress-bar';

import { Effect, EffectsGroup } from '../shared/effects';
import { FormBuilder, ReactiveFormsModule, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { EffectsService } from '../shared/effects.service';
import { DOCUMENT } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { GroupDialogComponent } from '../group-dialog/group-dialog.component';
import { NgxFileDropEntry, FileSystemFileEntry, NgxFileDropModule } from 'ngx-file-drop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-effects',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatButtonModule,
    MatProgressBarModule,
    MatGridListModule,
    MatCardModule,
    MatTooltipModule,
    NgxFileDropModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    NgIf
  ],
  templateUrl: './effects.component.html',
  styleUrl: './effects.component.css'
})
export class EffectsComponent {

  effectsGroups: EffectsGroup[] = [];
  selectedGroup: EffectsGroup | undefined = undefined;
  effects: Effect[] = [];
  uploadForm: FormGroup;
  showUploadForm: boolean = false;
  droppedFiles: NgxFileDropEntry[] = [];
  uploadProgress: { [key: string]: number } = {};
  uploadInProgress: boolean = false;

  constructor(
    private effectsService: EffectsService,
    private fb: FormBuilder,
    private dialog: MatDialog,

    @Inject(DOCUMENT) private document: Document
  ) {
    // Initializing the upload form
    this.uploadForm = this.fb.group({
      groupName: ['', Validators.required],
      effectFile: [null, Validators.required]
    });

    effect(()=>{
      this.effectsService.getEffectsGroups().then((groups) => {
        this.effectsGroups = groups;
        this.selectedGroup = this.effectsGroups.length ? this.effectsGroups[0] : undefined;
        this.selectedGroup ? this.updateEffectsList(this.selectedGroup.id) : this.effects = [];
      });
    })

    // Subscribe to the upload progress events
    this.effectsService.uploadProgress.subscribe(({ fileName, progress }) => {
      this.uploadProgress[fileName] = progress;
    });
  }

  // Toggle the visibility of the upload form
  toggleUploadVisibility(): void {
    this.showUploadForm = !this.showUploadForm;
  }

  //#region File Upload

  // Handle file drop event
  dropped(files: NgxFileDropEntry[]): void {
    const newFiles = files.filter(file => file.fileEntry.isFile);
    this.droppedFiles.push(...newFiles);
  }

  // Remove file from the dropped files list
  removeFile(fileName: string): void {
    this.droppedFiles = this.droppedFiles.filter(file => file.fileEntry.name !== fileName);
    delete this.uploadProgress[fileName];
  }

  // Clear all files from the dropped files list
  clearAllFiles(): void {
    this.droppedFiles = [];
    this.uploadProgress = {};
  }
  //#endregion

  //#region Effects Group operations

   // Method to create a new effects group
   addGroup(): void {
    const dialogRef = this.dialog.open(GroupDialogComponent, {
      width: '250px',
      data: { groups: this.effectsGroups, id: null }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result && result.action === 'save') {
        try {
          const newGroup = await this.effectsService.addEffectsGroup(result.name);
          if (newGroup) {
            this.effectsGroups.push(newGroup);

          }
        } catch (error) {
          console.error('Error adding effects group:', error);
        }
      }
    });
  }

  // Method to delete an effects group
  deleteGroup(): void {
    if (this.selectedGroup) {
      const dialogRef = this.dialog.open(GroupDialogComponent, {
        width: '250px',
        data: { groups: this.effectsGroups, id: this.selectedGroup.id }
      });

      dialogRef.afterClosed().subscribe(async result => {
        if (result && result.action === 'delete') {
          try {
            await this.effectsService.deleteEffectsGroup(result.id);
            this.effectsGroups = this.effectsGroups.filter(group => group.id !== result.id);
            this.selectedGroup = this.effectsGroups.length ? this.effectsGroups[0] : undefined;
          } catch (error) {
            console.error('Error deleting effects group:', error);
          }
        }
      });
    } else {
      alert('Select a group to delete.');
    }
  }

  //#endregion

  // Method to submit the upload form
  async onSubmit(): Promise<void> {
    if (this.selectedGroup) {
      this.uploadInProgress = true; // Set upload in progress to true

      const files: File[] = [];
      for (const droppedFile of this.droppedFiles) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => files.push(file));
      }

      try {
        await this.effectsService.uploadFiles(this.selectedGroup.id, files).then(() => {
          this.uploadInProgress = false;
          this.clearAllFiles(); // Clear files after successful upload
          this.showUploadForm = false;
        });
        // Refresh the effects list after successful upload
        this.updateEffectsList(this.selectedGroup.id);
      } catch (error) {
        alert('Error uploading files: ' + error);
      }
    }
  }

  // Method to handle click on delete icon to remove an effect
  deleteEffect(effect: Effect): void {
    if (this.selectedGroup) {
      this.effectsService.deleteEffect(this.selectedGroup.id, effect.id, effect.url)
        .then(() => {
          console.log('Effect deleted successfully');
          // Remove the effect from the local list
          this.selectedGroup!.effects = this.selectedGroup!.effects.filter(e => e.id !== effect.id);
          this.updateEffectsList(this.selectedGroup!.id);
        })
        .catch((error) => {
          console.error('Error deleting effect:', error);
        });
    }
  }

  // Method to update effects list whenever the selected group changes
  updateEffectsList(groupId: string): void {
    this.effectsService.getEffectsForGroup(groupId).then(effects => {
      this.effects = effects;

    }).catch(error => {
      console.error('Error fetching effects:', error);
    });
  }

  // Triggered when group selection changes
  onGroupSelectionChange(): void {
    if (this.selectedGroup) {
      this.updateEffectsList(this.selectedGroup.id);
    }
  }

  // Method to play the effect audio
  playEffect(effect: Effect): void {
    const audio = new Audio(effect.url);
    audio.play();
  }

}

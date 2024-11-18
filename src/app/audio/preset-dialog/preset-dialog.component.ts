import {Component, Inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import { NgIf } from '@angular/common';

import { Preset } from '../shared/preset';

@Component({
  selector: 'app-preset-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    NgIf,
  ],
  templateUrl: './preset-dialog.component.html',
  styleUrl: './preset-dialog.component.css'
})

export class PresetDialogComponent {
  presetName: string = '';
  isDeleteMode: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PresetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { presets: Preset[], id: string | null }
  ) {
    // If id is not null, we're in delete mode
    if (data.id !== null) {
      this.isDeleteMode = true;
      const presetToDelete = this.data.presets.find(preset => preset.id === this.data.id);
      if (presetToDelete) {
        this.presetName = presetToDelete.name; // Pre-fill name for deletion confirmation
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.isDeleteMode) {
      // Returning deletion confirmation
      this.dialogRef.close({ action: 'delete', id: this.data.id });
    } else {
      // Checking for name conflicts before saving
      const nameExists = this.data.presets.some(preset => preset.name.toLowerCase() === this.presetName.toLowerCase());
      if (!nameExists) {
        this.dialogRef.close({ action: 'save', name: this.presetName });
      } else {
        alert('Preset with this name already exists! Please choose another name.');
      }
    }
  }
}

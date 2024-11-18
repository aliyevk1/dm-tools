import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { EffectsGroup } from '../shared/effects';

@Component({
  selector: 'app-group-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    MatButtonModule,
    NgIf,
  ],
  templateUrl: './group-dialog.component.html',
  styleUrl: './group-dialog.component.css'
})
export class GroupDialogComponent {
  groupName: string = '';
  isDeleteMode: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<GroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { groups: EffectsGroup[], id: string | null }
  ) {
    // If id is not null, we're in delete mode
    if (data.id !== null) {
      this.isDeleteMode = true;

      const groupToDelete = this.data.groups.find(group => group.id === this.data.id);
      if (groupToDelete) {
        this.groupName = groupToDelete.name; // Pre-fill name for deletion confirmation
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
      const nameExists = this.data.groups.some(group => group.name.toLowerCase() === this.groupName.toLowerCase());
      if (!nameExists) {
        this.dialogRef.close({ action: 'save', name: this.groupName });
      } else {
        alert('group with this name already exists! Please choose another name.');
      }
    }
  }
}

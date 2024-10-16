import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { Header } from '../shared/preset'; // Adjust the import according to your project structure

@Component({
  selector: 'app-header-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    MatButtonModule,
    NgIf,
  ],
  templateUrl: './header-dialog.component.html',
  styleUrls: ['./header-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderDialogComponent {
  headerName: string = '';
  isDeleteMode: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<HeaderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { headers: Header[], id: string | null }
  ) {
    // If id is not null, we're in delete mode
    if (data.id !== null) {
      this.isDeleteMode = true;
      
      const headerToDelete = this.data.headers.find(header => header.id === this.data.id);
      if (headerToDelete) {
        this.headerName = headerToDelete.name; // Pre-fill name for deletion confirmation
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
      const nameExists = this.data.headers.some(header => header.name.toLowerCase() === this.headerName.toLowerCase());
      if (!nameExists) {
        this.dialogRef.close({ action: 'save', name: this.headerName });
      } else {
        alert('Header with this name already exists! Please choose another name.');
      }
    }
  }
}
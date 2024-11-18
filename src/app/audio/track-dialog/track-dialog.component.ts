import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; // Import MatSelectModule
import { NgIf, NgForOf} from '@angular/common';
import { YoutubeUrlDirective } from '../shared/youtubeurl.directive';

@Component({
  selector: 'app-track-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    NgIf,
    YoutubeUrlDirective
  ],
  templateUrl: './track-dialog.component.html',
  styleUrls: ['./track-dialog.component.css']
})
export class TrackDialogComponent {
  trackName: string = '';
  trackUrl: string = '';

  constructor(
    public dialogRef: MatDialogRef<TrackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      type: 'music' | 'ambience',
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.trackName && this.trackUrl && this.checkUrlValidity()) {
      this.dialogRef.close({
        name: this.trackName,
        url: this.extractVideoId(this.trackUrl),
      });
    } else {
      alert('Track name and URL are required.');
    }
  }

  extractVideoId(url: string): string {
    const regex = /[?&]v=([^&]+)/;
    const match = url.match(regex);
    return match && match[1] ? match[1] : '';
  }

  checkUrlValidity() {
    const pattern = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return pattern.test(this.trackUrl);
  }
}

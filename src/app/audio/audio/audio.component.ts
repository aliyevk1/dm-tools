import { Component, effect, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';

import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgStyle, SlicePipe } from '@angular/common';

import {YouTubePlayer} from '@angular/youtube-player';

import { PresetDialogComponent } from '../preset-dialog/preset-dialog.component';
import { Header, Preset, Track } from '../shared/preset';
import { AudioService } from '../shared/audio.service';
import { TrackDialogComponent } from '../track-dialog/track-dialog.component';
import { HeaderDialogComponent } from '../header-dialog/header-dialog.component';
import {MatTab, MatTabGroup} from '@angular/material/tabs';


NgFor
@Component({
  selector: 'app-audio',
  standalone: true,
  imports: [
    MatSelectModule,
    MatIconModule,
    MatListModule,
    MatSliderModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    MatGridListModule,
    MatAccordion, MatExpansionModule,
    YouTubePlayer,
    FormsModule,
    NgFor,
    NgIf, MatTab, MatTabGroup
  ],
  templateUrl: './audio.component.html',
  styleUrl: './audio.component.css'
})
export class AudioComponent {
  presets: Preset[] = [];
  selectedPreset: Preset | undefined = undefined;
  audioService: AudioService = inject(AudioService);

  activeTab: string = 'music';

  selectedMusicTrack: Track | undefined = undefined;
  selectedAmbienceTrack: Track | undefined = undefined;

  constructor(public dialog: MatDialog) {
    effect(()=>{
      this.audioService.getPresets().then((presets) => {
        this.presets = presets;
        this.selectedPreset = this.presets.length ? this.presets[0] : undefined;

        this.updateHeaders();
      });
    })
  }

  deleteTrack(type: 'music' | 'ambience', headerId: string, trackId: string) {
    if (!this.selectedPreset) {
      console.error("No preset selected");
      return;
    }

    const headerList = type === 'music'
      ? this.selectedPreset.musicHeaders
      : this.selectedPreset.ambienceHeaders;

    // Find the header to which the track belongs
    const header = headerList.find(h => h.id === headerId);

    if (!header) {
      console.error("Header not found");
      return;
    }

    // Call the service to delete the track
    this.audioService.deleteTrack(this.selectedPreset.id, type, headerId, trackId)
      .then(() => {
        // Update the local state by removing the track
        header.tracks = header.tracks.filter(track => track.id !== trackId);
        console.log("Track deleted and local state updated");
      })
      .catch(error => {
        console.error('Error deleting track:', error);
      });
  }


  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  addPreset(): void {

    const dialogRef = this.dialog.open(PresetDialogComponent, {
      width: '250px',
      data: { presets: this.presets, id: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'save') {
        this.audioService.addPreset(result.name).then((savedPreset) => {
          if (savedPreset) {
            this.presets.push(savedPreset); // Push the saved preset if it exists
          }
        });
      }
    });
  }

  deletePreset(): void {

    if (this.presets.length < 2) {
      alert("Minimum number of presets is one.");
      return;
    }

    if (this.selectedPreset) {
      const dialogRef = this.dialog.open(PresetDialogComponent, {
        width: '250px',
        data: { presets: this.presets, id: this.selectedPreset.id }  // Passing the preset ID for deletion
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.action === 'delete') {
          // Call the service to delete the preset
          this.audioService.deletePreset(result.id).then(() => {
            // Remove the preset from the local array after successful deletion
            this.presets = this.presets.filter(preset => preset.id !== result.id);
          }).catch(error => {
            console.error('Error deleting preset:', error);
          });
        }
      });
    } else {
      alert("Select a preset to delete.");
    }
  }

  openCreateHeaderDialog(type: 'music' | 'ambience'): void {
    const headers = type === 'music'
      ? this.selectedPreset?.musicHeaders
      : type === 'ambience'
        ? this.selectedPreset?.musicHeaders
        : [];

    const dialogRef = this.dialog.open(HeaderDialogComponent, {
      data: { headers, id: null },
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result && this.selectedPreset) {
        if (result.action === 'save') {
          // Call the addHeader method from the AudioService
          const presetId = this.selectedPreset.id; // Get the preset ID
          const newHeader = await this.audioService.addHeader(presetId, type, result.name);

          if (newHeader) {
            // Log the result for now
            console.log('New header added:', newHeader);
            // You might also want to add the new header to the local state if needed
            const headerList = type === 'music'
              ? this.selectedPreset.musicHeaders
              : this.selectedPreset.ambienceHeaders;

            // Add the new header to the local array
            headerList.push(newHeader);
          }
        }
      }
    });
  }

  openDeleteHeaderDialog(type: 'music' | 'ambience', headerId: string): void {
      const headers = type === 'music'
      ? this.selectedPreset?.musicHeaders
      : type === 'ambience'
        ? this.selectedPreset?.ambienceHeaders
        : [];

    const dialogRef = this.dialog.open(HeaderDialogComponent, {
      data: { headers, id: headerId },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'delete' && this.selectedPreset != undefined) {
        // Logic to delete the header

        if (type === 'music') {
          this.selectedPreset.musicHeaders = this.selectedPreset.musicHeaders.filter(header => header.id !== result.id);
        } else if (type === 'ambience') {
          this.selectedPreset.ambienceHeaders = this.selectedPreset.ambienceHeaders.filter(header => header.id !== result.id);
        }

        this.audioService.deleteHeader(this.selectedPreset.id, type, result.id);
      }
    });
  }

  openCreateTrackDialog(type: 'music' | 'ambience', headerId: string): void {
    const dialogRef = this.dialog.open(TrackDialogComponent, {
      data: { type } // Pass the type (music or ambience) to the dialog
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result && this.selectedPreset) {
        // Add the track using audioService
        const newTrack = await this.audioService.addTrack(this.selectedPreset.id, type, headerId, result.name, result.url);

        if (newTrack) {
          // Find the relevant header in the selectedPreset
          const headerList = type === 'music'
            ? this.selectedPreset.musicHeaders
            : this.selectedPreset.ambienceHeaders;

          // Find the specific header by its ID
          const header = headerList.find(h => h.id === headerId);

          if (header) {
            // Add the new track to the header's tracks array
            header.tracks.push(newTrack);
          }

          console.log('Track added and updated in local state:', newTrack);
        }
      }
    });
  }

  private async updateHeaders(): Promise<void> {
    if (this.selectedPreset) {
      const presetId = this.selectedPreset.id;

      try {
        // Fetch music and ambience headers
        const { musicHeaders, ambienceHeaders } = await this.audioService.getHeaders(presetId);

        if (this.selectedPreset) {
          this.selectedPreset.musicHeaders = await this.updateTracksForHeaders(musicHeaders, 'music');
          this.selectedPreset.ambienceHeaders = await this.updateTracksForHeaders(ambienceHeaders, 'ambience');
        }
      } catch (error) {
        console.error('Error updating headers:', error);
      }
    }
  }

  private async updateTracksForHeaders(headers: Header[], type: 'music' | 'ambience'): Promise<Header[]> {
    const updatedHeaders = await Promise.all(
      headers.map(async (header) => {
        const tracks = await this.audioService.getTracks(this.selectedPreset!.id, type, header.id);
        return { ...header, tracks: tracks || [] }; // Return the header with updated tracks
      })
    );
    return updatedHeaders;
  }

  setTrack(type: 'music' | 'ambience', track: Track): void {
    if (type === 'music') {
      this.selectedMusicTrack = track;
    } else if (type === 'ambience') {
      this.selectedAmbienceTrack = track;
    }
    this.setActiveTab(type);
  }

}

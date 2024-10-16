import {Component, Inject, OnInit} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {FormsModule} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {GeneratorsService} from '../../generators/shared/generators.service';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {DOCUMENT, NgIf} from '@angular/common';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatIcon} from '@angular/material/icon';
import {Note} from '../../generators/shared/generators';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    MatCard,
    MatCardTitle,
    MatCardHeader,
    MatCardContent,
    MatLabel,
    FormsModule,
    MatFormField,
    MatInput,
    MatButton,
    NgIf,
    MatProgressBar,
    MatIcon
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css'
})
export class NotesComponent implements OnInit {

  private readonly localStorage;
  userNotes: string = '';
  summarizedNotes: Note | null = null;
  isLoading: boolean = false;

  constructor(private http: HttpClient,
              private snackBar: MatSnackBar,
              private generatorsService: GeneratorsService,
              @Inject(DOCUMENT) private document: Document) {
    this.localStorage = document.defaultView?.localStorage;
  }

  ngOnInit(): void {
    // Load notes from local storage on initialization
    if(this.localStorage) {
      const savedNotes = this.localStorage.getItem('userNotes');
      if (savedNotes) {
        this.userNotes = savedNotes;
      }
    }
  }

  onKeyDown(): void {
    // Store user notes in local storage every time a key is pressed
    if(this.localStorage)
      this.localStorage.setItem('userNotes', this.userNotes);
  }

  async summarizeNotes(): Promise<void> {
    if (this.userNotes.trim()) {
      this.isLoading = true; // Show progress bar
      try {
        this.summarizedNotes = await this.generatorsService.summarizeNote(this.userNotes);
      } catch (error) {
        this.snackBar.open('Sorry, an error occurred while summarizing your notes. Please try again.', 'Close', { duration: 3000 });
      } finally {
        this.isLoading = false; // Hide progress bar after completion
      }
    } else {
      this.snackBar.open('Please enter some notes to summarize.', 'Close', { duration: 3000 });
    }
  }
}

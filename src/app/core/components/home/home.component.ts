import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { NgIf } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CustomSidenavComponent } from "../custom-sidenav/custom-sidenav.component";
import { DrawerService } from '../../shared/drawer.service';
import { AudioComponent } from "../../../audio/audio/audio.component";
import { EffectsComponent } from '../../../effects/effects/effects.component';
import { GeneratorsComponent } from '../../../generators/generators/generators.component';
import {NotesComponent} from '../../../notes/notes/notes.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgIf,
    MatSidenavModule,
    CustomSidenavComponent,
    AudioComponent,
    EffectsComponent,
    GeneratorsComponent,
    NotesComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {
  authService: AuthService = inject(AuthService);
  opened = false;  // Default state
  selectedItem = 'audio';

  drawerService = inject(DrawerService);  // Inject the service

  ngOnInit() {
    this.drawerService.drawerState$.subscribe((isOpen: boolean) => {
      this.opened = isOpen;
    });

    this.drawerService.selectedItem$.subscribe((item) => {
      this.selectedItem = item;
    });
  }

  isLoggedIn(): boolean {
    return this.authService.currentUserSig() != null;
  }
}

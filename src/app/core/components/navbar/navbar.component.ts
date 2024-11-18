import { Component, inject } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth.service';
import { NgIf, CommonModule } from '@angular/common';
import { DrawerService } from '../../shared/drawer.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule,
      MatButtonModule,
      MatIconModule,
      MatMenuModule,
      RouterLink,
      NgIf,
      CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  authService = inject(AuthService);
  drawerService = inject(DrawerService);

  constructor(
    matIconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer) {

    matIconRegistry.addSvgIcon(
      'd20-dice_icon',
      sanitizer.bypassSecurityTrustResourceUrl('/dice-d20.svg')
    );
  }

  logout(): void {
    this.authService.logout();
  }

  toggleDrawer() {
    this.drawerService.toggleDrawer();  // Call the toggle method
  }
}

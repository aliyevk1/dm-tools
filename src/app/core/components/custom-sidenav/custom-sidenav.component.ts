import {Component} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import { DrawerService } from '../../shared/drawer.service';

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatDividerModule],
  templateUrl: './custom-sidenav.component.html',
  styleUrl: './custom-sidenav.component.css'
})
export class CustomSidenavComponent {
  selectedItem = 'audio';
  constructor(private drawerService: DrawerService) {}

  selectItem(item: string) {
    this.drawerService.selectItem(item);
    this.selectedItem = item;
  }

  openGitHubLink(): void {
    window.open('https://github.com/your-repository', '_blank');
  }
}

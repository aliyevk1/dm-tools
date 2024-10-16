import {Component, Input} from '@angular/core';
import {NPC} from '../shared/generators';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-statblock',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './statblock.component.html',
  styleUrl: './statblock.component.css'
})
export class StatblockComponent {
    @Input() npc: NPC | undefined;
}

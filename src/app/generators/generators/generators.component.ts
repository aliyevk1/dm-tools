import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {GeneratorsService} from '../shared/generators.service';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
import {StatblockComponent} from '../statblock/statblock.component';
import {Item, NPC, Shop, Tavern} from '../shared/generators';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-generators',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatIcon,
    MatFormField,
    MatLabel,
    FormsModule,
    MatInput,
    MatButton,
    StatblockComponent,
    MatProgressSpinner,
    MatIconButton,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatTooltip,
    MatOption
  ],
  templateUrl: './generators.component.html',
  styleUrl: './generators.component.css'
})
export class GeneratorsComponent {
  constructor(private generatorsService: GeneratorsService, private snackBar: MatSnackBar) { }

  prompt: string = '';
  response: string = '';
  npc: NPC | null = null;
  tavern: Tavern | null = null;
  shop: Shop | null = null;
  names: string[] = [];

  itemSearch: string = '';
  itemResults: any[] = [];

  isLoadingNames: boolean = false;
  isLoadingShop: boolean = false;
  isLoadingTavern: boolean = false;
  isLoadingNPC: boolean = false;

  async generateTavern(prompt: string): Promise<void> {
    if (prompt.trim()) {
      this.isLoadingTavern = true;
      try {
        this.tavern = await this.generatorsService.generateTavern(prompt);
      } catch (error) {
        this.snackBar.open('Sorry, an error occurred. Please try again.', 'Close', { duration: 3000 });
      } finally {
        this.isLoadingTavern = false;
      }
    }
  }

  async generateNPC(prompt: string): Promise<void> {
    if (prompt.trim()) {
      this.isLoadingNPC = true;
      try {
        this.npc = await this.generatorsService.generateNPC(prompt);
      } catch (error) {
        this.snackBar.open('Sorry, an error occurred. Please try again.', 'Close', { duration: 3000 });
      } finally {
        this.isLoadingNPC = false;
      }
    }
  }

  async generateShop(prompt: string): Promise<void> {
    if (prompt.trim()) {
      this.isLoadingShop = true;
      try {
        this.shop = await this.generatorsService.generateShop(prompt);
      } catch (error) {
        this.snackBar.open('Sorry, an error occurred. Please try again.', 'Close', { duration: 3000 });
      } finally {
        this.isLoadingShop = false;
      }
    }
  }

  async generateNames(prompt: string): Promise<void> {
    if (prompt.trim()) {
      this.isLoadingNames = true;
      try {
        this.names = await this.generatorsService.generateNames(prompt);
      } catch (error) {
        this.snackBar.open('Sorry, an error occurred. Please try again.', 'Close', { duration: 3000 });
      } finally {
        this.isLoadingNames = false;
      }
    }
  }

  async searchItem(query: string): Promise<void> {
    if (query.trim()) {
      try {
        this.itemResults = await this.generatorsService.searchItem(query);
      } catch (error) {
        console.error('Item search failed', error);
      }
    } else {
      this.itemResults = [];
    }
  }

  async selectItem(item: any): Promise<void> {
    try {
      const itemDetails = await this.generatorsService.getItemDetails(item.url);

      // Set default cost based on item type
      let cost = itemDetails?.cost?.quantity || null;
      let currency = itemDetails?.cost?.unit || 'gp';

      // If it's a magical item without cost, determine cost based on rarity
      if (!cost && itemDetails.rarity) {
        switch (itemDetails.rarity.name.toLowerCase()) {
          case 'common':
            cost = 50; // Default cost for common magical items
            break;
          case 'uncommon':
            cost = 200; // Default cost for uncommon magical items
            break;
          case 'rare':
            cost = 1000; // Default cost for rare magical items
            break;
          case 'very rare':
            cost = 5000; // Default cost for very rare magical items
            break;
          case 'legendary':
            cost = 20000; // Default cost for legendary magical items
            break;
          default:
            cost = 0; // Default if rarity is not recognized
        }
      }

      const newItem: Item = {
        name: itemDetails.name,
        description: itemDetails.desc ? itemDetails.desc.join(' ') : 'No description available.',
        cost: cost,
        currency: currency
      };

      // Add the new item to the shop
      if (this.shop) {
        this.shop.items.push(newItem);
      }

      // Clear search results after selection
      this.itemResults = [];
    } catch (error) {
      console.error('Failed to get item details', error);
    }
  }


  removeItem(itemToRemove: Item): void {
    if (this.shop) {
      this.shop.items = this.shop.items.filter(item => item !== itemToRemove);
    }
  }

  copyTavernToMarkdown(): void {
    if (this.tavern) {
      const markdown = this.generatorsService.tavernToMarkdown(this.tavern);
      navigator.clipboard.writeText(markdown).then(() => {
        console.log('Tavern copied to clipboard in Markdown format');
      }).catch(err => {
        console.error('Failed to copy Tavern to clipboard', err);
      });
    }
  }

  copyNPCToMarkdown(): void {
    if (this.npc) {
      const markdown = this.generatorsService.npcToMarkdown(this.npc);
      navigator.clipboard.writeText(markdown).then(() => {
        console.log('NPC copied to clipboard in Markdown format');
      }).catch(err => {
        console.error('Failed to copy NPC to clipboard', err);
      });
    }
  }

  copyStoreToMarkdown(): void {
    if (this.shop) {
      const markdown = this.generatorsService.shopToMarkdown(this.shop);
      navigator.clipboard.writeText(markdown).then(() => {
        this.snackBar.open('Store copied to clipboard as Markdown!', 'Close', { duration: 3000 });
      });
    }
  }
}

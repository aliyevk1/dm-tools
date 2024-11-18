import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, forkJoin} from 'rxjs';
import {Note, NPC, Shop, Tavern} from './generators';

@Injectable({
  providedIn: 'root'
})
export class GeneratorsService {

  private apiUrl = '';
  private equipmentApiUrl = '';
  private magicalItemsApiUrl = '';

  constructor(private http: HttpClient) {}

  async generateNPC(prompt: string): Promise<NPC> {
    return await firstValueFrom(this.http.post<NPC>(this.apiUrl + 'npc', {prompt}));
  }

  async generateTavern(prompt: string): Promise<Tavern> {
    return await firstValueFrom(this.http.post<Tavern>(this.apiUrl + 'tavern', { prompt }));
  }

  async generateShop(prompt: string): Promise<Shop> {
    return await firstValueFrom(this.http.post<Shop>(`${this.apiUrl}store`, { prompt }));
  }

  async generateNames(prompt: string): Promise<string[]> {
    return await firstValueFrom(this.http.post<string[]>(`${this.apiUrl}name`, { prompt }));
  }

  async summarizeNote(prompt: string): Promise<Note> {
    return await firstValueFrom(this.http.post<Note>(`${this.apiUrl}note`, { prompt }));
  }

  async searchItem(query: string): Promise<any[]> {
    const equipmentRequest = this.http.get<any>(`${this.equipmentApiUrl}?name=${query}`);
    const magicalItemsRequest = this.http.get<any>(`${this.magicalItemsApiUrl}?name=${query}`);

    try {
      const [equipmentResult, magicalItemsResult] = await firstValueFrom(
        forkJoin([equipmentRequest, magicalItemsRequest])
      );

      // Combine the results from both API responses into a single list.
      return [
        ...(equipmentResult?.results || []),
        ...(magicalItemsResult?.results || [])
      ];

    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  }

  async getItemDetails(url: string): Promise<any> {
    return await firstValueFrom(this.http.get<any>(`https://www.dnd5eapi.co${url}`));
  }

  tavernToMarkdown(tavern: Tavern): string {
    return `**Name**: ${tavern.name}
**Appearance Outside**: ${tavern.appearanceOutside}
**Appearance Inside**: ${tavern.appearanceInside}
**Innkeeper**: ${tavern.innkeeper}
**Menu**: ${tavern.menu}
**Possible Activities**: ${tavern.possibleActivity}`;
  }

  // Do not touch the spacing
  npcToMarkdown(npc: NPC): string {
    return `**Name**: ${npc.name}
**Race**: ${npc.race}
**Class**: ${npc.class}, Level ${npc.level}
**Alignment**: ${npc.alignment}
**Armor Class**: ${npc.armorClass}
**Hit Points**: ${npc.hitPoints}
**Speed**: ${npc.speed}

**Abilities**:
- Strength: ${npc.abilities.strength}
- Dexterity: ${npc.abilities.dexterity}
- Constitution: ${npc.abilities.constitution}
- Intelligence: ${npc.abilities.intelligence}
- Wisdom: ${npc.abilities.wisdom}
- Charisma: ${npc.abilities.charisma}

**Skills**: ${npc.skills.join(', ')}
**Senses**: ${npc.senses}
**Languages**: ${npc.languages.join(', ')}
**Challenge Rating**: ${npc.challengeRating}

**Traits**:
${npc.traits.map(trait => `- ${trait}`).join('\n')}

**Actions**:
${npc.actions.map(action => `- ${action}`).join('\n')}

**Appearance**: ${npc.appearance}
**Personality**: ${npc.personality}`;
  }

  shopToMarkdown(shop: Shop): string {
    return `**Name**: ${shop.name}
**Appearance Outside**: ${shop.appearanceOutside}
**Appearance Inside**: ${shop.appearanceInside}
**Shopkeeper**: ${shop.shopkeeper}

**Items**:
${shop.items.map(item => `- **${item.name}**: ${item.description}, Cost: ${item.cost} ${item.currency}`).join('\n')}`;
  }

}

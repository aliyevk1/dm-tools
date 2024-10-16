export interface Tavern {
  name: string;
  appearanceOutside: string;
  appearanceInside: string;
  innkeeper: string;
  menu: string;
  possibleActivity: string;
}

export interface Shop {
  name: string;
  appearanceOutside: string;
  appearanceInside: string;
  shopkeeper: string;
  items: Item[];
}

export interface Item {
  name: string;
  description: string;
  cost: number;
  currency: string;
}

export interface NPC {
  name: string;
  race: string;
  class: string;
  level: number;
  alignment: string;
  armorClass: number;
  hitPoints: number;
  speed: string;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  senses: string;
  languages: string[];
  challengeRating: number;
  traits: string[];
  actions: string[];
  appearance: string;
  personality: string;
}

export interface Note {
  normalizedNotes:string;
}

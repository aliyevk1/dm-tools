export interface Effect {
    id: string;
    name: string;
    groupId: string;
    url: string;
  }
  
  export interface EffectsGroup {
    id:string;
    name: string;
    effects: Effect[];
  }
  
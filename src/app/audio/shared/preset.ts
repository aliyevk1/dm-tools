export interface Track {
  id: string;  
  name: string;  
  url: string;
}

export interface Header {
  id: string;      
  name: string;    
  tracks: Track[]; 
}

export interface Preset {
  id: string;    
  name: string; 
  ambienceHeaders: Header[];  
  musicHeaders: Header[] ;    
}

export enum ProfessionType {
  NONE = 'NONE',
  DOCTOR = 'DOCTOR',
  LAWYER = 'LAWYER',
  MECHANIC = 'MECHANIC',
  ENGINEER = 'ENGINEER',
  FIREFIGHTER = 'FIREFIGHTER',
  HANDYMAN = 'HANDYMAN'
}

export interface EmergencyContact {
  name: string;
  phone: string;
  distance?: string;
  address?: string;
  type: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ProfessionConfig {
  id: ProfessionType;
  title: string;
  roleDescription: string;
  color: string;
  icon: string;
  promptContext: string; // For image generation
  actionVerbs: string[];
}
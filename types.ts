export interface Surah {
  id: number;
  name: string;
  nameEnglish: string;
  verses: string[];
}

export enum AppView {
  HOME = 'HOME',
  RECITATION = 'RECITATION',
}

export interface MessageLog {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

// PCM Audio Types
export interface PcmBlob {
  data: string;
  mimeType: string;
}
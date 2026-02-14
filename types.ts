
export interface Source {
  title: string;
  uri: string;
}

export interface ResearchSession {
  id: string;
  query: string;
  answer: string;
  sources: Source[];
  timestamp: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export enum ResearchStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

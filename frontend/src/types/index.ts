export interface Source {
  filename: string;
  page: number;
}

export interface Message {
  id: string;
  question: string;
  answer: string;
  sources: Source[];
  isLoading?: boolean;
}

export interface HistoryItem {
  id: number;
  question: string;
  answer: string;
  sources: Source[];
  created_at: string;
}

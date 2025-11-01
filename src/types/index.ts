export interface Application {
  id: string;
  name: string;
  initialValue: number;
  startDate: Date;
}

export interface HistoryEntry {
  id: string;
  applicationId: string;
  date: Date;
  grossValue: number;
}
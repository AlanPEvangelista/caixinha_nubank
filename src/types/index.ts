export interface Entry {
  id: string;
  date: Date;
  grossValue: number;
  description: string;
}

export interface Application {
  id: string;
  name: string;
  initialValue: number;
  startDate: Date;
  entries: Entry[];
}
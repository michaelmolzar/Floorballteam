export type PlayerStats = {
  gamesPlayed: number;
  goals?: number;
  assists?: number;
  penaltyMinutes?: number;
  savePercentage?: number;
  goalsAgainstAverage?: number;
};

export type Player = {
  id: string;
  name: string;
  number: number;
  position: string;
  type: 'goalie' | 'field';
  isCaptain?: boolean;
  stats: PlayerStats;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'alert' | 'event';
  readBy: string[];
};

export type TrainingPlan = {
  id: string;
  title: string;
  date: string;
  focus: string;
  pdfUrl?: string;
};

export type Termin = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  type: 'training' | 'game' | 'event';
  description?: string;
};

export type CoachNews = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
};

export type CampusArticle = {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  iconType: 'apple' | 'activity' | 'book';
  color: 'yellow' | 'gray' | 'black';
};

export type AppUser = {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'coach' | 'player' | 'guest';
};

export type Coach = {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
};

export type Player = {
  id: string;
  name: string;
  number: number;
  type: 'goalie' | 'field';
  isCaptain?: boolean;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'alert' | 'event';
  readBy: string[];
};

export type PlaybookItem = {
  id: string;
  title: string;
  category: string;
  pdfUrl?: string;
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
  pdfUrl?: string;
};

export type AppUser = {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'coach' | 'player' | 'guest';
};

export type AppSettings = {
  logoUrl?: string;
};

export type AwayTrip = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  arenaAddress: string;
  trainOutboundTime: string;
  trainReturnTime: string;
  hotelName: string;
  hotelAddress: string;
  restaurantInfo: string;
  roster: string[]; // Player IDs
  carTravelers: string[]; // Player IDs
  trainTravelers: string[]; // Player IDs
  hotelGuests: string[]; // Player IDs
};

import { Player, TrainingPlan, CampusArticle, Termin, CoachNews } from './types';

export const initialPlayers: Player[] = [
  { id: '1', name: 'Max Mustermann', number: 10, type: 'field' },
  { id: '2', name: 'Lukas Schmidt', number: 1, type: 'goalie' },
  { id: '3', name: 'Felix Weber', number: 7, type: 'field' },
  { id: '4', name: 'Jan Müller', number: 23, type: 'field' },
];

export const initialTraining: TrainingPlan[] = [
  { id: '1', title: 'Ausdauer & Passspiel', date: '2023-11-15', focus: 'Grundlagen' },
  { id: '2', title: 'Taktik Powerplay', date: '2023-11-17', focus: 'Überzahl' },
];

export const initialCampus: CampusArticle[] = [
  { id: '1', title: 'Regeländerungen 2023', category: 'Regeln', summary: 'Die wichtigsten neuen Regeln für diese Saison.', content: '...', iconType: 'book', color: 'yellow' },
  { id: '2', title: 'Ernährung vor dem Spiel', category: 'Gesundheit', summary: 'Was man essen sollte, um maximale Leistung abzurufen.', content: '...', iconType: 'apple', color: 'gray' },
];

export const initialTermine: Termin[] = [
  { id: '1', title: 'Training', date: '2023-11-15', time: '18:00', location: 'Sporthalle', type: 'training', description: 'Fokus auf Passspiel' },
  { id: '2', title: 'Spiel vs. Tigers', date: '2023-11-18', time: '14:00', location: 'Auswärts', type: 'game', description: 'Treffpunkt 12:30 Uhr' },
];

export const initialNews: CoachNews[] = [
  { id: '1', title: 'Willkommen zur neuen Saison!', content: 'Lasst uns hart arbeiten und unsere Ziele erreichen.', author: 'Coach Alex', date: '2023-11-01T10:00:00Z' },
];

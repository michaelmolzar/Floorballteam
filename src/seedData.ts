import { Player, TrainingPlan, CampusArticle, Termin, CoachNews } from './types';

export const initialPlayers: Player[] = [
  { id: '1', name: 'Max Mustermann', number: 10, position: 'Center', type: 'field', stats: { gamesPlayed: 12, goals: 8, assists: 15, penaltyMinutes: 4 } },
  { id: '2', name: 'Lukas Schmidt', number: 1, position: 'Goalie', type: 'goalie', stats: { gamesPlayed: 12, savePercentage: 85.5, goalsAgainstAverage: 2.1 } },
  { id: '3', name: 'Felix Weber', number: 7, position: 'Verteidiger', type: 'field', stats: { gamesPlayed: 12, goals: 2, assists: 5, penaltyMinutes: 10 } },
  { id: '4', name: 'Jan Müller', number: 23, position: 'Flügel', type: 'field', stats: { gamesPlayed: 11, goals: 14, assists: 3, penaltyMinutes: 2 } },
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

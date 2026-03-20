import React, { useState } from 'react';
import { Player, PlaybookItem, TrainingPlan, CampusArticle, Termin, CoachNews, AppUser } from '../types';
import { Users, Calendar, Target, BookOpen, Plus, Edit2, Trash2, Save, X, Info, Image as ImageIcon, Megaphone, Database, Shield, Upload, FileText } from 'lucide-react';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { initialPlayers, initialPlaybook, initialTraining, initialCampus, initialTermine, initialNews } from '../seedData';

export default function Admin({ 
  players, setPlayers,
  playbookItems, setPlaybookItems,
  trainingPlans, setTrainingPlans,
  campusArticles, setCampusArticles,
  termine, setTermine,
  news, setNews,
  appUsers,
  currentUserRole
}: { 
  players: Player[], setPlayers: any,
  playbookItems: PlaybookItem[], setPlaybookItems: any,
  trainingPlans: TrainingPlan[], setTrainingPlans: any,
  campusArticles: CampusArticle[], setCampusArticles: any,
  termine: Termin[], setTermine: any,
  news: CoachNews[], setNews: any,
  appUsers: AppUser[],
  currentUserRole: string
}) {
  const [adminTab, setAdminTab] = useState('spieler');
  const [isSeeding, setIsSeeding] = useState(false);

  const cleanUndefined = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(cleanUndefined);
    } else if (obj !== null && typeof obj === 'object') {
      const cleaned: any = {};
      Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
          cleaned[key] = cleanUndefined(obj[key]);
        }
      });
      return cleaned;
    }
    return obj;
  };

  const handleSeedDatabase = async () => {
    if (!confirm('Möchtest du die Datenbank wirklich mit Beispieldaten füllen? Dies überschreibt keine vorhandenen Daten mit gleicher ID, fügt aber neue hinzu.')) return;
    
    setIsSeeding(true);
    try {
      for (const p of initialPlayers) await setDoc(doc(db, 'players', p.id), p);
      for (const p of initialPlaybook) await setDoc(doc(db, 'playbook', p.id), p);
      for (const t of initialTraining) await setDoc(doc(db, 'trainingPlans', t.id), t);
      for (const c of initialCampus) await setDoc(doc(db, 'campus', c.id), c);
      for (const t of initialTermine) await setDoc(doc(db, 'termine', t.id), t);
      for (const n of initialNews) await setDoc(doc(db, 'news', n.id), n);
      alert('Datenbank erfolgreich befüllt!');
    } catch (error) {
      console.error('Fehler beim Befüllen der Datenbank:', error);
      alert('Fehler beim Befüllen der Datenbank.');
    } finally {
      setIsSeeding(false);
    }
  };
  
  // Player Edit State
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Player>>({});

  // Termin Edit State
  const [editingTerminId, setEditingTerminId] = useState<string | null>(null);
  const [terminForm, setTerminForm] = useState<Partial<Termin>>({});
  const [icsModalState, setIcsModalState] = useState<'closed' | 'input' | 'confirm' | 'loading' | 'success' | 'error'>('closed');
  const [icsUrl, setIcsUrl] = useState('');
  const [parsedIcsEvents, setParsedIcsEvents] = useState<Termin[]>([]);
  const [icsError, setIcsError] = useState('');

  // News Edit State
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState<Partial<CoachNews>>({});

  // Taktik Sub-Tab State
  const [taktikTab, setTaktikTab] = useState<'playbook' | 'training'>('playbook');
  const [playbookFilter, setPlaybookFilter] = useState<'all' | 'Offensive' | 'Defensive'>('all');
  
  // Playbook Edit State
  const [editingPlaybookId, setEditingPlaybookId] = useState<string | null>(null);
  const [playbookForm, setPlaybookForm] = useState<Partial<PlaybookItem>>({});
  const [uploadingPlaybookImage, setUploadingPlaybookImage] = useState(false);

  // Training Edit State
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [trainingForm, setTrainingForm] = useState<Partial<TrainingPlan>>({});
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Campus Edit State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<Partial<CampusArticle>>({});

  // --- Player Handlers ---
  const handleEditPlayer = (player: Player) => { setEditingPlayerId(player.id); setEditForm(player); };
  const handleSavePlayer = async () => {
    if (!editingPlayerId) return;
    try {
      const updatedPlayer = cleanUndefined({ ...players.find(p => p.id === editingPlayerId), ...editForm }) as Player;
      await setDoc(doc(db, 'players', editingPlayerId), updatedPlayer);
      setEditingPlayerId(null);
    } catch (error) {
      console.error("Error saving player:", error);
      alert("Fehler beim Speichern des Spielers: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  const handleDeletePlayer = async (id: string) => {
    if (confirm('Spieler wirklich löschen?')) {
      try {
        await deleteDoc(doc(db, 'players', id));
      } catch (error) {
        console.error("Error deleting player:", error);
        alert("Fehler beim Löschen des Spielers: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };
  const handleAddPlayer = async () => {
    try {
      const newPlayer: Player = { id: Date.now().toString(), name: 'Neuer Spieler', number: 0, position: 'Position', type: 'field', stats: { gamesPlayed: 0, goals: 0, assists: 0, penaltyMinutes: 0 } };
      await setDoc(doc(db, 'players', newPlayer.id), newPlayer);
      handleEditPlayer(newPlayer);
    } catch (error) {
      console.error("Error adding player:", error);
      alert("Fehler beim Hinzufügen des Spielers: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  // --- Termin Handlers ---
  const handleEditTermin = (termin: Termin) => { setEditingTerminId(termin.id); setTerminForm(termin); };
  const handleSaveTermin = async () => {
    if (!editingTerminId) return;
    try {
      const updatedTermin = cleanUndefined({ ...termine.find(t => t.id === editingTerminId), ...terminForm }) as Termin;
      await setDoc(doc(db, 'termine', editingTerminId), updatedTermin);
      setEditingTerminId(null);
    } catch (error) {
      console.error("Error saving termin:", error);
      alert("Fehler beim Speichern des Termins: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  const handleDeleteTermin = async (id: string) => {
    if (confirm('Termin wirklich löschen?')) {
      try {
        await deleteDoc(doc(db, 'termine', id));
      } catch (error) {
        console.error("Error deleting termin:", error);
        alert("Fehler beim Löschen des Termins: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };
  const handleAddTermin = async () => {
    try {
      const newTermin: Termin = { id: Date.now().toString(), title: 'Neuer Termin', date: new Date().toISOString().split('T')[0], time: '18:00', location: '', type: 'training', description: '' };
      await setDoc(doc(db, 'termine', newTermin.id), newTermin);
      handleEditTermin(newTermin);
    } catch (error) {
      console.error("Error adding termin:", error);
      alert("Fehler beim Hinzufügen des Termins: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const fetchAndParseIcsUrl = async () => {
    if (!icsUrl) return;
    setIcsModalState('loading');
    setIcsError('');
    try {
      // Using a CORS proxy since iCal feeds usually don't have CORS headers
      const res = await fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(icsUrl));
      if (!res.ok) throw new Error('Fehler beim Abrufen der URL');
      const text = await res.text();

      const unfoldedData = text.replace(/\r?\n /g, '');
      const lines = unfoldedData.split(/\r?\n/);
      
      let currentEvent: any = null;
      const parsedEvents: Termin[] = [];

      for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
          currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
          if (currentEvent && currentEvent.date && currentEvent.summary) {
            let type: 'training' | 'game' | 'event' = 'event';
            const lowerSummary = currentEvent.summary.toLowerCase();
            const lowerUid = (currentEvent.uid || '').toLowerCase();
            
            if (lowerUid.startsWith('training') || lowerSummary.includes('training')) {
              type = 'training';
            } else if (
              lowerUid.startsWith('game') || 
              lowerUid.startsWith('tournament') || 
              lowerUid.startsWith('event') || 
              lowerSummary.includes('spiel') || 
              lowerSummary.includes('match') || 
              lowerSummary.includes('turnier') || 
              lowerSummary.includes('event')
            ) {
              type = 'game';
            } else {
              type = 'game'; // Default to game for unknown types as requested
            }

            parsedEvents.push({
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              title: currentEvent.summary,
              date: currentEvent.date,
              time: currentEvent.time || '00:00',
              location: currentEvent.location || '',
              description: currentEvent.description || '',
              type: type
            });
          }
          currentEvent = null;
        } else if (currentEvent) {
          if (line.startsWith('UID:')) currentEvent.uid = line.substring(4);
          else if (line.startsWith('SUMMARY:')) currentEvent.summary = line.substring(8);
          else if (line.startsWith('LOCATION:')) currentEvent.location = line.substring(9);
          else if (line.startsWith('DESCRIPTION:')) currentEvent.description = line.substring(12).replace(/\\n/g, '\n');
          else if (line.startsWith('DTSTART')) {
            const isUTC = line.endsWith('Z');
            const match = line.match(/:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
            if (match) {
              const [_, y, m, d, h, min] = match;
              if (isUTC) {
                const dateObj = new Date(Date.UTC(parseInt(y), parseInt(m)-1, parseInt(d), parseInt(h), parseInt(min)));
                currentEvent.date = dateObj.toLocaleDateString('en-CA');
                currentEvent.time = dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
              } else {
                currentEvent.date = `${y}-${m}-${d}`;
                currentEvent.time = `${h}:${min}`;
              }
            } else {
              const dateMatch = line.match(/:(\d{4})(\d{2})(\d{2})/);
              if (dateMatch) {
                const [_, y, m, d] = dateMatch;
                currentEvent.date = `${y}-${m}-${d}`;
                currentEvent.time = '00:00';
              }
            }
          }
        }
      }

      if (parsedEvents.length > 0) {
        setParsedIcsEvents(parsedEvents);
        setIcsModalState('confirm');
      } else {
        setIcsError('Keine gültigen Termine in der Datei gefunden.');
        setIcsModalState('error');
      }
    } catch (err: any) {
      console.error(err);
      setIcsError(err.message || 'Fehler beim Importieren.');
      setIcsModalState('error');
    }
  };

  const confirmIcsImport = async () => {
    setIcsModalState('loading');
    try {
      for (const ev of parsedIcsEvents) {
        await setDoc(doc(db, 'termine', ev.id), ev);
      }
      setIcsModalState('success');
    } catch (err: any) {
      console.error(err);
      setIcsError('Fehler beim Speichern der Termine.');
      setIcsModalState('error');
    }
  };

  // --- News Handlers ---
  const handleEditNews = (n: CoachNews) => { setEditingNewsId(n.id); setNewsForm(n); };
  const handleSaveNews = async () => {
    if (!editingNewsId) return;
    try {
      const updatedNews = cleanUndefined({ ...news.find(n => n.id === editingNewsId), ...newsForm }) as CoachNews;
      await setDoc(doc(db, 'news', editingNewsId), updatedNews);
      setEditingNewsId(null);
    } catch (error) {
      console.error("Error saving news:", error);
      alert("Fehler beim Speichern der News: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  const handleDeleteNews = async (id: string) => {
    if (confirm('News wirklich löschen?')) {
      try {
        await deleteDoc(doc(db, 'news', id));
      } catch (error) {
        console.error("Error deleting news:", error);
        alert("Fehler beim Löschen der News: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };
  const handleAddNews = async () => {
    try {
      const newN: CoachNews = { id: Date.now().toString(), title: 'Neue Ankündigung', content: '', author: 'Coach', date: new Date().toISOString() };
      await setDoc(doc(db, 'news', newN.id), newN);
      handleEditNews(newN);
    } catch (error) {
      console.error("Error adding news:", error);
      alert("Fehler beim Hinzufügen der News: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  // --- Playbook Handlers ---
  const handleEditPlaybook = (item: PlaybookItem) => { setEditingPlaybookId(item.id); setPlaybookForm(item); };
  const handleSavePlaybook = async () => {
    if (!editingPlaybookId) return;
    
    try {
      if (editingPlaybookId === 'new') {
        const newId = Date.now().toString();
        const newPlaybook = cleanUndefined({ ...playbookForm, id: newId }) as PlaybookItem;
        await setDoc(doc(db, 'playbook', newId), newPlaybook);
      } else {
        const updatedPlaybook = cleanUndefined({ ...playbookItems.find(p => p.id === editingPlaybookId), ...playbookForm }) as PlaybookItem;
        await setDoc(doc(db, 'playbook', editingPlaybookId), updatedPlaybook);
      }
      setEditingPlaybookId(null);
    } catch (error) {
      console.error("Error saving playbook:", error);
      alert("Fehler beim Speichern des Spielzugs: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handlePlaybookImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPlaybookId) return;
    
    if (!file.type.startsWith('image/') && file.type !== 'image/svg+xml' && file.type !== 'application/pdf') {
      alert('Bitte nur Bilder (JPG, PNG, SVG) oder PDFs hochladen.');
      return;
    }

    setUploadingPlaybookImage(true);
    try {
      const storageRef = ref(storage, `playbook/${editingPlaybookId === 'new' ? 'temp' : editingPlaybookId}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setPlaybookForm({ ...playbookForm, imageUrl: downloadUrl });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Fehler beim Hochladen der Datei: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setUploadingPlaybookImage(false);
    }
  };
  const handleDeletePlaybook = async (id: string) => {
    if (confirm('Spielzug wirklich löschen?')) {
      try {
        await deleteDoc(doc(db, 'playbook', id));
      } catch (error) {
        console.error("Error deleting playbook:", error);
        alert("Fehler beim Löschen des Spielzugs: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };
  const handleAddPlaybook = () => {
    const newItem: PlaybookItem = { id: 'new', title: 'Neuer Spielzug', type: 'Offensive', situation: '', description: '', steps: ['Schritt 1'] };
    handleEditPlaybook(newItem);
  };

  // --- Training Handlers ---
  const handleEditTraining = (plan: TrainingPlan) => { setEditingTrainingId(plan.id); setTrainingForm(plan); };
  const handleSaveTraining = async () => {
    if (!editingTrainingId) return;
    try {
      const updatedTraining = cleanUndefined({ ...trainingPlans.find(p => p.id === editingTrainingId), ...trainingForm }) as TrainingPlan;
      await setDoc(doc(db, 'trainingPlans', editingTrainingId), updatedTraining);
      setEditingTrainingId(null);
    } catch (error) {
      console.error("Error saving training:", error);
      alert("Fehler beim Speichern des Trainingsplans: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTrainingId) return;
    
    if (file.type !== 'application/pdf') {
      alert('Bitte nur PDF-Dateien hochladen.');
      return;
    }

    setUploadingPdf(true);
    try {
      const storageRef = ref(storage, `trainingPlans/${editingTrainingId}_${Date.now()}.pdf`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setTrainingForm({ ...trainingForm, pdfUrl: downloadUrl });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Fehler beim Hochladen der PDF: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setUploadingPdf(false);
    }
  };
  const handleDeleteTraining = async (id: string) => {
    if (confirm('Trainingsplan wirklich löschen?')) {
      try {
        await deleteDoc(doc(db, 'trainingPlans', id));
      } catch (error) {
        console.error("Error deleting training plan:", error);
        alert("Fehler beim Löschen des Trainingsplans: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };
  const handleAddTraining = async () => {
    try {
      const newPlan: TrainingPlan = { id: Date.now().toString(), title: 'New Plan', date: new Date().toISOString().split('T')[0], focus: '' };
      await setDoc(doc(db, 'trainingPlans', newPlan.id), newPlan);
      handleEditTraining(newPlan);
    } catch (error) {
      console.error("Error adding training plan:", error);
      alert("Fehler beim Hinzufügen des Trainingsplans: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  // --- Campus Handlers ---
  const handleEditArticle = (article: CampusArticle) => { setEditingArticleId(article.id); setArticleForm(article); };
  const handleSaveArticle = async () => {
    if (!editingArticleId) return;
    try {
      const updatedArticle = cleanUndefined({ ...campusArticles.find(a => a.id === editingArticleId), ...articleForm }) as CampusArticle;
      await setDoc(doc(db, 'campus', editingArticleId), updatedArticle);
      setEditingArticleId(null);
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Fehler beim Speichern des Artikels: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  const handleDeleteArticle = async (id: string) => {
    if (confirm('Artikel wirklich löschen?')) {
      try {
        await deleteDoc(doc(db, 'campus', id));
      } catch (error) {
        console.error("Error deleting article:", error);
        alert("Fehler beim Löschen des Artikels: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };
  const handleAddArticle = async () => {
    try {
      const newArticle: CampusArticle = { id: Date.now().toString(), title: 'Neuer Artikel', category: 'Allgemein', summary: '', content: '', iconType: 'book', color: 'blue' };
      await setDoc(doc(db, 'campus', newArticle.id), newArticle);
      handleEditArticle(newArticle);
    } catch (error) {
      console.error("Error adding article:", error);
      alert("Fehler beim Hinzufügen des Artikels: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Admin Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-dark-card border border-gray-700 rounded-xl overflow-hidden sticky top-20">
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <h2 className="font-bold text-white text-lg">Admin Bereich</h2>
              <p className="text-xs text-gray-400">Verwaltung & CMS</p>
            </div>
            <nav className="flex flex-col p-2 gap-1">
              <button onClick={() => setAdminTab('spieler')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${adminTab === 'spieler' ? 'bg-brand/20 text-brand' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <Users size={18} /> Spielerverwaltung
              </button>
              <button onClick={() => setAdminTab('termine')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${adminTab === 'termine' ? 'bg-brand/20 text-brand' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <Calendar size={18} /> Terminverwaltung
              </button>
              <button onClick={() => setAdminTab('taktik')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${adminTab === 'taktik' ? 'bg-brand/20 text-brand' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <Target size={18} /> Taktik & Training
              </button>
              <button onClick={() => setAdminTab('campus')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${adminTab === 'campus' ? 'bg-brand/20 text-brand' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <BookOpen size={18} /> Campus Inhalte
              </button>
              <button onClick={() => setAdminTab('news')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${adminTab === 'news' ? 'bg-brand/20 text-brand' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <Megaphone size={18} /> News vom Trainer
              </button>
              {currentUserRole === 'admin' && (
                <button onClick={() => setAdminTab('benutzer')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${adminTab === 'benutzer' ? 'bg-brand/20 text-brand' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                  <Shield size={18} /> Benutzerverwaltung
                </button>
              )}
            </nav>
            <div className="p-4 border-t border-gray-700 mt-4">
              <button 
                onClick={handleSeedDatabase} 
                disabled={isSeeding}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Database size={16} /> {isSeeding ? 'Wird befüllt...' : 'Beispieldaten laden'}
              </button>
            </div>
          </div>
        </div>

        {/* Admin Content Area */}
        <div className="flex-grow">
          
          {/* ================= SPIELERVERWALTUNG ================= */}
          {adminTab === 'spieler' && (
            <div className="bg-dark-card border border-gray-700 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Kader verwalten</h3>
                <button onClick={handleAddPlayer} className="bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center">
                  <Plus size={16} className="mr-1" /> Neuer Spieler
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Position</th>
                      <th className="px-4 py-3">Typ</th>
                      <th className="px-4 py-3 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map(player => (
                      <tr key={player.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                        {editingPlayerId === player.id ? (
                          <>
                            <td className="px-4 py-2"><input type="number" value={editForm.number} onChange={e => setEditForm({...editForm, number: +e.target.value})} className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:border-brand outline-none" /></td>
                            <td className="px-4 py-2"><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:border-brand outline-none" /></td>
                            <td className="px-4 py-2"><input type="text" value={editForm.position} onChange={e => setEditForm({...editForm, position: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:border-brand outline-none" /></td>
                            <td className="px-4 py-2">
                              <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value as 'goalie'|'field'})} className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:border-brand outline-none">
                                <option value="field">Feldspieler</option>
                                <option value="goalie">Goalie</option>
                              </select>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button onClick={handleSavePlayer} className="text-green-400 hover:text-green-300 p-1"><Save size={18} /></button>
                              <button onClick={() => setEditingPlayerId(null)} className="text-gray-400 hover:text-white p-1 ml-1"><X size={18} /></button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 font-bold text-white">{player.number}</td>
                            <td className="px-4 py-3 font-medium text-white">{player.name} {player.isCaptain && <span className="text-yellow-500 text-[10px] ml-1 border border-yellow-500/30 px-1 rounded">C</span>}</td>
                            <td className="px-4 py-3">{player.position}</td>
                            <td className="px-4 py-3">{player.type === 'goalie' ? 'Goalie' : 'Feldspieler'}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => handleEditPlayer(player)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeletePlayer(player.id)} className="text-red-400 hover:text-red-300 p-1 ml-2"><Trash2 size={16} /></button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TERMINVERWALTUNG ================= */}
          {adminTab === 'termine' && (
            <div className="bg-dark-card border border-gray-700 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Termine verwalten</h3>
                <div className="flex gap-2">
                  <button onClick={() => setIcsModalState('input')} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center cursor-pointer">
                    <Upload size={16} className="mr-1" /> iCal URL Import
                  </button>
                  <button onClick={handleAddTermin} className="bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center">
                    <Plus size={16} className="mr-1" /> Neuer Termin
                  </button>
                </div>
              </div>
              
              {editingTerminId ? (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
                  <h5 className="text-white font-bold mb-4">Termin bearbeiten</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Titel</label>
                      <input type="text" value={terminForm.title || ''} onChange={e => setTerminForm({...terminForm, title: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Typ</label>
                      <select value={terminForm.type || 'training'} onChange={e => setTerminForm({...terminForm, type: e.target.value as any})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none">
                        <option value="training">Training</option>
                        <option value="game">Spiel</option>
                        <option value="event">Event / Teambuilding</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Datum</label>
                      <input type="date" value={terminForm.date || ''} onChange={e => setTerminForm({...terminForm, date: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Uhrzeit</label>
                      <input type="time" value={terminForm.time || ''} onChange={e => setTerminForm({...terminForm, time: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Ort</label>
                      <input type="text" value={terminForm.location || ''} onChange={e => setTerminForm({...terminForm, location: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Beschreibung / Details</label>
                      <textarea value={terminForm.description || ''} onChange={e => setTerminForm({...terminForm, description: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none h-20" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingTerminId(null)} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700">Abbrechen</button>
                    <button onClick={handleSaveTermin} className="px-4 py-2 rounded bg-brand text-white hover:bg-brand-dark flex items-center"><Save size={16} className="mr-2"/> Speichern</button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-gray-700">
                      <tr>
                        <th className="px-4 py-3">Datum & Zeit</th>
                        <th className="px-4 py-3">Titel</th>
                        <th className="px-4 py-3">Typ</th>
                        <th className="px-4 py-3">Ort</th>
                        <th className="px-4 py-3 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {termine.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(termin => (
                        <tr key={termin.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-bold text-white">{new Date(termin.date).toLocaleDateString('de-DE')}</div>
                            <div className="text-xs text-gray-400">{termin.time} Uhr</div>
                          </td>
                          <td className="px-4 py-3 font-bold text-white">{termin.title}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              termin.type === 'training' ? 'bg-brand/20 text-brand' : 
                              termin.type === 'game' ? 'bg-yellow-500/20 text-yellow-500' : 
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {termin.type === 'training' ? 'Training' : termin.type === 'game' ? 'Spiel' : 'Event'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{termin.location}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleEditTermin(termin)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteTermin(termin.id)} className="text-red-400 hover:text-red-300 p-1 ml-2"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= TAKTIK & TRAINING ================= */}
          {adminTab === 'taktik' && (
            <div className="bg-dark-card border border-gray-700 rounded-xl p-6 shadow-lg">
              <div className="flex gap-4 border-b border-gray-700 pb-4 mb-6">
                <button onClick={() => setTaktikTab('playbook')} className={`${taktikTab === 'playbook' ? 'bg-brand text-white' : 'bg-gray-800 text-gray-300'} px-4 py-2 rounded-lg font-medium text-sm`}>Playbook</button>
                <button onClick={() => setTaktikTab('training')} className={`${taktikTab === 'training' ? 'bg-brand text-white' : 'bg-gray-800 text-gray-300'} px-4 py-2 rounded-lg font-medium text-sm`}>Trainingspläne</button>
              </div>

              {taktikTab === 'playbook' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div className="flex bg-gray-800 rounded-lg p-1">
                      <button onClick={() => setPlaybookFilter('all')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${playbookFilter === 'all' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Alle</button>
                      <button onClick={() => setPlaybookFilter('Offensive')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${playbookFilter === 'Offensive' ? 'bg-brand/20 text-brand shadow' : 'text-gray-400 hover:text-white'}`}>Offensiv</button>
                      <button onClick={() => setPlaybookFilter('Defensive')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${playbookFilter === 'Defensive' ? 'bg-purple-500/20 text-purple-400 shadow' : 'text-gray-400 hover:text-white'}`}>Defensiv</button>
                    </div>
                    <button onClick={handleAddPlaybook} className="bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center">
                      <Plus size={16} className="mr-1" /> Neuer Spielzug
                    </button>
                  </div>
                  
                  {editingPlaybookId ? (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
                      <h5 className="text-white font-bold mb-4">Spielzug bearbeiten</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Titel</label>
                          <input type="text" value={playbookForm.title || ''} onChange={e => setPlaybookForm({...playbookForm, title: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Typ</label>
                          <select value={playbookForm.type || 'Offensive'} onChange={e => setPlaybookForm({...playbookForm, type: e.target.value as any})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none">
                            <option value="Offensive">Offensive</option>
                            <option value="Defensive">Defensive</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Situation</label>
                          <input type="text" value={playbookForm.situation || ''} onChange={e => setPlaybookForm({...playbookForm, situation: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Beschreibung</label>
                          <textarea value={playbookForm.description || ''} onChange={e => setPlaybookForm({...playbookForm, description: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none h-20" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Ablauf (Schritte, einer pro Zeile)</label>
                          <textarea 
                            value={playbookForm.steps?.join('\n') || ''} 
                            onChange={e => setPlaybookForm({...playbookForm, steps: e.target.value.split('\n').filter(s => s.trim() !== '')})} 
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none h-32" 
                            placeholder="Schritt 1...&#10;Schritt 2..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-brand mb-1 flex items-center"><Lock size={12} className="mr-1" /> Fortgeschrittene Taktiken (Nur für Trainer)</label>
                          <textarea 
                            value={playbookForm.advancedTactics || ''} 
                            onChange={e => setPlaybookForm({...playbookForm, advancedTactics: e.target.value})} 
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none h-24" 
                            placeholder="Spezifische Anweisungen, alternative Ausführungen..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Taktiktafel Bild/SVG/PDF</label>
                          <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700/50 cursor-pointer transition-colors relative">
                            {uploadingPlaybookImage ? (
                              <span className="text-sm">Wird hochgeladen...</span>
                            ) : playbookForm.imageUrl ? (
                              <div className="flex flex-col items-center gap-2">
                                {playbookForm.imageUrl.toLowerCase().includes('.pdf') || playbookForm.imageUrl.toLowerCase().includes('%2fpdf') ? (
                                  <div className="flex flex-col items-center p-4 bg-gray-800 rounded">
                                    <FileText size={48} className="text-red-400 mb-2" />
                                    <span className="text-sm text-white">PDF Dokument hochgeladen</span>
                                    <a href={playbookForm.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline mt-1">Vorschau öffnen</a>
                                  </div>
                                ) : (
                                  <img src={playbookForm.imageUrl} alt="Playbook" className="max-h-32 rounded object-contain" />
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-sm text-green-400">Datei erfolgreich hochgeladen</span>
                                  <button onClick={() => setPlaybookForm({ ...playbookForm, imageUrl: undefined })} className="text-red-400 hover:text-red-300 ml-2">Entfernen</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <ImageIcon size={24} className="mb-2" />
                                <span className="text-sm">Klicken zum Hochladen (JPG, PNG, SVG, PDF)</span>
                                <input 
                                  type="file" 
                                  accept="image/*,.svg,.pdf" 
                                  onChange={handlePlaybookImageUpload} 
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingPlaybookId(null)} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700">Abbrechen</button>
                        <button onClick={handleSavePlaybook} className="px-4 py-2 rounded bg-brand text-white hover:bg-brand-dark flex items-center"><Save size={16} className="mr-2"/> Speichern</button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-gray-700">
                          <tr>
                            <th className="px-4 py-3">Titel</th>
                            <th className="px-4 py-3">Typ</th>
                            <th className="px-4 py-3">Situation</th>
                            <th className="px-4 py-3 text-right">Aktionen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {playbookItems.filter(item => playbookFilter === 'all' || item.type === playbookFilter).map(item => (
                            <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                              <td className="px-4 py-3 font-bold text-white">{item.title}</td>
                              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.type === 'Offensive' ? 'bg-brand/20 text-brand' : 'bg-purple-500/20 text-purple-400'}`}>{item.type}</span></td>
                              <td className="px-4 py-3">{item.situation}</td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => handleEditPlaybook(item)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeletePlaybook(item.id)} className="text-red-400 hover:text-red-300 p-1 ml-2"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {taktikTab === 'training' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-white">Trainingspläne verwalten</h4>
                    <button onClick={handleAddTraining} className="bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center">
                      <Plus size={16} className="mr-1" /> New Plan
                    </button>
                  </div>

                  {editingTrainingId ? (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
                      <h5 className="text-white font-bold mb-4">Trainingsplan bearbeiten</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Titel</label>
                          <input type="text" value={trainingForm.title || ''} onChange={e => setTrainingForm({...trainingForm, title: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Datum</label>
                          <input type="date" value={trainingForm.date || ''} onChange={e => setTrainingForm({...trainingForm, date: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Fokus</label>
                          <input type="text" value={trainingForm.focus || ''} onChange={e => setTrainingForm({...trainingForm, focus: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">PDF Upload</label>
                          <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700/50 cursor-pointer transition-colors relative">
                            {uploadingPdf ? (
                              <span className="text-sm">Wird hochgeladen...</span>
                            ) : trainingForm.pdfUrl ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-green-400">PDF erfolgreich hochgeladen</span>
                                <button onClick={() => setTrainingForm({ ...trainingForm, pdfUrl: undefined })} className="text-red-400 hover:text-red-300 ml-2">Entfernen</button>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm">Klicken zum Hochladen (PDF)</span>
                                <input 
                                  type="file" 
                                  accept="application/pdf" 
                                  onChange={handlePdfUpload} 
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingTrainingId(null)} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700">Abbrechen</button>
                        <button onClick={handleSaveTraining} className="px-4 py-2 rounded bg-brand text-white hover:bg-brand-dark flex items-center"><Save size={16} className="mr-2"/> Speichern</button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-gray-700">
                          <tr>
                            <th className="px-4 py-3">Titel</th>
                            <th className="px-4 py-3">Datum</th>
                            <th className="px-4 py-3">Fokus</th>
                            <th className="px-4 py-3 text-center">PDF</th>
                            <th className="px-4 py-3 text-right">Aktionen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trainingPlans.map(plan => (
                            <tr key={plan.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                              <td className="px-4 py-3">
                                <input 
                                  type="text" 
                                  value={plan.title}
                                  onChange={(e) => setTrainingPlans(trainingPlans.map(p => p.id === plan.id ? { ...p, title: e.target.value } : p))}
                                  onBlur={(e) => updateDoc(doc(db, 'trainingPlans', plan.id), { title: e.target.value })}
                                  className="bg-transparent border border-transparent hover:border-gray-600 focus:border-brand focus:bg-gray-800 rounded px-2 py-1 text-white font-bold w-full outline-none transition-colors"
                                />
                              </td>
                              <td className="px-4 py-3">{new Date(plan.date).toLocaleDateString('de-DE')}</td>
                              <td className="px-4 py-3">
                                <input 
                                  type="text" 
                                  value={plan.focus}
                                  onChange={(e) => setTrainingPlans(trainingPlans.map(p => p.id === plan.id ? { ...p, focus: e.target.value } : p))}
                                  onBlur={(e) => updateDoc(doc(db, 'trainingPlans', plan.id), { focus: e.target.value })}
                                  className="bg-transparent border border-transparent hover:border-gray-600 focus:border-brand focus:bg-gray-800 rounded px-2 py-1 text-gray-300 w-full outline-none transition-colors"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                {plan.pdfUrl ? <span className="text-green-400 font-bold text-xs">JA</span> : <span className="text-gray-600 text-xs">-</span>}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => handleEditTraining(plan)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteTraining(plan.id)} className="text-red-400 hover:text-red-300 p-1 ml-2"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= CAMPUS ================= */}
          {adminTab === 'campus' && (
            <div className="bg-dark-card border border-gray-700 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Campus Artikel</h3>
                <button onClick={handleAddArticle} className="bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center">
                  <Plus size={16} className="mr-1" /> Neuer Artikel
                </button>
              </div>

              {editingArticleId ? (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
                  <h5 className="text-white font-bold mb-4">Artikel bearbeiten</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Titel</label>
                      <input type="text" value={articleForm.title || ''} onChange={e => setArticleForm({...articleForm, title: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Kategorie</label>
                      <input type="text" value={articleForm.category || ''} onChange={e => setArticleForm({...articleForm, category: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Icon</label>
                      <select value={articleForm.iconType || 'book'} onChange={e => setArticleForm({...articleForm, iconType: e.target.value as any})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none">
                        <option value="book">Buch (Regeln)</option>
                        <option value="apple">Apfel (Ernährung)</option>
                        <option value="activity">Aktivität (Regeneration)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Farbe</label>
                      <select value={articleForm.color || 'blue'} onChange={e => setArticleForm({...articleForm, color: e.target.value as any})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none">
                        <option value="blue">Blau</option>
                        <option value="green">Grün</option>
                        <option value="purple">Lila</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Kurzzusammenfassung</label>
                      <textarea value={articleForm.summary || ''} onChange={e => setArticleForm({...articleForm, summary: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none h-16" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Inhalt (Rich-Text Editor Platzhalter)</label>
                      <div className="bg-gray-900 border border-gray-600 rounded overflow-hidden">
                        <div className="bg-gray-800 border-b border-gray-600 p-2 flex gap-2">
                          <button className="px-2 py-1 bg-gray-700 rounded text-xs text-white font-bold">B</button>
                          <button className="px-2 py-1 bg-gray-700 rounded text-xs text-white italic">I</button>
                          <button className="px-2 py-1 bg-gray-700 rounded text-xs text-white underline">U</button>
                          <div className="w-px bg-gray-600 mx-1"></div>
                          <button className="px-2 py-1 bg-gray-700 rounded text-xs text-white">List</button>
                        </div>
                        <textarea 
                          value={articleForm.content || ''} 
                          onChange={e => setArticleForm({...articleForm, content: e.target.value})} 
                          className="w-full bg-transparent p-3 text-white outline-none h-40 resize-y" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingArticleId(null)} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700">Abbrechen</button>
                    <button onClick={handleSaveArticle} className="px-4 py-2 rounded bg-brand text-white hover:bg-brand-dark flex items-center"><Save size={16} className="mr-2"/> Speichern</button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-gray-700">
                      <tr>
                        <th className="px-4 py-3">Titel</th>
                        <th className="px-4 py-3">Kategorie</th>
                        <th className="px-4 py-3 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campusArticles.map(article => (
                        <tr key={article.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                          <td className="px-4 py-3">
                            <input 
                              type="text" 
                              value={article.title}
                              onChange={(e) => setCampusArticles(campusArticles.map(a => a.id === article.id ? { ...a, title: e.target.value } : a))}
                              onBlur={(e) => updateDoc(doc(db, 'campus', article.id), { title: e.target.value })}
                              className="bg-transparent border border-transparent hover:border-gray-600 focus:border-brand focus:bg-gray-800 rounded px-2 py-1 text-white font-bold w-full outline-none transition-colors"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="text" 
                              value={article.category}
                              onChange={(e) => setCampusArticles(campusArticles.map(a => a.id === article.id ? { ...a, category: e.target.value } : a))}
                              onBlur={(e) => updateDoc(doc(db, 'campus', article.id), { category: e.target.value })}
                              className="bg-gray-700 border border-transparent hover:border-gray-500 focus:border-brand rounded px-2 py-1 text-[10px] font-bold uppercase text-gray-300 outline-none transition-colors w-32"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleEditArticle(article)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteArticle(article.id)} className="text-red-400 hover:text-red-300 p-1 ml-2"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= NEWS VOM TRAINER ================= */}
          {adminTab === 'news' && (
            <div className="bg-dark-card border border-gray-700 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">News vom Trainer</h3>
                <button onClick={handleAddNews} className="bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center">
                  <Plus size={16} className="mr-1" /> Neue News
                </button>
              </div>

              {editingNewsId ? (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
                  <h5 className="text-white font-bold mb-4">News bearbeiten</h5>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Titel</label>
                      <input type="text" value={newsForm.title || ''} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Inhalt</label>
                      <textarea value={newsForm.content || ''} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none h-32" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Autor</label>
                        <input type="text" value={newsForm.author || ''} onChange={e => setNewsForm({...newsForm, author: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Datum</label>
                        <input type="datetime-local" value={newsForm.date ? new Date(newsForm.date).toISOString().slice(0, 16) : ''} onChange={e => setNewsForm({...newsForm, date: new Date(e.target.value).toISOString()})} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-brand outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingNewsId(null)} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700">Abbrechen</button>
                    <button onClick={handleSaveNews} className="px-4 py-2 rounded bg-brand text-white hover:bg-brand-dark flex items-center"><Save size={16} className="mr-2"/> Speichern</button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-gray-700">
                      <tr>
                        <th className="px-4 py-3">Datum</th>
                        <th className="px-4 py-3">Titel</th>
                        <th className="px-4 py-3">Autor</th>
                        <th className="px-4 py-3 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(n => (
                        <tr key={n.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                          <td className="px-4 py-3">{new Date(n.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="px-4 py-3 font-bold text-white">{n.title}</td>
                          <td className="px-4 py-3">{n.author}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleEditNews(n)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteNews(n.id)} className="text-red-400 hover:text-red-300 p-1 ml-2"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= BENUTZERVERWALTUNG ================= */}
          {adminTab === 'benutzer' && currentUserRole === 'admin' && (
            <div className="bg-dark-card border border-gray-700 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Benutzerverwaltung</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Rolle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appUsers.map(u => (
                      <tr key={u.uid} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 font-bold text-white">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">
                          <select 
                            value={u.role}
                            onChange={(e) => updateDoc(doc(db, 'users', u.uid), { role: e.target.value })}
                            className={`bg-gray-700 border border-transparent hover:border-gray-500 focus:border-brand rounded px-2 py-1 text-[10px] font-bold uppercase outline-none transition-colors ${
                              u.role === 'admin' ? 'text-red-400' : 
                              u.role === 'coach' ? 'text-brand' : 
                              u.role === 'player' ? 'text-blue-400' : 
                              'text-gray-400'
                            }`}
                          >
                            <option value="guest">Gast</option>
                            <option value="player">Spieler</option>
                            <option value="coach">Trainer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ICS Import Modal */}
      {icsModalState !== 'closed' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-dark-card border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIcsModalState('closed')} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">iCal Import (SpielerPlus)</h3>
            
            {icsModalState === 'input' && (
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Füge hier den iCal-Link (URL) aus der SpielerPlus App ein. Die App wird die Termine automatisch herunterladen und importieren.
                </p>
                <input 
                  type="url" 
                  placeholder="https://www.spielerplus.de/ical/..." 
                  value={icsUrl} 
                  onChange={(e) => setIcsUrl(e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-brand outline-none mb-4"
                />
                <button 
                  onClick={fetchAndParseIcsUrl} 
                  disabled={!icsUrl}
                  className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-colors"
                >
                  Termine abrufen
                </button>
              </div>
            )}

            {icsModalState === 'loading' && (
              <div className="py-8 text-center">
                <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Bitte warten...</p>
              </div>
            )}

            {icsModalState === 'confirm' && (
              <div>
                <div className="bg-brand/20 border border-brand/30 rounded-lg p-4 mb-6 text-center">
                  <p className="text-3xl font-bold text-white mb-1">{parsedIcsEvents.length}</p>
                  <p className="text-sm text-brand font-medium">Termine gefunden</p>
                </div>
                <p className="text-sm text-gray-300 mb-6 text-center">
                  Möchtest du diese Termine jetzt in deinen Kalender importieren?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setIcsModalState('closed')} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors">Abbrechen</button>
                  <button onClick={confirmIcsImport} className="flex-1 bg-brand hover:bg-brand-dark text-white py-3 rounded-lg font-bold transition-colors">Importieren</button>
                </div>
              </div>
            )}

            {icsModalState === 'success' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={32} />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Import erfolgreich!</h4>
                <p className="text-gray-400 mb-6">Die Termine wurden in die Datenbank eingetragen.</p>
                <button onClick={() => setIcsModalState('closed')} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors">Schließen</button>
              </div>
            )}

            {icsModalState === 'error' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X size={32} />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Fehler beim Import</h4>
                <p className="text-gray-400 mb-6">{icsError}</p>
                <button onClick={() => setIcsModalState('input')} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors">Erneut versuchen</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

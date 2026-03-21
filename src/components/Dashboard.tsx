import { Trophy, Timer, Megaphone, Calendar, MapPin, Bus, Send, X, BellRing } from 'lucide-react';
import React, { useState } from 'react';
import { CoachNews, Termin } from '../types';

export default function Dashboard({ setActiveTab, addNotification, news, termine, userRole }: { setActiveTab: (tab: string) => void, addNotification: any, news: CoachNews[], termine: Termin[], userRole: string | null }) {
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [pushTitle, setPushTitle] = useState('');
  const [pushMsg, setPushMsg] = useState('');
  const [pushType, setPushType] = useState<'info'|'alert'|'event'>('info');

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushMsg.trim()) return;
    addNotification({ title: pushTitle, message: pushMsg, type: pushType });
    setIsPushModalOpen(false);
    setPushTitle('');
    setPushMsg('');
  };

  const latestNews = news.length > 0 ? [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  
  const normalizeDate = (dateStr: string) => {
    if (!dateStr) return '0000-00-00';
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return dateStr;
  };

  const upcomingTermine = [...termine].filter(t => {
    return normalizeDate(t.date) >= todayStr;
  }).sort((a, b) => {
    const dateA = new Date(`${normalizeDate(a.date)}T${a.time || '00:00'}`);
    const dateB = new Date(`${normalizeDate(b.date)}T${b.time || '00:00'}`);
    return dateA.getTime() - dateB.getTime();
  });

  const isGame = (t: Termin) => {
    if (t.type === 'game') return true;
    const title = (t.title || '').toLowerCase();
    return title.includes('spiel') || title.includes('match') || title.includes('turnier');
  };

  const isGirlsGame = (t: Termin) => {
    const text = `${t.title} ${t.description || ''}`.toLowerCase();
    return text.includes('mädchen') || text.includes('damen') || text.includes('wu') || text.includes('w1') || text.includes('w2') || text.includes('weiblich');
  };

  const nextGame = upcomingTermine.find(t => isGame(t) && !isGirlsGame(t));
  const nextGirlsGame = upcomingTermine.find(t => isGame(t) && isGirlsGame(t));
  const nextTraining = upcomingTermine.find(t => t.type === 'training' && !isGame(t));

  const formatDate = (dateStr: string, timeStr?: string) => {
    const normDate = normalizeDate(dateStr);
    const d = new Date(`${normDate}T${timeStr || '00:00'}`);
    return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' }) + (timeStr ? ` • ${timeStr} Uhr` : '');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">Willkommen zurück!</h2>
        {(userRole === 'admin' || userRole === 'coach') && (
          <button 
            onClick={() => setIsPushModalOpen(true)}
            className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-brand/20"
          >
            <BellRing size={16} className="mr-2" />
            Push-Nachricht senden
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Next Match Card */}
        <div className="bg-gradient-to-br from-brand-dark to-brand rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 text-white/20">
            <Trophy size={120} />
          </div>
          <div className="relative z-10 text-white">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Nächstes Spiel</span>
            {nextGame ? (
              <>
                <h3 className="text-2xl font-bold mt-4 mb-1">{nextGame.title}</h3>
                <p className="text-white/80 mb-4 flex items-center"><Calendar className="mr-2 shrink-0" size={16} />{formatDate(nextGame.date, nextGame.time)}</p>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-sm font-medium flex items-start"><MapPin className="mr-2 mt-0.5 shrink-0" size={16} /><span className="break-words">{nextGame.location}</span></p>
                  {nextGame.description && <p className="text-sm mt-1 flex items-start"><Bus className="mr-2 mt-0.5 shrink-0" size={16} /><span className="break-words break-all whitespace-pre-wrap">{nextGame.description}</span></p>}
                </div>
              </>
            ) : (
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-1 text-white/70">Kein Spiel geplant</h3>
                <p className="text-white/50 text-sm">Aktuell stehen keine Spiele an.</p>
              </div>
            )}
          </div>
        </div>

        {/* Next Girls Match Card */}
        <div className="bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 text-white/20">
            <Trophy size={120} />
          </div>
          <div className="relative z-10 text-white">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Nächstes Spiel Mädchen</span>
            {nextGirlsGame ? (
              <>
                <h3 className="text-2xl font-bold mt-4 mb-1">{nextGirlsGame.title}</h3>
                <p className="text-white/80 mb-4 flex items-center"><Calendar className="mr-2 shrink-0" size={16} />{formatDate(nextGirlsGame.date, nextGirlsGame.time)}</p>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-sm font-medium flex items-start"><MapPin className="mr-2 mt-0.5 shrink-0" size={16} /><span className="break-words">{nextGirlsGame.location}</span></p>
                  {nextGirlsGame.description && <p className="text-sm mt-1 flex items-start"><Bus className="mr-2 mt-0.5 shrink-0" size={16} /><span className="break-words break-all whitespace-pre-wrap">{nextGirlsGame.description}</span></p>}
                </div>
              </>
            ) : (
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-1 text-white/70">Kein Spiel geplant</h3>
                <p className="text-white/50 text-sm">Aktuell stehen keine Mädchen-Spiele an.</p>
              </div>
            )}
          </div>
        </div>

        {/* Next Training Card */}
        <div className="bg-dark-card border border-gray-700 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Timer className="text-brand mr-2" size={20} />Nächstes Training</h3>
          <div className="space-y-4">
            {nextTraining ? (
              <>
                <div className="border-l-4 border-brand pl-4">
                  <p className="text-sm text-gray-400">{formatDate(nextTraining.date, nextTraining.time)}</p>
                  <p className="font-medium text-white text-lg break-words">{nextTraining.location}</p>
                  {nextTraining.description && <p className="text-sm text-brand mt-1 break-words break-all whitespace-pre-wrap">{nextTraining.description}</p>}
                </div>
                <button 
                  onClick={() => setActiveTab('taktik')}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm transition-colors border border-gray-600"
                >
                  Trainingsplan ansehen
                </button>
              </>
            ) : (
              <div className="border-l-4 border-gray-600 pl-4 py-2">
                <p className="text-gray-400">Kein Training geplant</p>
              </div>
            )}
          </div>
        </div>

        {/* Coach Note / News */}
        <div className="bg-dark-card border border-gray-700 rounded-2xl p-6 shadow-lg flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Megaphone className="text-yellow-500 mr-2" size={20} />News vom Trainer</h3>
          {latestNews ? (
            <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 flex-grow">
              <p className="mb-2 text-white"><strong>{latestNews.title}</strong></p>
              <p className="whitespace-pre-wrap">{latestNews.content}</p>
              <p className="mt-3 text-xs text-gray-500">- {latestNews.author}, {new Date(latestNews.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-500 flex-grow flex items-center justify-center">
              Keine aktuellen News.
            </div>
          )}
        </div>
      </div>

      {/* Push Notification Modal */}
      {isPushModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Send size={18} className="text-brand" />
                Push-Nachricht an Team senden
              </h3>
              <button onClick={() => setIsPushModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSendPush} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Art der Nachricht</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setPushType('info')} className={`py-2 px-3 rounded-lg text-sm font-medium border ${pushType === 'info' ? 'bg-brand/20 border-brand text-brand' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>Info</button>
                  <button type="button" onClick={() => setPushType('alert')} className={`py-2 px-3 rounded-lg text-sm font-medium border ${pushType === 'alert' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>Wichtig (Alert)</button>
                  <button type="button" onClick={() => setPushType('event')} className={`py-2 px-3 rounded-lg text-sm font-medium border ${pushType === 'event' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>Event</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Titel</label>
                <input 
                  type="text" 
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  placeholder="z.B. Kurzfristige Hallenänderung!"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nachricht</label>
                <textarea 
                  value={pushMsg}
                  onChange={(e) => setPushMsg(e.target.value)}
                  placeholder="Details zur Ankündigung..."
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand resize-none"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsPushModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Abbrechen</button>
                <button type="submit" className="bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                  <Send size={16} className="mr-2" /> Senden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { Trophy, Timer, Megaphone, Calendar, MapPin, Bus, Send, X, BellRing } from 'lucide-react';
import React, { useState } from 'react';
import { CoachNews } from '../types';

export default function Dashboard({ setActiveTab, addNotification, news }: { setActiveTab: (tab: string) => void, addNotification: any, news: CoachNews[] }) {
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">Willkommen zurück, Coach!</h2>
        <button 
          onClick={() => setIsPushModalOpen(true)}
          className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg shadow-brand/20"
        >
          <BellRing size={16} className="mr-2" />
          Push-Nachricht senden
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Next Match Card */}
        <div className="bg-gradient-to-br from-brand-dark to-brand rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 text-white/20">
            <Trophy size={120} />
          </div>
          <div className="relative z-10 text-white">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Nächstes Spiel</span>
            <h3 className="text-2xl font-bold mt-4 mb-1">vs. Red Devils Wernigerode</h3>
            <p className="text-white/80 mb-4 flex items-center"><Calendar className="mr-2" size={16} />Sa, 28. Okt • 14:00 Uhr</p>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-sm font-medium flex items-center"><MapPin className="mr-2" size={16} />Stadtsporthalle, Wernigerode</p>
              <p className="text-sm mt-1 flex items-center"><Bus className="mr-2" size={16} />Treffpunkt: 11:30 Uhr Halle</p>
            </div>
          </div>
        </div>

        {/* Next Training Card */}
        <div className="bg-dark-card border border-gray-700 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Timer className="text-brand mr-2" size={20} />Nächstes Training</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-brand pl-4">
              <p className="text-sm text-gray-400">Dienstag, 18:30 - 20:00</p>
              <p className="font-medium text-white text-lg">Halle Mitte</p>
              <p className="text-sm text-brand mt-1">Fokus: Auslösung gegen hohes Pressing</p>
            </div>
            <button 
              onClick={() => setActiveTab('taktik')}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm transition-colors border border-gray-600"
            >
              Trainingsplan ansehen
            </button>
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

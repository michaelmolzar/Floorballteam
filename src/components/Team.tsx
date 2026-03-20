import { Handshake, Flame, Scale, Plus, User, X, Edit2, Save, Activity } from 'lucide-react';
import { useState } from 'react';
import { Player, PlayerStats } from '../types';

export default function Team({ players, setPlayers }: { players: Player[], setPlayers: any }) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [editForm, setEditForm] = useState<PlayerStats>({ gamesPlayed: 0, goals: 0, assists: 0, penaltyMinutes: 0 });

  const openPlayerModal = (player: Player) => {
    setSelectedPlayer(player);
    setEditForm(player.stats);
    setIsEditingStats(false);
  };

  const handleSaveStats = () => {
    if (!selectedPlayer) return;
    const updatedPlayer = { ...selectedPlayer, stats: editForm };
    setPlayers(players.map((p: Player) => p.id === updatedPlayer.id ? updatedPlayer : p));
    setSelectedPlayer(updatedPlayer);
    setIsEditingStats(false);
  };

  const goalies = players.filter(p => p.type === 'goalie');
  const fieldPlayers = players.filter(p => p.type === 'field');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Werte Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Unsere Team-Werte</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-card p-6 rounded-xl border border-gray-700 text-center hover:border-brand transition-colors">
            <div className="w-16 h-16 bg-brand/20 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
              <Handshake size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Zusammenhalt</h3>
            <p className="text-sm text-gray-400">Wir gewinnen zusammen, wir verlieren zusammen. Niemand wird auf dem Feld allein gelassen.</p>
          </div>
          <div className="bg-dark-card p-6 rounded-xl border border-gray-700 text-center hover:border-brand transition-colors">
            <div className="w-16 h-16 bg-brand/20 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">100% Einsatz</h3>
            <p className="text-sm text-gray-400">Im Training wie im Spiel. Wir geben jeden Ballwechsel alles und pushen uns gegenseitig ans Limit.</p>
          </div>
          <div className="bg-dark-card p-6 rounded-xl border border-gray-700 text-center hover:border-brand transition-colors">
            <div className="w-16 h-16 bg-brand/20 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Respekt</h3>
            <p className="text-sm text-gray-400">Respekt gegenüber dem Schiedsrichter, dem Gegner und vor allem gegenüber den eigenen Mitspielern.</p>
          </div>
        </div>
      </div>

      {/* Roster Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Kader</h2>
        
        {/* Goalies */}
        <h3 className="text-lg font-semibold text-brand mb-4">Goalies</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {goalies.map(player => (
            <div 
              key={player.id} 
              onClick={() => openPlayerModal(player)}
              className="bg-dark-card rounded-xl overflow-hidden border border-gray-700 flex flex-col items-center p-4 cursor-pointer hover:border-brand transition-colors hover:shadow-lg hover:shadow-brand/10"
            >
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-3 relative">
                <User size={40} className="text-gray-400" />
                <span className="absolute -bottom-2 -right-2 bg-brand text-white text-xs font-bold px-2 py-1 rounded-md">#{player.number}</span>
              </div>
              <p className="font-bold text-white">{player.name}</p>
              <p className="text-xs text-gray-400">{player.position}</p>
            </div>
          ))}
        </div>

        {/* Feldspieler */}
        <h3 className="text-lg font-semibold text-brand mb-4">Feldspieler</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {fieldPlayers.map(player => (
            <div 
              key={player.id}
              onClick={() => openPlayerModal(player)}
              className="bg-dark-card rounded-xl overflow-hidden border border-gray-700 flex flex-col items-center p-4 relative cursor-pointer hover:border-brand transition-colors hover:shadow-lg hover:shadow-brand/10"
            >
              {player.isCaptain && <div className="absolute top-2 left-2 text-yellow-500 text-xs font-bold bg-yellow-500/10 px-1.5 rounded" title="Captain">C</div>}
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-3 relative">
                <User size={40} className="text-gray-400" />
                <span className="absolute -bottom-2 -right-2 bg-brand text-white text-xs font-bold px-2 py-1 rounded-md">#{player.number}</span>
              </div>
              <p className="font-bold text-white">{player.name}</p>
              <p className="text-xs text-gray-400">{player.position}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Player Profile & Stats Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <User size={20} className="text-brand" />
                Spielerprofil
              </h3>
              <button onClick={() => { setSelectedPlayer(null); setIsEditingStats(false); }} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="p-6">
              {/* Header Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center relative shadow-inner">
                  <User size={40} className="text-gray-400" />
                  <span className="absolute -bottom-2 -right-2 bg-brand text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">#{selectedPlayer.number}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {selectedPlayer.name}
                    {selectedPlayer.isCaptain && <span className="text-yellow-500 text-[10px] uppercase font-bold bg-yellow-500/20 px-2 py-0.5 rounded border border-yellow-500/30">Captain</span>}
                  </h2>
                  <p className="text-brand font-medium">{selectedPlayer.position}</p>
                </div>
              </div>

              {/* Stats Section */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-white flex items-center gap-2"><Activity size={16} className="text-brand"/> Saison-Statistiken</h4>
                  <button 
                    onClick={() => isEditingStats ? handleSaveStats() : setIsEditingStats(true)} 
                    className={`text-sm font-medium flex items-center gap-1 px-2 py-1 rounded transition-colors ${isEditingStats ? 'bg-brand text-white hover:bg-brand-dark' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                  >
                    {isEditingStats ? <><Save size={14} /> Speichern</> : <><Edit2 size={14} /> Bearbeiten</>}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Spiele */}
                  <div className="bg-dark-bg p-3 rounded-lg border border-gray-700 text-center flex flex-col justify-center">
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Spiele</div>
                    {isEditingStats ? (
                      <input type="number" min="0" value={editForm.gamesPlayed} onChange={e => setEditForm({...editForm, gamesPlayed: +e.target.value})} className="w-full bg-gray-700 text-white text-center rounded px-2 py-1 focus:outline-none focus:border-brand border border-transparent" />
                    ) : (
                      <div className="text-2xl font-bold text-white">{selectedPlayer.stats.gamesPlayed}</div>
                    )}
                  </div>

                  {/* Scorerpunkte (Calculated) */}
                  <div className="bg-dark-bg p-3 rounded-lg border border-brand/30 text-center flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand/5"></div>
                    <div className="relative z-10">
                      <div className="text-[10px] text-brand uppercase font-bold mb-1 tracking-wider">Punkte</div>
                      <div className="text-2xl font-bold text-brand">{isEditingStats ? editForm.goals + editForm.assists : selectedPlayer.stats.goals + selectedPlayer.stats.assists}</div>
                    </div>
                  </div>

                  {/* Tore */}
                  <div className="bg-dark-bg p-3 rounded-lg border border-gray-700 text-center flex flex-col justify-center">
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Tore</div>
                    {isEditingStats ? (
                      <input type="number" min="0" value={editForm.goals} onChange={e => setEditForm({...editForm, goals: +e.target.value})} className="w-full bg-gray-700 text-white text-center rounded px-2 py-1 focus:outline-none focus:border-brand border border-transparent" />
                    ) : (
                      <div className="text-xl font-bold text-white">{selectedPlayer.stats.goals}</div>
                    )}
                  </div>

                  {/* Assists */}
                  <div className="bg-dark-bg p-3 rounded-lg border border-gray-700 text-center flex flex-col justify-center">
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Assists</div>
                    {isEditingStats ? (
                      <input type="number" min="0" value={editForm.assists} onChange={e => setEditForm({...editForm, assists: +e.target.value})} className="w-full bg-gray-700 text-white text-center rounded px-2 py-1 focus:outline-none focus:border-brand border border-transparent" />
                    ) : (
                      <div className="text-xl font-bold text-white">{selectedPlayer.stats.assists}</div>
                    )}
                  </div>

                  {/* Strafminuten */}
                  <div className="bg-dark-bg p-3 rounded-lg border border-gray-700 text-center col-span-2 flex flex-col justify-center">
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Strafminuten</div>
                    {isEditingStats ? (
                      <input type="number" min="0" value={editForm.penaltyMinutes} onChange={e => setEditForm({...editForm, penaltyMinutes: +e.target.value})} className="w-full max-w-[100px] mx-auto bg-gray-700 text-white text-center rounded px-2 py-1 focus:outline-none focus:border-brand border border-transparent" />
                    ) : (
                      <div className="text-xl font-bold text-white">{selectedPlayer.stats.penaltyMinutes} <span className="text-sm text-gray-500 font-normal">Min</span></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Handshake, Flame, Scale, User, X, Activity } from 'lucide-react';
import { useState } from 'react';
import { Player } from '../types';

export default function Team({ players, setPlayers }: { players: Player[], setPlayers: any }) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const openPlayerModal = (player: Player) => {
    setSelectedPlayer(player);
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
              <button onClick={() => { setSelectedPlayer(null); }} className="text-gray-400 hover:text-white"><X size={20}/></button>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

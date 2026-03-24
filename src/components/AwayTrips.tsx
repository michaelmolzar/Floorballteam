import React, { useState, useEffect } from 'react';
import { AwayTrip, Player } from '../types';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Edit2, Trash2, MapPin, Clock, Train, Car, Hotel, Utensils, Users, Save, X, Calendar } from 'lucide-react';

interface AwayTripsProps {
  userRole: 'admin' | 'coach' | 'player' | 'guest';
  players: Player[];
}

const AwayTrips: React.FC<AwayTripsProps> = ({ userRole, players }) => {
  const [trips, setTrips] = useState<AwayTrip[]>([]);
  const [editingTrip, setEditingTrip] = useState<AwayTrip | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const canEdit = userRole === 'admin' || userRole === 'coach';

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'awayTrips'), (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AwayTrip));
      // Sort by date descending
      tripsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTrips(tripsData);
      if (tripsData.length > 0 && !selectedTripId) {
        setSelectedTripId(tripsData[0].id);
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async (trip: AwayTrip) => {
    try {
      await setDoc(doc(db, 'awayTrips', trip.id), trip);
      setEditingTrip(null);
      setIsCreating(false);
      setSelectedTripId(trip.id);
    } catch (error) {
      console.error("Error saving trip:", error);
      alert("Fehler beim Speichern der Auswärtsfahrt.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Möchtest du diese Auswärtsfahrt wirklich löschen?')) {
      try {
        await deleteDoc(doc(db, 'awayTrips', id));
        if (selectedTripId === id) {
          setSelectedTripId(trips.length > 1 ? trips.find(t => t.id !== id)?.id || null : null);
        }
      } catch (error) {
        console.error("Error deleting trip:", error);
      }
    }
  };

  const startCreate = () => {
    const newTrip: AwayTrip = {
      id: Date.now().toString(),
      title: 'Neue Auswärtsfahrt',
      date: new Date().toISOString().split('T')[0],
      arenaAddress: '',
      trainOutboundTime: '',
      trainReturnTime: '',
      hotelName: '',
      hotelAddress: '',
      restaurantInfo: '',
      roster: [],
      carTravelers: [],
      trainTravelers: [],
      hotelGuests: []
    };
    setEditingTrip(newTrip);
    setIsCreating(true);
  };

  const getPlayerName = (id: string) => {
    const player = players.find(p => p.id === id);
    return player ? player.name : 'Unbekannt';
  };

  if (isCreating || editingTrip) {
    const trip = editingTrip!;
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-dark-card rounded-xl border border-gray-700 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{isCreating ? 'Neue Auswärtsfahrt erstellen' : 'Auswärtsfahrt bearbeiten'}</h2>
            <button onClick={() => { setEditingTrip(null); setIsCreating(false); }} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Titel (Gegner/Ort)</label>
                <input type="text" value={trip.title} onChange={e => setEditingTrip({...trip, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand outline-none" placeholder="z.B. vs. München" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Datum</label>
                <input type="date" value={trip.date} onChange={e => setEditingTrip({...trip, date: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Adresse der Halle</label>
                <textarea value={trip.arenaAddress} onChange={e => setEditingTrip({...trip, arenaAddress: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand outline-none h-20" placeholder="Straße, PLZ Ort" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Zug Hinfahrt</label>
                  <input type="text" value={trip.trainOutboundTime} onChange={e => setEditingTrip({...trip, trainOutboundTime: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand outline-none" placeholder="z.B. 14:30 Uhr ab Hbf" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Zug Rückfahrt</label>
                  <input type="text" value={trip.trainReturnTime} onChange={e => setEditingTrip({...trip, trainReturnTime: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand outline-none" placeholder="z.B. 20:15 Uhr" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hotel Name</label>
                <input type="text" value={trip.hotelName} onChange={e => setEditingTrip({...trip, hotelName: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand outline-none" placeholder="z.B. Motel One" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hotel Adresse</label>
                <textarea value={trip.hotelAddress} onChange={e => setEditingTrip({...trip, hotelAddress: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand outline-none h-20" placeholder="Straße, PLZ Ort" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Restaurant / Verpflegung</label>
                <textarea value={trip.restaurantInfo} onChange={e => setEditingTrip({...trip, restaurantInfo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand outline-none h-20" placeholder="Infos zum Essen..." />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Personen-Zuteilung</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Kader */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Users size={16} className="text-brand" /> Kader</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {players.map(p => (
                    <label key={`roster-${p.id}`} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={trip.roster.includes(p.id)}
                        onChange={(e) => {
                          const newRoster = e.target.checked 
                            ? [...trip.roster, p.id] 
                            : trip.roster.filter(id => id !== p.id);
                          setEditingTrip({...trip, roster: newRoster});
                        }}
                        className="rounded border-gray-600 text-brand focus:ring-brand bg-gray-700"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Auto */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Car size={16} className="text-blue-400" /> Auto</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {players.map(p => (
                    <label key={`car-${p.id}`} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={trip.carTravelers.includes(p.id)}
                        onChange={(e) => {
                          const newTravelers = e.target.checked 
                            ? [...trip.carTravelers, p.id] 
                            : trip.carTravelers.filter(id => id !== p.id);
                          setEditingTrip({...trip, carTravelers: newTravelers});
                        }}
                        className="rounded border-gray-600 text-brand focus:ring-brand bg-gray-700"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Zug */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Train size={16} className="text-green-400" /> Zug</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {players.map(p => (
                    <label key={`train-${p.id}`} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={trip.trainTravelers.includes(p.id)}
                        onChange={(e) => {
                          const newTravelers = e.target.checked 
                            ? [...trip.trainTravelers, p.id] 
                            : trip.trainTravelers.filter(id => id !== p.id);
                          setEditingTrip({...trip, trainTravelers: newTravelers});
                        }}
                        className="rounded border-gray-600 text-brand focus:ring-brand bg-gray-700"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Hotel */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Hotel size={16} className="text-purple-400" /> Hotel</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {players.map(p => (
                    <label key={`hotel-${p.id}`} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={trip.hotelGuests.includes(p.id)}
                        onChange={(e) => {
                          const newGuests = e.target.checked 
                            ? [...trip.hotelGuests, p.id] 
                            : trip.hotelGuests.filter(id => id !== p.id);
                          setEditingTrip({...trip, hotelGuests: newGuests});
                        }}
                        className="rounded border-gray-600 text-brand focus:ring-brand bg-gray-700"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button onClick={() => { setEditingTrip(null); setIsCreating(false); }} className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
              Abbrechen
            </button>
            <button onClick={() => handleSave(trip)} className="bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Save size={18} /> Speichern
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Auswärtsfahrten</h2>
        {canEdit && (
          <button onClick={startCreate} className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Plus size={18} /> <span className="hidden sm:inline">Neue Fahrt</span>
          </button>
        )}
      </div>

      {trips.length === 0 ? (
        <div className="bg-dark-card rounded-xl border border-gray-700 p-12 text-center">
          <MapPin size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Keine Auswärtsfahrten</h3>
          <p className="text-gray-400">Aktuell sind keine Auswärtsfahrten geplant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trip List Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            {trips.map(trip => (
              <button
                key={trip.id}
                onClick={() => setSelectedTripId(trip.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTripId === trip.id 
                    ? 'bg-gray-800 border-brand shadow-lg shadow-brand/10' 
                    : 'bg-dark-card border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Calendar size={14} />
                  {new Date(trip.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                <h3 className={`font-bold text-lg ${selectedTripId === trip.id ? 'text-brand' : 'text-white'}`}>
                  {trip.title}
                </h3>
              </button>
            ))}
          </div>

          {/* Trip Details */}
          {selectedTrip && (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-dark-card rounded-xl border border-gray-700 p-6 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedTrip.title}</h2>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={16} />
                      {new Date(selectedTrip.date).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <button onClick={() => setEditingTrip(selectedTrip)} className="p-2 bg-gray-800 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors" title="Bearbeiten">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(selectedTrip.id)} className="p-2 bg-gray-800 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors" title="Löschen">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Location Info */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="mt-1 bg-gray-800 p-2 rounded-lg text-brand shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Halle</h4>
                        <p className="text-white whitespace-pre-line">{selectedTrip.arenaAddress || 'Keine Adresse angegeben'}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="mt-1 bg-gray-800 p-2 rounded-lg text-purple-400 shrink-0">
                        <Hotel size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Hotel</h4>
                        <p className="text-white font-medium">{selectedTrip.hotelName || 'Kein Hotel angegeben'}</p>
                        {selectedTrip.hotelAddress && <p className="text-gray-300 text-sm whitespace-pre-line mt-1">{selectedTrip.hotelAddress}</p>}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="mt-1 bg-gray-800 p-2 rounded-lg text-yellow-500 shrink-0">
                        <Utensils size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Restaurant</h4>
                        <p className="text-white whitespace-pre-line">{selectedTrip.restaurantInfo || 'Keine Infos'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Travel Info */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="mt-1 bg-gray-800 p-2 rounded-lg text-green-400 shrink-0">
                        <Train size={20} />
                      </div>
                      <div className="w-full">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Zugverbindung</h4>
                        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Hinfahrt:</span>
                            <span className="text-white font-medium">{selectedTrip.trainOutboundTime || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Rückfahrt:</span>
                            <span className="text-white font-medium">{selectedTrip.trainReturnTime || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lists */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Teilnehmer & Einteilung</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1"><Users size={14} className="text-brand"/> Kader</span>
                        <span className="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{selectedTrip.roster.length}</span>
                      </h4>
                      <ul className="space-y-1">
                        {selectedTrip.roster.length > 0 ? selectedTrip.roster.map(id => (
                          <li key={id} className="text-sm text-gray-300">{getPlayerName(id)}</li>
                        )) : <li className="text-sm text-gray-500 italic">Keine Spieler</li>}
                      </ul>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1"><Car size={14} className="text-blue-400"/> Auto</span>
                        <span className="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{selectedTrip.carTravelers.length}</span>
                      </h4>
                      <ul className="space-y-1">
                        {selectedTrip.carTravelers.length > 0 ? selectedTrip.carTravelers.map(id => (
                          <li key={id} className="text-sm text-gray-300">{getPlayerName(id)}</li>
                        )) : <li className="text-sm text-gray-500 italic">Keine</li>}
                      </ul>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1"><Train size={14} className="text-green-400"/> Zug</span>
                        <span className="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{selectedTrip.trainTravelers.length}</span>
                      </h4>
                      <ul className="space-y-1">
                        {selectedTrip.trainTravelers.length > 0 ? selectedTrip.trainTravelers.map(id => (
                          <li key={id} className="text-sm text-gray-300">{getPlayerName(id)}</li>
                        )) : <li className="text-sm text-gray-500 italic">Keine</li>}
                      </ul>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1"><Hotel size={14} className="text-purple-400"/> Hotel</span>
                        <span className="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{selectedTrip.hotelGuests.length}</span>
                      </h4>
                      <ul className="space-y-1">
                        {selectedTrip.hotelGuests.length > 0 ? selectedTrip.hotelGuests.map(id => (
                          <li key={id} className="text-sm text-gray-300">{getPlayerName(id)}</li>
                        )) : <li className="text-sm text-gray-500 italic">Keine</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AwayTrips;

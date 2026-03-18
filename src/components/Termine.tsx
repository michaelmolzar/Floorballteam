import { useState } from 'react';
import { MapPin, Bus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import { Termin } from '../types';

export default function Termine({ termine }: { termine: Termin[] }) {
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<'all' | 'training' | 'game' | 'event'>('all');

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthName = currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' });

  const filteredTermine = termine.filter(t => filterType === 'all' || t.type === filterType);
  const sortedTermine = [...filteredTermine].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredTermine.filter(t => t.date === dateStr);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 border-b border-gray-700 pb-4 gap-4">
        <h2 className="text-2xl font-bold text-white">Kalender & Events</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Filter */}
          <div className="flex bg-gray-800 rounded-lg p-1 overflow-x-auto">
            <button 
              onClick={() => setFilterType('all')} 
              className={`flex-shrink-0 px-3 py-1.5 rounded text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Alle
            </button>
            <button 
              onClick={() => setFilterType('training')} 
              className={`flex-shrink-0 px-3 py-1.5 rounded text-sm font-medium transition-colors ${filterType === 'training' ? 'bg-brand/20 text-brand shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Training
            </button>
            <button 
              onClick={() => setFilterType('game')} 
              className={`flex-shrink-0 px-3 py-1.5 rounded text-sm font-medium transition-colors ${filterType === 'game' ? 'bg-yellow-500/20 text-yellow-500 shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Spieltage
            </button>
            <button 
              onClick={() => setFilterType('event')} 
              className={`flex-shrink-0 px-3 py-1.5 rounded text-sm font-medium transition-colors ${filterType === 'event' ? 'bg-purple-500/20 text-purple-400 shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Sonstiges
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1 flex-shrink-0">
            <button 
              onClick={() => setView('calendar')} 
              className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <CalendarIcon size={16} className="mr-2" /> Kalender
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'list' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={16} className="mr-2" /> Liste
            </button>
          </div>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="bg-dark-card rounded-xl border border-gray-700 overflow-hidden shadow-lg">
          {/* Calendar Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800/50">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-700 rounded-full text-gray-300 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-bold text-white">{monthName}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-700 rounded-full text-gray-300 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 text-center border-b border-gray-700 bg-gray-900/50">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
              <div key={day} className="py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-gray-700/50 bg-gray-800/20 p-1 sm:p-2 opacity-50"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
              
              return (
                <div key={day} className={`min-h-[100px] border-b border-r border-gray-700/50 p-1 sm:p-2 transition-colors hover:bg-gray-800/30 ${isToday ? 'bg-brand/5' : ''}`}>
                  <div className={`text-right text-sm font-medium mb-1 ${isToday ? 'text-brand font-bold' : 'text-gray-400'}`}>
                    <span className={isToday ? 'bg-brand/20 px-2 py-0.5 rounded-full' : ''}>{day}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id} 
                        className={`text-[10px] sm:text-xs px-1.5 py-1 rounded truncate border-l-2 ${
                          event.type === 'training' ? 'bg-brand/10 border-brand text-gray-300' : 
                          event.type === 'game' ? 'bg-yellow-500/10 border-yellow-500 text-gray-300' : 
                          'bg-purple-500/10 border-purple-500 text-gray-300'
                        }`}
                        title={`${event.time} - ${event.title}`}
                      >
                        <span className="font-bold hidden sm:inline">{event.time}</span> {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* Fill remaining cells to complete the grid */}
            {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
              <div key={`empty-end-${i}`} className="min-h-[100px] border-b border-r border-gray-700/50 bg-gray-800/20 p-1 sm:p-2 opacity-50"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-dark-card rounded-xl overflow-hidden border border-gray-700 shadow-lg">
          {sortedTermine.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Keine Termine vorhanden.</div>
          ) : (
            sortedTermine.map((termin, index) => {
              const dateObj = new Date(termin.date);
              const dayName = dateObj.toLocaleDateString('de-DE', { weekday: 'short' });
              const dayNum = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
              
              return (
                <div key={termin.id} className={`flex flex-col sm:flex-row p-4 hover:bg-gray-800/50 transition-colors ${index !== sortedTermine.length - 1 ? 'border-b border-gray-700' : ''} ${termin.type === 'game' ? 'bg-yellow-500/5' : ''}`}>
                  <div className="w-32 flex-shrink-0 mb-2 sm:mb-0">
                    <div className={`text-xs font-bold uppercase ${
                      termin.type === 'training' ? 'text-brand' : 
                      termin.type === 'game' ? 'text-yellow-500' : 
                      'text-purple-400'
                    }`}>
                      {termin.type === 'training' ? 'Training' : termin.type === 'game' ? 'Spieltag' : 'Event'}
                    </div>
                    <div className="text-lg font-bold text-white">{dayName}, {dayNum}</div>
                    <div className="text-sm text-gray-400">{termin.time} Uhr</div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-lg font-semibold text-white">{termin.title}</h4>
                    {termin.location && (
                      <p className="text-sm text-gray-400 mt-1 flex items-center"><MapPin size={14} className="mr-1" /> {termin.location}</p>
                    )}
                    {termin.description && (
                      <div className="mt-2 text-sm text-gray-300 bg-gray-800/50 p-2 rounded border border-gray-700/50">
                        {termin.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

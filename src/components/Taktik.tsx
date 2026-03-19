import { useState } from 'react';
import { Lock, AlertTriangle, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { PlaybookItem, TrainingPlan } from '../types';

export default function Taktik({ playbookItems, trainingPlans }: { playbookItems: PlaybookItem[], trainingPlans: TrainingPlan[] }) {
  const [activeSubTab, setActiveSubTab] = useState<'playbook' | 'training' | 'gegner'>('playbook');
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>(playbookItems[0]?.id || '');
  const [isCoach, setIsCoach] = useState(false); // Simulate coach role

  const selectedPlaybook = playbookItems.find(p => p.id === selectedPlaybookId);
  const offensiveItems = playbookItems.filter(p => p.type === 'Offensive');
  const defensiveItems = playbookItems.filter(p => p.type === 'Defensive');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sub-Navigation for Taktik */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-700 pb-4">
        <div className="flex gap-4 overflow-x-auto w-full sm:w-auto">
          <button 
            onClick={() => setActiveSubTab('playbook')}
            className={`${activeSubTab === 'playbook' ? 'bg-brand text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'} px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors`}
          >
            Playbook (Spielzüge)
          </button>
          <button 
            onClick={() => setActiveSubTab('training')}
            className={`${activeSubTab === 'training' ? 'bg-brand text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'} px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors`}
          >
            Trainingsplan
          </button>
          <button 
            onClick={() => setActiveSubTab('gegner')}
            className={`${activeSubTab === 'gegner' ? 'bg-brand text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'} px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center`}
          >
            <Lock size={14} className="mr-2 opacity-70" />Gegneranalyse
          </button>
        </div>
        
        {/* Simulate Coach Role Toggle */}
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Trainer-Ansicht</span>
          <button 
            onClick={() => setIsCoach(!isCoach)}
            className={`w-10 h-5 rounded-full relative transition-colors ${isCoach ? 'bg-brand' : 'bg-gray-600'}`}
          >
            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${isCoach ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>

      {activeSubTab === 'playbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Playbook List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xl font-bold text-white mb-4">Offensive</h3>
            {offensiveItems.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedPlaybookId(item.id)}
                className={`${selectedPlaybookId === item.id ? 'bg-brand/20 border-brand' : 'bg-dark-card border-gray-700 hover:border-gray-500'} border p-3 rounded-lg cursor-pointer transition-colors`}
              >
                <div className={`font-bold ${selectedPlaybookId === item.id ? 'text-white' : 'text-gray-300'}`}>{item.title}</div>
                <div className={`text-xs mt-1 ${selectedPlaybookId === item.id ? 'text-brand' : 'text-gray-500'}`}>{item.situation}</div>
              </div>
            ))}
            
            <h3 className="text-xl font-bold text-white mt-6 mb-4">Defensive</h3>
            {defensiveItems.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedPlaybookId(item.id)}
                className={`${selectedPlaybookId === item.id ? 'bg-brand/20 border-brand' : 'bg-dark-card border-gray-700 hover:border-gray-500'} border p-3 rounded-lg cursor-pointer transition-colors`}
              >
                <div className={`font-bold ${selectedPlaybookId === item.id ? 'text-white' : 'text-gray-300'}`}>{item.title}</div>
                <div className={`text-xs mt-1 ${selectedPlaybookId === item.id ? 'text-brand' : 'text-gray-500'}`}>{item.situation}</div>
              </div>
            ))}
          </div>

          {/* Playbook View Area */}
          <div className="lg:col-span-2">
            {selectedPlaybook ? (
              <div className="bg-dark-card border border-gray-700 rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedPlaybook.title}</h2>
                    <p className="text-gray-400 text-sm">{selectedPlaybook.description}</p>
                  </div>
                  <span className="bg-brand/20 text-brand px-2 py-1 rounded text-xs font-bold">Aktiv</span>
                </div>

                {/* Visual Rink Representation or Uploaded Image */}
                {selectedPlaybook.imageUrl ? (
                  <div className="w-full mb-6 rounded-2xl overflow-hidden border-2 border-gray-700 bg-gray-900 flex justify-center items-center">
                    {selectedPlaybook.imageUrl.toLowerCase().includes('.pdf') || selectedPlaybook.imageUrl.toLowerCase().includes('%2fpdf') ? (
                      <div className="flex flex-col items-center justify-center p-12 w-full">
                        <FileText size={64} className="text-red-400 mb-4" />
                        <h3 className="text-xl text-white font-bold mb-2">PDF Dokument</h3>
                        <p className="text-gray-400 mb-4">Dieser Spielzug enthält ein PDF Dokument.</p>
                        <a 
                          href={selectedPlaybook.imageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-lg font-bold transition-colors"
                        >
                          PDF öffnen
                        </a>
                      </div>
                    ) : (
                      <img src={selectedPlaybook.imageUrl} alt={selectedPlaybook.title} className="max-w-full max-h-[400px] object-contain" />
                    )}
                  </div>
                ) : (
                  <div className="bg-[#e0f2fe] border-4 border-[#0284c7] rounded-2xl relative overflow-hidden w-full aspect-[2/1] mb-6">
                    {/* SVG Floorball Field (Simplified) */}
                    <svg viewBox="0 0 400 200" className="w-full h-full opacity-60">
                      {/* Center line & spot */}
                      <line x1="200" y1="0" x2="200" y2="200" stroke="#ef4444" strokeWidth="2"/>
                      <circle cx="200" cy="100" r="30" fill="none" stroke="#ef4444" strokeWidth="2"/>
                      <circle cx="200" cy="100" r="3" fill="#ef4444"/>
                      {/* Goal Creases */}
                      <path d="M 0 75 Q 40 75 40 100 Q 40 125 0 125" fill="none" stroke="#ef4444" strokeWidth="2"/>
                      <rect x="0" y="90" width="15" height="20" fill="none" stroke="#ef4444" strokeWidth="2"/>
                      <path d="M 400 75 Q 360 75 360 100 Q 360 125 400 125" fill="none" stroke="#ef4444" strokeWidth="2"/>
                      <rect x="385" y="90" width="15" height="20" fill="none" stroke="#ef4444" strokeWidth="2"/>
                    </svg>

                    {/* Player Nodes (Interactive layer) - Static for prototype but could be dynamic based on playbook item */}
                    <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-brand rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-black z-10 shadow-md">D1</div>
                    <div className="absolute top-[20%] left-[15%] w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-brand rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-black z-10">D2</div>
                    <div className="absolute top-1/2 left-[30%] -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-brand rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-black z-10">C</div>
                    <div className="absolute top-[15%] left-[45%] w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-brand rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-black z-10">W1</div>
                    <div className="absolute bottom-[15%] left-[40%] w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-brand rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-black z-10">W2</div>

                    {/* Example Arrow (SVG overlay) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#0ea5e9" />
                        </marker>
                        <marker id="dasharrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#facc15" />
                        </marker>
                      </defs>
                      <line x1="12%" y1="50%" x2="16%" y2="25%" stroke="#0ea5e9" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                      <path d="M 32% 50% Q 40% 70% 45% 60%" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#dasharrow)"/>
                    </svg>
                  </div>
                )}

                {/* Text Explanation */}
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-lg border-b border-gray-700 pb-2">Ablauf:</h4>
                  <ol className="list-decimal list-inside text-gray-300 space-y-2 text-sm leading-relaxed">
                    {selectedPlaybook.steps.map((step, idx) => (
                      <li key={idx} dangerouslySetInnerHTML={{ __html: step.replace(/D1|D2|W1|W2/g, '<strong class="text-brand">$&</strong>').replace(/Center \(C\)|Center/g, '<strong class="text-yellow-500">$&</strong>') }} />
                    ))}
                  </ol>
                </div>

                {/* Advanced Tactics (Coach Only) */}
                {isCoach && selectedPlaybook.advancedTactics && (
                  <div className="mt-6 bg-brand/10 border border-brand/30 rounded-lg p-4">
                    <h4 className="font-bold text-brand flex items-center mb-2">
                      <Lock size={16} className="mr-2" /> Fortgeschrittene Taktiken (Trainer)
                    </h4>
                    <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                      {selectedPlaybook.advancedTactics}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-dark-card border border-gray-700 rounded-xl p-6 text-center text-gray-500">
                Bitte wähle einen Spielzug aus der Liste aus.
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'training' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainingPlans.map(plan => (
            <div key={plan.id} className="bg-dark-card border border-gray-700 rounded-xl p-6 hover:border-brand transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                  <div className="flex items-center text-gray-400 text-sm mt-1">
                    <CalendarIcon size={14} className="mr-1" /> {new Date(plan.date).toLocaleDateString('de-DE')}
                  </div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <FileText className="text-brand" size={24} />
                </div>
              </div>
              <div className="mb-6">
                <span className="text-xs text-gray-500 uppercase font-bold">Fokus</span>
                <p className="text-gray-300 font-medium">{plan.focus}</p>
              </div>
              {plan.pdfUrl ? (
                <a href={plan.pdfUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-brand hover:bg-brand-dark text-white py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center">
                  PDF Ansehen / Download
                </a>
              ) : (
                <button disabled className="w-full bg-gray-800 text-gray-500 py-2 rounded-lg font-medium text-sm cursor-not-allowed">
                  Keine PDF verfügbar
                </button>
              )}
            </div>
          ))}
          {trainingPlans.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-10">
              Keine Trainingspläne verfügbar.
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'gegner' && (
        <div className="bg-dark-card border border-gray-700 rounded-xl p-10 text-center">
          <Lock size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Gegneranalyse</h3>
          <p className="text-gray-400 max-w-md mx-auto">Dieser Bereich ist passwortgeschützt oder nur für Trainer sichtbar. Hier werden Schwächen und Stärken der kommenden Gegner analysiert.</p>
        </div>
      )}
    </div>
  );
}

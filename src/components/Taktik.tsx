import { useState } from 'react';
import { Lock, AlertTriangle, FileText, Calendar as CalendarIcon, BookOpen, X, Download, Eye } from 'lucide-react';
import { TrainingPlan, PlaybookItem } from '../types';

export default function Taktik({ trainingPlans, playbookItems }: { trainingPlans: TrainingPlan[], playbookItems: PlaybookItem[] }) {
  const [activeSubTab, setActiveSubTab] = useState<'playbook' | 'training' | 'gegner'>('playbook');
  const [isCoach, setIsCoach] = useState(false); // Simulate coach role
  const [selectedPdf, setSelectedPdf] = useState<{url: string, title: string} | null>(null);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sub-Navigation for Taktik */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-700 pb-4">
        <div className="flex gap-4 overflow-x-auto w-full sm:w-auto">
          <button 
            onClick={() => setActiveSubTab('playbook')}
            className={`${activeSubTab === 'playbook' ? 'bg-brand text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'} px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors`}
          >
            Playbook
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {playbookItems.map(item => (
            <div key={item.id} className="bg-dark-card border border-gray-700 rounded-xl p-6 hover:border-brand transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <div className="flex items-center text-gray-400 text-sm mt-1">
                    <BookOpen size={14} className="mr-1" /> {item.category}
                  </div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <FileText className="text-brand" size={24} />
                </div>
              </div>
              {item.pdfUrl ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedPdf({url: item.pdfUrl!, title: item.title})} 
                    className="flex-1 bg-brand hover:bg-brand-dark text-white py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center"
                  >
                    <Eye size={16} className="mr-2" /> Ansehen
                  </button>
                  <a 
                    href={item.pdfUrl} 
                    download={`${item.title}.pdf`} 
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    title="Herunterladen"
                  >
                    <Download size={16} />
                  </a>
                </div>
              ) : (
                <button disabled className="w-full bg-gray-800 text-gray-500 py-2 rounded-lg font-medium text-sm cursor-not-allowed">
                  Keine PDF verfügbar
                </button>
              )}
            </div>
          ))}
          {playbookItems.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-10">
              Keine Playbook-Einträge verfügbar.
            </div>
          )}
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
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedPdf({url: plan.pdfUrl!, title: plan.title})} 
                    className="flex-1 bg-brand hover:bg-brand-dark text-white py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center"
                  >
                    <Eye size={16} className="mr-2" /> Ansehen
                  </button>
                  <a 
                    href={plan.pdfUrl} 
                    download={`${plan.title}.pdf`} 
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    title="Herunterladen"
                  >
                    <Download size={16} />
                  </a>
                </div>
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

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-dark-card border border-gray-700 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800/50">
              <h3 className="text-xl font-bold text-white truncate pr-4">{selectedPdf.title}</h3>
              <div className="flex items-center gap-3 shrink-0">
                <a 
                  href={selectedPdf.url} 
                  download={`${selectedPdf.title}.pdf`}
                  className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors"
                >
                  <Download size={16} /> <span className="hidden sm:inline">Download</span>
                </a>
                <button onClick={() => setSelectedPdf(null)} className="text-gray-400 hover:text-white transition-colors p-1 bg-gray-800 hover:bg-gray-700 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-grow bg-gray-900 w-full h-full relative">
              <iframe 
                src={`${selectedPdf.url}#toolbar=0`} 
                className="w-full h-full border-0"
                title={selectedPdf.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

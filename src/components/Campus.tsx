import { useState } from 'react';
import { Apple, Activity, BookOpen, ArrowRight, X } from 'lucide-react';
import { CampusArticle } from '../types';

const iconMap: Record<string, any> = {
  apple: Apple,
  activity: Activity,
  book: BookOpen
};

const colorMap: Record<string, string> = {
  yellow: 'from-yellow-600 to-yellow-400 text-yellow-500',
  gray: 'from-gray-600 to-gray-400 text-gray-400',
  black: 'from-neutral-800 to-neutral-600 text-neutral-400'
};

export default function Campus({ articles }: { articles: CampusArticle[] }) {
  const [selectedArticle, setSelectedArticle] = useState<CampusArticle | null>(null);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-white mb-4">Floorball Campus</h2>
        <p className="text-gray-400">Hier findet ihr alles, was euch neben dem Spielfeld besser macht. Ernährung, Mental-Tipps und Regelkunde.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => {
          const IconComponent = iconMap[article.iconType] || BookOpen;
          const colorClasses = colorMap[article.color] || colorMap.yellow;
          const [bgGradient, textColor] = colorClasses.split(' text-');

          return (
            <div key={article.id} className="bg-dark-card border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-brand/10 transition-shadow">
              <div className={`h-32 bg-gradient-to-r ${bgGradient} flex items-center justify-center`}>
                <IconComponent size={48} className="text-white/80" />
              </div>
              <div className="p-5">
                <span className={`text-xs font-bold text-${textColor} uppercase tracking-wider`}>{article.category}</span>
                <h3 className="text-lg font-bold text-white mt-2 mb-2">{article.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{article.summary}</p>
                <button 
                  onClick={() => setSelectedArticle(article)}
                  className="text-brand text-sm font-semibold hover:text-brand-dark flex items-center"
                >
                  Weiterlesen <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-gray-700 text-white">
                  {selectedArticle.category}
                </span>
                <h3 className="font-bold text-white text-lg">{selectedArticle.title}</h3>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                {selectedArticle.content || 'Kein Inhalt verfügbar.'}
              </div>
            </div>
            <div className="p-4 border-t border-gray-700 bg-gray-800/30 flex justify-end">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

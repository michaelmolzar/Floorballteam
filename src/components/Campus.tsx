import { Apple, Activity, BookOpen, ArrowRight } from 'lucide-react';
import { CampusArticle } from '../types';

const iconMap = {
  apple: Apple,
  activity: Activity,
  book: BookOpen
};

const colorMap = {
  green: 'from-green-600 to-green-400 text-green-500',
  blue: 'from-blue-600 to-blue-400 text-blue-500',
  purple: 'from-purple-600 to-purple-400 text-purple-400'
};

export default function Campus({ articles }: { articles: CampusArticle[] }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-white mb-4">Floorball Campus</h2>
        <p className="text-gray-400">Hier findet ihr alles, was euch neben dem Spielfeld besser macht. Ernährung, Mental-Tipps und Regelkunde für die U17.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => {
          const IconComponent = iconMap[article.iconType] || BookOpen;
          const colorClasses = colorMap[article.color] || colorMap.blue;
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
                <button className="text-brand text-sm font-semibold hover:text-brand-dark flex items-center">
                  Weiterlesen <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

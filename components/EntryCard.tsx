import React from 'react';
import { Entry } from '../types';
import { Calendar, Sparkles, Trash2, Pencil, Share2 } from 'lucide-react';

interface EntryCardProps {
  entry: Entry;
  index: number;
  onDelete: (id: number) => void;
  onEdit: (entry: Entry) => void;
  onShare: (entry: Entry) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, index, onDelete, onEdit, onShare }) => {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(entry.date));

  return (
    <article 
      className="group bg-white dark:bg-stone-800 p-6 rounded-xl shadow-md border border-stone-200 dark:border-stone-700 hover:shadow-lg transition-shadow duration-300 animate-fade-in relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center text-stone-500 dark:text-stone-400 text-sm mb-3">
        <Calendar className="w-4 h-4 mr-2" />
        <time dateTime={entry.date}>{formattedDate}</time>
      </div>
      <p className="text-stone-700 dark:text-stone-300 text-lg leading-relaxed whitespace-pre-wrap">{entry.text}</p>
      
      <div className="mt-5 pt-5 border-t border-amber-200/80 dark:border-amber-900/80">
         <div className="flex items-center text-amber-800 dark:text-amber-400 mb-2">
            <Sparkles className="w-5 h-5 mr-2 flex-shrink-0" />
            <h4 className="font-semibold font-serif">Reflexão Inspirada</h4>
         </div>
         <p className="text-stone-600 dark:text-stone-400 italic">"{entry.reflection}"</p>
      </div>
       <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={() => onEdit(entry)} className="p-2 rounded-full bg-stone-100/80 hover:bg-stone-200 text-stone-600 dark:bg-stone-700/80 dark:hover:bg-stone-600 dark:text-stone-300 transition-all duration-200 ease-in-out active:scale-95" aria-label="Editar entrada">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => onShare(entry)} className="p-2 rounded-full bg-stone-100/80 hover:bg-stone-200 text-stone-600 dark:bg-stone-700/80 dark:hover:bg-stone-600 dark:text-stone-300 transition-all duration-200 ease-in-out active:scale-95" aria-label="Compartilhar entrada">
          <Share2 className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(entry.id)} className="p-2 rounded-full bg-red-100/80 hover:bg-red-200 text-red-600 dark:bg-red-900/50 dark:hover:bg-red-900/80 dark:text-red-400 transition-all duration-200 ease-in-out active:scale-95" aria-label="Apagar entrada">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

       <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            opacity: 0; /* Inicia invisível para a animação com delay funcionar */
            animation: fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
    `}</style>
    </article>
  );
};

export default EntryCard;
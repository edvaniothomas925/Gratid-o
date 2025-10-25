import React from 'react';
import { Entry } from '../types';
import EntryCard from './EntryCard';

interface EntryListProps {
  entries: Entry[];
  totalEntriesCount: number;
  onDelete: (id: number) => void;
  onEdit: (entry: Entry) => void;
  onShare: (entry: Entry) => void;
}

const EntryList: React.FC<EntryListProps> = ({ entries, totalEntriesCount, onDelete, onEdit, onShare }) => {
  if (entries.length === 0) {
    const message = totalEntriesCount > 0 
      ? { title: "Nenhum resultado encontrado.", subtitle: "Tente ajustar sua busca ou filtros." }
      : { title: "Nenhuma entrada ainda.", subtitle: "Seu diário de gratidão está esperando por sua primeira história." };

    return (
      <div className="text-center py-12 px-6 bg-white/50 dark:bg-stone-800/50 rounded-lg border border-dashed border-stone-300 dark:border-stone-700">
        <h3 className="text-xl font-serif text-stone-600 dark:text-stone-300">{message.title}</h3>
        <p className="text-stone-500 dark:text-stone-400 mt-2">{message.subtitle}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
       <h2 className="text-2xl font-serif text-amber-900 dark:text-amber-300 border-b-2 border-amber-200 dark:border-amber-800 pb-2 mb-6">Suas Memórias de Gratidão</h2>
      <div className="space-y-6">
        {entries.map((entry, index) => (
          <EntryCard 
            key={entry.id} 
            entry={entry} 
            index={index} 
            onDelete={onDelete}
            onEdit={onEdit}
            onShare={onShare}
          />
        ))}
      </div>
    </div>
  );
};

export default EntryList;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Entry, SortOrder, NotificationType } from '../types';
import { storageService } from '../services/storageService';
import { generateReflection } from '../services/geminiService';

interface UseJournalProps {
  user: string;
  setNotification: React.Dispatch<React.SetStateAction<{ message: string; type: NotificationType } | null>>;
  handleApiError: (err: unknown, context: 'quote' | 'entry') => void;
}

export const useJournal = ({ user, setNotification, handleApiError }: UseJournalProps) => {
  const [entries, setEntries] = useState<Entry[]>(() => storageService.loadEntries(user));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    storageService.saveEntries(user, entries);
  }, [entries, user]);
  
  const addEntry = useCallback(async (text: string): Promise<boolean> => {
    setNotification(null);
    if (!text.trim()) {
      setNotification({ message: "A entrada não pode estar vazia.", type: 'error' });
      return false;
    }
    
    let newEntry: Entry;
    try {
      const reflection = await generateReflection(text);
      newEntry = { id: Date.now(), date: new Date().toISOString(), text, reflection };
    } catch (err) {
      handleApiError(err, 'entry');
      newEntry = { id: Date.now(), date: new Date().toISOString(), text, reflection: "Não foi possível gerar uma reflexão neste momento." };
    }
    
    setEntries(prevEntries => [newEntry, ...prevEntries]);
    return true; // Return a flag to show ad
  }, [handleApiError, setNotification]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
  };

  const hasFilters = useMemo(() => !!searchTerm || !!filterDate, [searchTerm, filterDate]);

  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        const matchesSearch = searchTerm ?
          entry.text.toLowerCase().includes(lowerCaseSearch) ||
          (entry.reflection && entry.reflection.toLowerCase().includes(lowerCaseSearch)) : true;

        const matchesDate = filterDate ?
          new Date(entry.date).toISOString().startsWith(filterDate) : true;

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [entries, searchTerm, filterDate, sortOrder]);

  const handleDeleteEntry = (id: number | null) => {
    setDeletingEntryId(id);
  };

  const handleConfirmDelete = () => {
    if (deletingEntryId !== null) {
      setEntries(prev => prev.filter(entry => entry.id !== deletingEntryId));
      setDeletingEntryId(null);
      setNotification({ message: 'Entrada apagada com sucesso.', type: 'info' });
    }
  };

  const handleEditEntry = (entry: Entry | null) => {
    setEditingEntry(entry);
  };

  const handleSaveEntry = async (updatedEntry: Entry) => {
    setIsSavingEdit(true);
    setNotification(null);

    try {
      const newReflection = await generateReflection(updatedEntry.text);
      const finalUpdatedEntry = { ...updatedEntry, reflection: newReflection };
      setEntries(prev => prev.map(entry => entry.id === finalUpdatedEntry.id ? finalUpdatedEntry : entry));
    } catch (err) {
      handleApiError(err, 'entry');
      setEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
    } finally {
      setIsSavingEdit(false);
      setEditingEntry(null);
    }
  };
  
  const handleShareEntry = async (entry: Entry) => {
      const shareText = `Gratidão do dia:\n"${entry.text}"\n\nReflexão:\n"${entry.reflection}"\n\n- Compartilhado do meu Diário de Gratidão`;
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'Meu Momento de Gratidão',
                  text: shareText,
              });
          } catch (error) {
              console.error('Erro ao compartilhar:', error);
          }
      } else {
          try {
              await navigator.clipboard.writeText(shareText);
              setNotification({ message: 'Copiado para a área de transferência!', type: 'success' });
          } catch (error) {
              console.error('Erro ao copiar para a área de transferência:', error);
              setNotification({ message: 'Falha ao copiar.', type: 'error' });
          }
      }
  };

  return {
    entries,
    filteredEntries,
    editingEntry,
    deletingEntryId,
    isSavingEdit,
    searchTerm,
    filterDate,
    sortOrder,
    hasFilters,
    addEntry,
    setSearchTerm,
    setFilterDate,
    setSortOrder,
    clearFilters,
    handleDeleteEntry,
    handleConfirmDelete,
    handleEditEntry,
    handleSaveEntry,
    handleShareEntry,
  };
};

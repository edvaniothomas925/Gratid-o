import React, { useState } from 'react';
import { Entry } from '../types';
import { Save, X } from 'lucide-react';

interface EditModalProps {
  entry: Entry;
  onSave: (entry: Entry) => void;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ entry, onSave, onClose }) => {
  const [editedText, setEditedText] = useState(entry.text);

  const handleSave = () => {
    if (editedText.trim()) {
      onSave({ ...entry, text: editedText.trim() });
    }
  };
  
  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-slide-up"
        onClick={handleModalContentClick}
      >
        <h3 className="text-xl font-serif font-semibold text-amber-800 dark:text-amber-400 mb-4">Editar Entrada</h3>
        <textarea
          className="w-full p-4 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition duration-200 resize-none bg-stone-50 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200 dark:placeholder-stone-400"
          rows={6}
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-stone-200 text-stone-700 font-bold py-2 px-4 rounded-lg hover:bg-stone-300 transition-colors dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
          >
            <X className="w-5 h-5" /> Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!editedText.trim()}
            className="flex items-center justify-center gap-2 bg-amber-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-900 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed dark:bg-amber-600 dark:hover:bg-amber-700 dark:disabled:bg-stone-600"
          >
            <Save className="w-5 h-5" /> Salvar Alterações
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(15px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-slide-up { animation: slide-up 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
};

export default EditModal;
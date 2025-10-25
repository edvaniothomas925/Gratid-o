import React, { useState } from 'react';
import { SendHorizontal, LoaderCircle } from 'lucide-react';

interface EntryFormProps {
  onAddEntry: (text: string) => Promise<void>;
}

const EntryForm: React.FC<EntryFormProps> = ({ onAddEntry }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await onAddEntry(text);
    setText('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 mb-8">
       <h3 className="text-xl font-serif font-semibold text-amber-800 dark:text-amber-400 mb-4">Pelo que você é grato(a) hoje?</h3>
       <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-4 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition duration-200 resize-none bg-stone-50 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200 dark:placeholder-stone-400"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex: Pelo sol da manhã, por uma conversa com um amigo, por uma xícara de café quente..."
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-amber-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-900 transition-all duration-300 disabled:bg-stone-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none dark:bg-amber-600 dark:hover:bg-amber-700 dark:disabled:bg-stone-600"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin w-5 h-5" />
              Salvando e Gerando Reflexão...
            </>
          ) : (
             <>
              <SendHorizontal className="w-5 h-5" />
              Salvar Entrada
             </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EntryForm;
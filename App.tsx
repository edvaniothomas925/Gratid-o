import React, { useState, useEffect, useCallback } from 'react';
import { Theme, NotificationType, SortOrder } from './types';
import { getDailyQuote } from './services/geminiService';
import { storageService } from './services/storageService';
import { useJournal } from './hooks/useJournal';
import EntryForm from './components/EntryForm';
import EntryList from './components/EntryList';
import FilterControls from './components/FilterControls';
import EditModal from './components/EditModal';
import Notification from './components/Notification';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import { Sun, Moon, LogOut, User as UserIcon, X, Sparkles } from 'lucide-react';

// --- Componente de Modal de Anúncio ---
interface AdModalProps {
  onClose: () => void;
}

const AdModal: React.FC<AdModalProps> = ({ onClose }) => {
  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();
  
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl p-6 w-full max-w-md text-center relative animate-slide-up"
        onClick={handleModalContentClick}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors" aria-label="Fechar anúncio">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Publicidade</h3>
        <div className="my-4 min-h-[250px] flex items-center justify-center bg-stone-100 dark:bg-stone-700 rounded-lg">
           {/* AdSense Ad Unit */}
           {/* IMPORTANTE: Substitua 'XXXXXXXXXX' pelo seu ID de Bloco de Anúncios do AdSense */}
           <ins className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client="ca-pub-9291553361284974"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
        <p className="text-lg font-serif text-amber-900 dark:text-amber-300 mb-2">Uma pausa para inspiração!</p>
        <p className="text-stone-600 dark:text-stone-300 text-sm mb-4">Este aplicativo é mantido por anúncios. Agradecemos o seu apoio!</p>
        <button onClick={onClose} className="w-full bg-amber-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-700 transition-colors">
          Continuar no Diário
        </button>
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


// --- Componente da Tela de Login ---
interface LoginScreenProps {
  onLogin: (username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onLogin(username.trim());
  };

  return (
    <div className="bg-gradient-to-br from-stone-50 to-amber-100 dark:from-gray-900 dark:to-stone-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md dark:bg-stone-800/70 dark:border-stone-700 p-8 rounded-2xl shadow-xl border border-stone-200 text-center">
        <h1 className="text-4xl font-bold font-serif text-amber-900 dark:text-amber-300">Bem-vindo(a) ao Diário de Gratidão</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2 mb-8">Para começar, por favor, diga-nos o seu nome.</p>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Digite seu nome" className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition duration-200 bg-stone-50 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200 dark:placeholder-stone-400" required aria-label="Seu nome" />
          </div>
          <button type="submit" disabled={!username.trim()} className="w-full bg-amber-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-900 transition-all duration-300 disabled:bg-stone-400 disabled:cursor-not-allowed transform hover:scale-105 dark:bg-amber-600 dark:hover:bg-amber-700 dark:disabled:bg-stone-600">
            Acessar Diário
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Componente da Tela do Diário ---
interface JournalScreenProps {
  user: string;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  isApiKeyMissing: boolean;
  handleApiError: (err: unknown, context: 'quote' | 'entry') => void;
  notification: { message: string; type: NotificationType } | null;
  setNotification: React.Dispatch<React.SetStateAction<{ message: string; type: NotificationType } | null>>;
}

const JournalScreen: React.FC<JournalScreenProps> = ({ user, onLogout, theme, toggleTheme, isApiKeyMissing, handleApiError, notification, setNotification }) => {
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<string>('');
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);

  const {
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
  } = useJournal({ user, setNotification, handleApiError });

  useEffect(() => {
    const fetchQuote = async () => {
      setIsQuoteLoading(true);
      try {
        const quote = await getDailyQuote();
        setDailyQuote(quote);
      } catch (err) {
        handleApiError(err, 'quote');
      } finally {
        setIsQuoteLoading(false);
      }
    };
    fetchQuote();
  }, [handleApiError]);

  const handleAddEntry = async (text: string) => {
    const success = await addEntry(text);
    if (success) {
      setIsAdVisible(true);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Bom dia", Icon: Sun };
    if (hour < 18) return { text: "Boa tarde", Icon: Sun };
    return { text: "Boa noite", Icon: Moon };
  };

  const { text: greeting, Icon: GreetingIcon } = getGreeting();

  return (
    <div className="bg-transparent min-h-screen animate-fade-in-slow">
      {isAdVisible && <AdModal onClose={() => setIsAdVisible(false)} />}
      {editingEntry && (
        <EditModal 
          entry={editingEntry} 
          onSave={handleSaveEntry} 
          onClose={() => handleEditEntry(null)} 
          isSaving={isSavingEdit}
        />
      )}
      <ConfirmDeleteModal
          isOpen={deletingEntryId !== null}
          onClose={() => handleDeleteEntry(null)}
          onConfirm={handleConfirmDelete}
      />
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        <header className="relative text-center mb-8 md:mb-12">
          <div className="absolute top-0 right-0 flex items-center gap-5">
            <button onClick={toggleTheme} className="text-stone-500 hover:text-amber-800 dark:hover:text-amber-400 transition-colors" aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}>
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 text-stone-500 hover:text-amber-800 dark:hover:text-amber-400 transition-colors text-sm font-medium" aria-label="Sair">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 text-stone-600 dark:text-stone-400">
            <GreetingIcon className="w-8 h-8"/>
            <h2 className="text-2xl md:text-3xl font-light">{greeting}, {user}!</h2>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-amber-900 dark:text-amber-300 mt-2">Diário de Gratidão</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-4 max-w-2xl mx-auto">"A gratidão desbloqueia a plenitude da vida. Ela transforma o que temos em suficiente, e mais." - Melody Beattie</p>
        </header>

        <div className="mb-8 text-center p-6 bg-amber-50/50 dark:bg-stone-800/50 border border-amber-200 dark:border-stone-700 rounded-xl shadow-sm animate-fade-in">
          <h3 className="text-lg font-serif font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 opacity-80" />
            Reflexão do Dia
          </h3>
          {isQuoteLoading ? (
            <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded-md animate-pulse w-3/4 mx-auto mt-1"></div>
          ) : (
            <blockquote className="text-stone-600 dark:text-stone-300 italic text-lg animate-fade-in-fast mt-1">
              <p>"{dailyQuote}"</p>
            </blockquote>
          )}
        </div>
        
        <main>
          <EntryForm onAddEntry={handleAddEntry} isApiKeyMissing={isApiKeyMissing} />
          <FilterControls 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            clearFilters={clearFilters}
            hasFilters={hasFilters}
          />
          <EntryList 
             entries={filteredEntries} 
             totalEntriesCount={entries.length} 
             onDelete={handleDeleteEntry}
             onEdit={handleEditEntry}
             onShare={handleShareEntry}
          />
        </main>

        <footer className="text-center mt-12 text-stone-500 dark:text-stone-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Diário de Gratidão. Criado com ❤️ e inspiração.</p>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s ease-in-out forwards; }
        @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-in-out forwards; }
      `}</style>
    </div>
  );
};

// --- Componente de Loading ---
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400">
    <svg className="animate-spin h-10 w-10 text-amber-700 dark:text-amber-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-lg font-serif">Carregando seu diário...</p>
  </div>
);

// --- Componente Principal (Controlador de Autenticação) ---
const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(storageService.getTheme);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

  // Efeito para aplicar a classe de tema no <html> e salvar no storage
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    storageService.setTheme(theme);
  }, [theme]);

  // Efeito para carregar o usuário ou mostrar a tela de login
  useEffect(() => {
    const loggedInUser = storageService.getCurrentUser();
    if (loggedInUser) {
      setUser(loggedInUser);
    }
    setIsLoading(false);
  }, []);
  
  const handleApiError = useCallback((err: unknown, context: 'quote' | 'entry') => {
    if (err instanceof Error && err.message === 'API_KEY_MISSING') {
      setIsApiKeyMissing(true);
      const message = "A funcionalidade de IA não está configurada. Adicione a API Key no servidor.";
      if (context === 'quote') {
        // Silenciosamente define a cotação de fallback, o formulário mostrará o erro principal.
      } else {
        setNotification({ message, type: 'error' });
      }
    } else {
      console.error(`Error with Gemini API during ${context}:`, err);
      if (context === 'entry') {
        setNotification({ message: "Falha ao gerar reflexão de IA. Sua entrada foi salva sem ela.", type: 'error' });
      }
    }
  }, []);

  const handleLogin = (username: string) => {
    storageService.setCurrentUser(username);
    setUser(username);
  };

  const handleLogout = () => {
    storageService.clearCurrentUser();
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <JournalScreen user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} isApiKeyMissing={isApiKeyMissing} handleApiError={handleApiError} notification={notification} setNotification={setNotification} />;
};

export default App;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Entry } from './types';
import { generateReflection } from './services/geminiService';
import EntryForm from './components/EntryForm';
import EntryList from './components/EntryList';
import FilterControls from './components/FilterControls';
import EditModal from './components/EditModal';
import { Sun, Moon, LogOut, User as UserIcon, X } from 'lucide-react';

// --- Tipo para o Tema ---
type Theme = 'light' | 'dark';
export type SortOrder = 'newest' | 'oldest';

// --- Service Logic para gerenciar o armazenamento local ---
const LOGGED_IN_USER_KEY = 'gratitude-journal-user';
const ENTRIES_KEY_PREFIX = 'gratitude-entries-';
const THEME_KEY = 'gratitude-journal-theme';

const storageService = {
  getCurrentUser: (): string | null => {
    return localStorage.getItem(LOGGED_IN_USER_KEY);
  },
  setCurrentUser: (username: string): void => {
    localStorage.setItem(LOGGED_IN_USER_KEY, username);
  },
  clearCurrentUser: (): void => {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
  },
  getTheme: (): Theme => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    // Fallback para a preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  setTheme: (theme: Theme): void => {
    localStorage.setItem(THEME_KEY, theme);
  },
  loadEntries: (username: string): Entry[] => {
    try {
      const storedEntries = localStorage.getItem(`${ENTRIES_KEY_PREFIX}${username}`);
      if (storedEntries) {
        return JSON.parse(storedEntries);
      }
    } catch (err) { console.error("Falha ao carregar entradas", err); }
    return [];
  },
  saveEntries: (username: string, entries: Entry[]): void => {
    try {
      localStorage.setItem(`${ENTRIES_KEY_PREFIX}${username}`, JSON.stringify(entries));
    } catch (err) { console.error("Falha ao salvar entradas", err); }
  }
};

// --- Componente de Modal de Anúncio ---
interface AdModalProps {
  onClose: () => void;
}

const AdModal: React.FC<AdModalProps> = ({ onClose }) => {
  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();
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
        <div className="my-4">
          <img src="https://placehold.co/600x400/FFF8E1/EAB308?text=Seu+Anúncio+Inspirador\nAqui!" alt="Anúncio" className="rounded-lg w-full object-cover" />
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
}

const JournalScreen: React.FC<JournalScreenProps> = ({ user, onLogout, theme, toggleTheme }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [notification, setNotification] = useState<string>('');

  useEffect(() => {
    setEntries(storageService.loadEntries(user));
  }, [user]);

  useEffect(() => {
    storageService.saveEntries(user, entries);
  }, [entries, user]);

  const addEntry = useCallback(async (text: string) => {
    setError(null);
    if (!text.trim()) {
      setError("A entrada não pode estar vazia.");
      return;
    }
    
    let newEntry: Entry;
    try {
      const reflection = await generateReflection(text);
      newEntry = { id: Date.now(), date: new Date().toISOString(), text, reflection };
    } catch (err) {
      console.error("Error adding new entry:", err);
      setError("Falha ao gerar reflexão de IA. Sua entrada foi salva sem ela.");
      newEntry = { id: Date.now(), date: new Date().toISOString(), text, reflection: "Não foi possível gerar uma reflexão neste momento." };
    }
    
    setEntries(prevEntries => [newEntry, ...prevEntries]);
    setIsAdVisible(true);
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
  };

  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        const matchesSearch = searchTerm ?
          entry.text.toLowerCase().includes(lowerCaseSearch) ||
          entry.reflection.toLowerCase().includes(lowerCaseSearch) : true;

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


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Bom dia", Icon: Sun };
    if (hour < 18) return { text: "Boa tarde", Icon: Sun };
    return { text: "Boa noite", Icon: Moon };
  };
  
  const handleDeleteEntry = (id: number) => {
    if (window.confirm("Tem certeza de que deseja apagar esta entrada? Esta ação não pode ser desfeita.")) {
        setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleEditEntry = (entry: Entry) => {
      setEditingEntry(entry);
  };

  const handleSaveEntry = (updatedEntry: Entry) => {
      setEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
      setEditingEntry(null);
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
              setNotification('Copiado para a área de transferência!');
              setTimeout(() => setNotification(''), 3000);
          } catch (error) {
              console.error('Erro ao copiar para a área de transferência:', error);
              setNotification('Falha ao copiar.');
              setTimeout(() => setNotification(''), 3000);
          }
      }
  };

  const { text: greeting, Icon: GreetingIcon } = getGreeting();

  return (
    <div className="bg-transparent min-h-screen animate-fade-in-slow">
      {isAdVisible && <AdModal onClose={() => setIsAdVisible(false)} />}
      {editingEntry && (
        <EditModal 
          entry={editingEntry} 
          onSave={handleSaveEntry} 
          onClose={() => setEditingEntry(null)} 
        />
      )}
      {notification && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-stone-800 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-fast">
          {notification}
        </div>
      )}

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
        
        <main>
          {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600 p-4 mb-6 rounded-r-lg" role="alert"><p>{error}</p></div>}
          <EntryForm onAddEntry={addEntry} />
          <FilterControls 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            clearFilters={clearFilters}
            hasFilters={!!searchTerm || !!filterDate}
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

  return <JournalScreen user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
};

export default App;
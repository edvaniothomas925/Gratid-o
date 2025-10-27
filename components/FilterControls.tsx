import React from 'react';
import { Search, CalendarDays, X } from 'lucide-react';
// Fix: The SortOrder type is defined in types.ts, not App.tsx.
import { SortOrder } from '../types';

interface FilterControlsProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterDate: string;
    setFilterDate: (date: string) => void;
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
    clearFilters: () => void;
    hasFilters: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
    searchTerm, setSearchTerm, filterDate, setFilterDate, sortOrder, setSortOrder, clearFilters, hasFilters
}) => {
  return (
    <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 mb-8 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        
        {/* Search Input */}
        <div className="w-full">
            <label htmlFor="search" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Buscar</label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
                <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por palavra-chave..."
                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition duration-200 bg-stone-50 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200 dark:placeholder-stone-400"
                />
            </div>
        </div>

        {/* Date Filter */}
        <div className="w-full">
            <label htmlFor="date-filter" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Filtrar por data</label>
            <div className="relative">
                 <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
                <input
                    id="date-filter"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition duration-200 bg-stone-50 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200"
                />
            </div>
        </div>

        {/* Sort Order and Clear Button */}
        <div className="w-full flex items-end gap-2">
            <div className="flex-grow">
                 <label htmlFor="sort-order" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Ordenar por</label>
                <select
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition duration-200 bg-stone-50 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200"
                >
                    <option value="newest">Mais Recentes</option>
                    <option value="oldest">Mais Antigas</option>
                </select>
            </div>
            <button
                onClick={clearFilters}
                className={`p-2 bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600 rounded-lg transition-all duration-300 ease-in-out transform ${hasFilters ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
                aria-label="Limpar filtros"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

      </div>
    </div>
  );
};

export default FilterControls;
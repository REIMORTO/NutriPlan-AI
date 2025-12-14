import React, { useMemo, useState } from 'react';
import { WeekPlan, Ingredient } from '../types';
import { ShoppingCart, Check, ShoppingBag, Utensils } from 'lucide-react';

interface Props {
  plan: WeekPlan;
}

interface GroupedItem {
  name: string;
  amounts: string[];
  occurrences: string[];
}

const categoryTranslations: Record<string, string> = {
  'produce': 'Hortifruti 🍎',
  'dairy': 'Laticínios 🧀',
  'meat': 'Carnes 🥩',
  'pantry': 'Despensa 🥫',
  'bakery': 'Padaria 🍞',
  'frozen': 'Congelados 🧊',
  'beverages': 'Bebidas 🥤',
  'seafood': 'Peixes e Frutos do Mar 🐟',
  'household': 'Casa 🏠',
  'supplements': 'Suplementos 💊',
  'spices': 'Temperos 🧂',
  'grains': 'Grãos 🍚',
  'pasta': 'Massas 🍝',
  'canned': 'Enlatados 🥫',
  'vegetables': 'Vegetais 🥦',
  'fruits': 'Frutas 🍇',
  'snacks': 'Lanches 🍿',
  'oils': 'Óleos e Gorduras 🫒',
  'condiments': 'Condimentos 🍅'
};

const translateCategory = (category: string) => {
  const normalizedKey = category.toLowerCase().trim();
  return categoryTranslations[normalizedKey] || category.charAt(0).toUpperCase() + category.slice(1);
};

const ShoppingList: React.FC<Props> = ({ plan }) => {
  // State to track checked items by unique item key
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Consolidate ingredients: Group by Category -> Item Name
  const consolidatedList = useMemo(() => {
    const categories: Record<string, Record<string, GroupedItem>> = {};

    plan.days.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients.forEach(ing => {
          const catKey = ing.category.toLowerCase().trim();
          const itemKey = ing.item.toLowerCase().trim();
          const dayShort = day.day.split('-')[0]; // "Segunda" from "Segunda-feira"

          if (!categories[catKey]) {
            categories[catKey] = {};
          }

          if (!categories[catKey][itemKey]) {
            categories[catKey][itemKey] = {
              name: ing.item, // Keep original casing
              amounts: [],
              occurrences: []
            };
          }

          // Add amount
          categories[catKey][itemKey].amounts.push(ing.amount);
          
          // Add context (e.g., "Seg (Almoço)")
          categories[catKey][itemKey].occurrences.push(`${dayShort} (${meal.type})`);
        });
      });
    });
    return categories;
  }, [plan]);

  const toggleItem = (category: string, itemKey: string) => {
    const id = `${category}-${itemKey}`;
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Calculate totals
  let totalUniqueItems = 0;
  Object.values(consolidatedList).forEach(cat => {
    totalUniqueItems += Object.keys(cat).length;
  });

  const totalCheckedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercentage = totalUniqueItems > 0 ? (totalCheckedCount / totalUniqueItems) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center gap-3 no-print">
        <h2 className="text-3xl font-heading font-black text-slate-900 dark:text-white flex items-center gap-3">
          <span className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
             <ShoppingCart size={28} />
          </span>
          Lista de Compras
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 print:shadow-none print:border-none print:p-0 relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>

        <div className="columns-1 md:columns-2 gap-8 space-y-8">
          {Object.entries(consolidatedList).map(([categoryKey, items]) => {
            const itemsArray = Object.entries(items);
            if (itemsArray.length === 0) return null;

            return (
              <div key={categoryKey} className="break-inside-avoid mb-8">
                <h3 className="font-heading font-black text-lg text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-100 dark:border-emerald-900/50 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
                  {translateCategory(categoryKey)}
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full ml-auto">{itemsArray.length}</span>
                </h3>
                <ul className="space-y-3">
                  {itemsArray.map(([itemKey, details]) => {
                    const id = `${categoryKey}-${itemKey}`;
                    const isChecked = !!checkedItems[id];
                    
                    // Summarize amounts nicely
                    // If all amounts are the same string (e.g. "1 un"), group them: "3x 1 un"
                    // Otherwise list them: "100g + 50g"
                    const uniqueAmounts = Array.from(new Set(details.amounts));
                    let amountDisplay = "";
                    if (uniqueAmounts.length === 1 && details.amounts.length > 1) {
                        amountDisplay = `${details.amounts.length}x ${uniqueAmounts[0]}`;
                    } else {
                        amountDisplay = details.amounts.join(' + ');
                    }

                    return (
                      <li 
                        key={id} 
                        onClick={() => toggleItem(categoryKey, itemKey)}
                        className={`group flex items-start gap-3 text-sm p-3 rounded-xl transition-all cursor-pointer select-none border border-transparent ${isChecked ? 'bg-emerald-50/50 dark:bg-emerald-900/10 opacity-60' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-100 dark:hover:border-slate-700'}`}
                      >
                        <div className="min-w-[20px] pt-1 no-print">
                          <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 flex items-center justify-center ${isChecked ? 'bg-emerald-500 border-emerald-500 scale-110' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-emerald-400'}`}>
                              <Check size={14} className={`text-white transition-opacity duration-200 ${isChecked ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                          </div>
                        </div>
                         {/* Print checkbox */}
                        <div className="hidden print:block min-w-[16px] pt-1">
                          <div className="w-4 h-4 border border-slate-800"></div>
                        </div>
                        
                        <div className="flex-1 border-b border-dashed border-slate-100 dark:border-slate-700 pb-2">
                          <div className="flex justify-between items-start">
                              <span className={`font-bold text-base transition-colors ${isChecked ? 'text-emerald-700 dark:text-emerald-500 line-through decoration-emerald-500/50' : 'text-slate-800 dark:text-slate-200'}`}>
                                {details.name}
                              </span>
                              <span className={`font-bold text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md whitespace-nowrap ml-2 ${isChecked ? 'text-emerald-600/70 dark:text-emerald-500/70' : 'text-slate-600 dark:text-slate-300'}`}>
                                {amountDisplay}
                              </span>
                          </div>
                          
                          {/* Context: Where is this used? */}
                          <div className={`mt-1 text-xs flex items-center gap-1 ${isChecked ? 'text-emerald-600/50' : 'text-slate-400 dark:text-slate-500'}`}>
                              <Utensils size={10} />
                              <span className="truncate max-w-[200px] md:max-w-[300px]">
                                  Para: {details.occurrences.join(', ')}
                              </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="font-heading font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest text-xs">
                NutriPlan AI • Lista Baseada no Cardápio Semanal
            </p>
        </div>
      </div>

      {/* Sticky Bottom Summary Bar */}
      <div className="fixed bottom-6 left-0 right-0 px-4 md:px-0 flex justify-center z-30 no-print pointer-events-none">
        <div className="bg-slate-900/90 dark:bg-emerald-950/90 text-white backdrop-blur-lg p-4 rounded-2xl shadow-2xl flex items-center gap-6 max-w-lg w-full border border-slate-700/50 animate-in slide-in-from-bottom-10 pointer-events-auto">
          <div className="p-3 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
            <ShoppingBag size={24} fill="currentColor" className="text-white" />
          </div>
          <div className="flex-1">
             <div className="flex justify-between items-end mb-1">
               <span className="font-heading font-bold text-lg leading-none">Minha Cesta</span>
               <span className="text-emerald-400 font-bold text-sm">{Math.round(progressPercentage)}%</span>
             </div>
             <p className="text-slate-300 text-sm">
               Você garantiu <strong className="text-white text-base">{totalCheckedCount}</strong> de {totalUniqueItems} itens do cardápio.
             </p>
             <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
import React, { useState } from 'react';
import { WeekPlan, Meal } from '../types';
import { ChevronDown, ChevronUp, Clock, Flame, ChefHat } from 'lucide-react';

interface Props {
  plan: WeekPlan;
}

const MealCard: React.FC<{ meal: Meal }> = ({ meal }) => {
  const [expanded, setExpanded] = useState(false);

  // Type-based colors
  const typeColors = {
    'Café da Manhã': 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    'Almoço': 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Lanche': 'text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400',
    'Jantar': 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400',
  };

  const badgeClass = typeColors[meal.type] || 'text-slate-600 bg-slate-100';

  return (
    <div className={`group border rounded-2xl p-5 bg-white dark:bg-slate-800 transition-all duration-300 ${expanded ? 'ring-2 ring-emerald-500 shadow-xl' : 'border-slate-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'}`}>
      <div 
        className="flex justify-between items-start cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <span className={`inline-block px-2 py-1 rounded-md text-xs font-heading font-bold uppercase tracking-wider mb-2 ${badgeClass}`}>
            {meal.type}
          </span>
          <h4 className="font-heading font-bold text-slate-800 dark:text-white text-lg leading-tight mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {meal.name}
          </h4>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1"><Flame size={14} className="text-orange-500" /> {meal.calories} kcal</span>
            <span className="flex items-center gap-1"><Clock size={14} className="text-blue-500" /> {meal.prepTime}</span>
          </div>
        </div>
        <button className="p-2 text-slate-300 group-hover:text-emerald-500 transition-colors no-print">
          {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      {(expanded || window.matchMedia('print').matches) && (
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700 space-y-5 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-xs">
            <div>
              <div className="font-heading font-black text-slate-700 dark:text-slate-200 text-sm">{meal.macros.protein}g</div>
              <div className="text-slate-400 font-bold uppercase">Prot</div>
            </div>
            <div>
              <div className="font-heading font-black text-slate-700 dark:text-slate-200 text-sm">{meal.macros.carbs}g</div>
              <div className="text-slate-400 font-bold uppercase">Carb</div>
            </div>
            <div>
              <div className="font-heading font-black text-slate-700 dark:text-slate-200 text-sm">{meal.macros.fats}g</div>
              <div className="text-slate-400 font-bold uppercase">Gord</div>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-heading font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Ingredientes
            </h5>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5 ml-1">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span> {ing.amount} {ing.item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-heading font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Preparo
            </h5>
            <ol className="text-sm text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside marker:text-emerald-500 marker:font-bold">
              {meal.instructions.map((step, i) => (
                <li key={i} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

const MealPlanView: React.FC<Props> = ({ plan }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center no-print">
        <h2 className="text-3xl font-heading font-black text-slate-900 dark:text-white">Seu Cardápio</h2>
      </div>

      {/* Tabs for Day Selection (Hidden in Print) */}
      <div className="flex overflow-x-auto pb-4 gap-3 no-print scrollbar-hide">
        {plan.days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDayIndex(idx)}
            className={`px-5 py-2.5 rounded-full text-sm font-heading font-bold whitespace-nowrap transition-all duration-200 ${
              selectedDayIndex === idx 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' 
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {day.day}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto print:overflow-visible">
        {/* Single Day View for Web */}
        <div className="space-y-6 no-print">
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 dark:bg-slate-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                 <ChefHat size={150} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-heading font-bold mb-2 text-emerald-400">{plan.days[selectedDayIndex].day}</h3>
                <p className="text-slate-400 text-sm">Resumo Nutricional do Dia</p>
              </div>
              <div className="flex gap-4 text-sm font-bold mt-4 md:mt-0 relative z-10 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <span className="flex flex-col items-center"><span className="text-orange-400 text-xs uppercase">Calorias</span> {plan.days[selectedDayIndex].totalMacros.calories}</span>
                <div className="w-px bg-white/20 h-full mx-1"></div>
                <span className="flex flex-col items-center"><span className="text-emerald-400 text-xs uppercase">Prot</span> {plan.days[selectedDayIndex].totalMacros.protein}g</span>
                <div className="w-px bg-white/20 h-full mx-1"></div>
                <span className="flex flex-col items-center"><span className="text-blue-400 text-xs uppercase">Carb</span> {plan.days[selectedDayIndex].totalMacros.carbs}g</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {plan.days[selectedDayIndex].meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
        </div>

        {/* Full List View for Print (Only visible when printing) */}
        <div className="hidden print:block space-y-8">
            <div className="text-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-900">Plano Nutricional Semanal</h1>
                <p className="text-slate-500">Gerado por NutriPlan AI</p>
            </div>
            
            {plan.days.map((day, idx) => (
                <div key={idx} className="break-inside-avoid page-break-after-always mb-8">
                    <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-2 mb-4">
                         <h3 className="text-2xl font-bold text-emerald-900">{day.day}</h3>
                         <div className="text-sm text-slate-600">
                            Total: {day.totalMacros.calories}kcal (P:{day.totalMacros.protein}g C:{day.totalMacros.carbs}g G:{day.totalMacros.fats}g)
                         </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                         {day.meals.map(meal => (
                             <MealCard key={meal.id + '_print'} meal={meal} />
                         ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MealPlanView;
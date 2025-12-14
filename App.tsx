import React, { useState } from 'react';
import { UserProfile, WeekPlan } from './types';
import MacroCalculator from './components/MacroCalculator';
import Dashboard from './components/Dashboard';
import MealPlanView from './components/MealPlanView';
import ShoppingList from './components/ShoppingList';
import { generateWeeklyPlan } from './services/geminiService';
import { LayoutDashboard, CalendarDays, ShoppingCart, UserCircle, Menu, Moon, Sun, Leaf } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';

enum View {
  SETUP = 'SETUP',
  DASHBOARD = 'DASHBOARD',
  MEAL_PLAN = 'MEAL_PLAN',
  SHOPPING = 'SHOPPING'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.SETUP);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mealPlan, setMealPlan] = useState<WeekPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentView(View.DASHBOARD);
  };

  const handleGeneratePlan = async () => {
    if (!userProfile) return;
    setIsGenerating(true);
    try {
      const plan = await generateWeeklyPlan(userProfile);
      setMealPlan(plan);
      setCurrentView(View.MEAL_PLAN);
    } catch (error) {
      alert("Erro ao gerar cardápio. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const SidebarItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      disabled={view !== View.SETUP && !userProfile}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2 font-bold text-lg ${
        currentView === view
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900 transform scale-105'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
      } ${view !== View.SETUP && !userProfile ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon size={24} strokeWidth={2.5} />
      <span className="font-heading">{label}</span>
    </button>
  );

  // Initial Setup View
  if (currentView === View.SETUP && !userProfile) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-dark-bg flex flex-col items-center justify-center p-4 transition-colors duration-300">
         <div className="absolute top-4 right-4">
            <button onClick={toggleTheme} className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-110 transition-transform text-emerald-600 dark:text-emerald-400">
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
         </div>
        <div className="text-center mb-8 animate-float">
            <div className="inline-block p-4 bg-white dark:bg-slate-800 rounded-full shadow-xl mb-4">
              <Leaf size={48} className="text-emerald-500" />
            </div>
            <h1 className="text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2 drop-shadow-sm">
              NutriPlan AI
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Seu assistente pessoal de nutrição e bem-estar.</p>
        </div>
        <MacroCalculator onProfileUpdate={handleProfileUpdate} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-primary-50 dark:bg-dark-bg overflow-hidden transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 h-full no-print z-20">
        <div className="p-8">
          <h1 className="text-3xl font-heading font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
             <Leaf className="animate-pulse-glow" /> NutriPlan
          </h1>
        </div>
        <nav className="flex-1 px-6 py-4">
          <SidebarItem view={View.DASHBOARD} icon={LayoutDashboard} label="Visão Geral" />
          <SidebarItem view={View.MEAL_PLAN} icon={CalendarDays} label="Cardápios" />
          <SidebarItem view={View.SHOPPING} icon={ShoppingCart} label="Compras" />
          
          <div className="my-6 border-t border-slate-100 dark:border-slate-800"></div>
          
          <button 
             onClick={() => setCurrentView(View.SETUP)}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-lg"
          >
              <UserCircle size={24} />
              <span className="font-heading">Meu Perfil</span>
          </button>
        </nav>
        
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
             <div className="text-xs text-slate-400 font-bold">v2.0 • Pro</div>
             <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-emerald-600 dark:text-emerald-400">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 z-50 px-4 py-3 flex justify-between items-center no-print shadow-sm">
         <h1 className="font-heading font-bold text-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Leaf size={20} /> NutriPlan
         </h1>
         <div className="flex items-center gap-3">
             <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Menu />
             </button>
         </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-40 pt-20 px-6 md:hidden flex flex-col gap-4 no-print animate-in fade-in slide-in-from-top-10 duration-200">
             <SidebarItem view={View.DASHBOARD} icon={LayoutDashboard} label="Visão Geral" />
             <SidebarItem view={View.MEAL_PLAN} icon={CalendarDays} label="Cardápios" />
             <SidebarItem view={View.SHOPPING} icon={ShoppingCart} label="Compras" />
             <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>
             <SidebarItem view={View.SETUP} icon={UserCircle} label="Meu Perfil" />
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-full pt-20 md:pt-0 scroll-smooth">
        <div className="p-4 md:p-8 max-w-7xl mx-auto h-full pb-24 md:pb-8">
          {currentView === View.SETUP && userProfile && (
             <MacroCalculator onProfileUpdate={handleProfileUpdate} existingProfile={userProfile} />
          )}

          {currentView === View.DASHBOARD && userProfile && (
            <Dashboard 
              profile={userProfile} 
              hasPlan={!!mealPlan} 
              onGeneratePlan={handleGeneratePlan}
              isGenerating={isGenerating}
            />
          )}

          {currentView === View.MEAL_PLAN && (
            mealPlan ? <MealPlanView plan={mealPlan} /> : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 animate-in zoom-in-95 duration-300">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-full shadow-lg mb-6">
                        <CalendarDays size={64} className="text-emerald-200 dark:text-emerald-900" />
                    </div>
                    <p className="text-xl font-heading font-bold mb-2">Seu plano está vazio</p>
                    <p className="mb-6">Gere um cardápio no painel inicial.</p>
                    <button onClick={() => setCurrentView(View.DASHBOARD)} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Voltar ao Painel</button>
                </div>
            )
          )}

          {currentView === View.SHOPPING && (
            mealPlan ? <ShoppingList plan={mealPlan} /> : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 animate-in zoom-in-95 duration-300">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-full shadow-lg mb-6">
                         <ShoppingCart size={64} className="text-emerald-200 dark:text-emerald-900" />
                    </div>
                    <p className="text-xl font-heading font-bold">Lista vazia</p>
                    <p>Gere um cardápio para ver os itens.</p>
                </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

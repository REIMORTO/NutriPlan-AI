import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Utensils, TrendingUp, Calendar, AlertCircle, Zap } from 'lucide-react';

interface Props {
  profile: UserProfile;
  hasPlan: boolean;
  onGeneratePlan: () => void;
  isGenerating: boolean;
}

const Dashboard: React.FC<Props> = ({ profile, hasPlan, onGeneratePlan, isGenerating }) => {
  // Ref for the chart container
  const chartRef = useRef<HTMLDivElement>(null);
  // State to gate rendering of ResponsiveContainer until dimensions are real
  const [canRenderChart, setCanRenderChart] = useState(false);

  useEffect(() => {
    // Robustly check for container dimensions using ResizeObserver.
    // This completely prevents the "width(-1)" error by ensuring Recharts only mounts 
    // when the parent has valid physical dimensions > 0.
    if (!chartRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setCanRenderChart(true);
        // Once we have valid dimensions, we can disconnect. 
        // ResponsiveContainer handles subsequent resizing itself.
        observer.disconnect();
      }
    });

    observer.observe(chartRef.current);

    return () => observer.disconnect();
  }, []);

  const macroData = profile.calculatedMacros ? [
    { name: 'Proteína', val: profile.calculatedMacros.protein, unit: 'g', color: '#10b981' }, 
    { name: 'Carboidratos', val: profile.calculatedMacros.carbs, unit: 'g', color: '#3b82f6' }, 
    { name: 'Gorduras', val: profile.calculatedMacros.fats, unit: 'g', color: '#f59e0b' }, 
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 relative">
        <h1 className="text-4xl md:text-5xl font-heading font-black mb-2 text-slate-900 dark:text-white">
          <span className="text-rainbow">Olá, Atleta!</span> 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Seu corpo é seu templo. Aqui está seu progresso.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <Zap size={24} fill="currentColor" />
            </div>
            <h3 className="font-heading font-bold text-slate-700 dark:text-slate-200 text-lg">Meta Diária</h3>
          </div>
          <div className="text-4xl font-heading font-black text-slate-900 dark:text-white">
            {profile.calculatedMacros?.calories || 0}
            <span className="text-lg font-bold text-slate-400 ml-1">kcal</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium bg-slate-100 dark:bg-slate-700/50 inline-block px-2 py-1 rounded-md capitalize">
             🎯 {profile.goal.replace('_', ' ')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 md:col-span-2 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                       <TrendingUp size={24} />
                    </div>
                    <h3 className="font-heading font-bold text-slate-700 dark:text-slate-200 text-lg">Distribuição de Macros</h3>
                </div>
            </div>
            
            {/* Chart Wrapper - Strictly controlled by ResizeObserver */}
            <div ref={chartRef} className="w-full h-[200px] relative">
                {canRenderChart && macroData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart layout="vertical" data={macroData} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100} 
                            tick={{fontSize: 14, fontFamily: 'Fredoka', fill: '#94a3b8', fontWeight: 600}} 
                            axisLine={false} 
                            tickLine={false} 
                          />
                          <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Comic Neue' }}
                          />
                          <Bar dataKey="val" radius={[0, 8, 8, 0]} barSize={24} animationDuration={1000}>
                            {macroData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600 text-sm font-bold">
                      {macroData.length === 0 ? "Sem dados" : "Carregando..."}
                   </div>
                )}
            </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-200 dark:shadow-none">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:rotate-12">
            <Calendar size={250} />
        </div>
        
        <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-heading font-black mb-4 group-hover:translate-x-1 transition-transform">
                {hasPlan ? "Seu cardápio está pronto! 🥗" : "Pronto para planejar sua semana? 🚀"}
            </h2>
            <p className="text-emerald-50 dark:text-emerald-200 mb-8 text-lg font-medium leading-relaxed">
                {hasPlan 
                    ? "Tudo organizado. Confira suas receitas deliciosas e a lista de compras completa."
                    : "A IA vai calcular suas necessidades e montar um plano perfeito para você em segundos."
                }
            </p>
            {!hasPlan && (
                <button 
                    onClick={onGeneratePlan}
                    disabled={isGenerating}
                    className="bg-white text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-8 py-4 rounded-xl font-heading font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
                >
                    {isGenerating ? (
                        <>
                          <div className="w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="animate-pulse">Criando Mágica...</span>
                        </>
                    ) : (
                        <>
                          <Utensils size={24} className="animate-bounce-slow" />
                          Gerar Cardápio Mágico
                        </>
                    )}
                </button>
            )}
        </div>
      </div>

      {!process.env.API_KEY && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-6 rounded-2xl flex items-start gap-4 animate-shake">
              <AlertCircle className="shrink-0 mt-1" size={24} />
              <div>
                  <h4 className="font-heading font-bold text-lg">Chave API Ausente</h4>
                  <p className="font-medium">O app precisa de uma chave API do Gemini configurada no ambiente para funcionar.</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { calculateUserMacros } from '../services/geminiService';
import { Loader2, Calculator, ArrowRight } from 'lucide-react';

interface Props {
  onProfileUpdate: (profile: UserProfile) => void;
  existingProfile?: UserProfile;
}

const InputLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
    {children}
  </label>
);

const MacroCalculator: React.FC<Props> = ({ onProfileUpdate, existingProfile }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(existingProfile || {
    age: 30,
    weight: 70,
    height: 170,
    gender: 'female',
    goal: 'lose_weight',
    activityLevel: 'moderate',
    dietaryRestrictions: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'weight' || name === 'height' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await calculateUserMacros(formData);
      onProfileUpdate({
        ...formData,
        calculatedMacros: result.macros
      });
    } catch (err) {
      alert("Erro ao calcular macros. Verifique sua chave API.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium";

  return (
    <div className="max-w-2xl mx-auto glass-panel bg-white/80 dark:bg-slate-800/80 p-8 rounded-3xl shadow-xl animate-in zoom-in-95 duration-500">
      <div className="flex items-center gap-3 mb-8 text-emerald-600 dark:text-emerald-400">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
           <Calculator size={28} />
        </div>
        <h2 className="text-2xl font-heading font-black">Configurar Perfil</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InputLabel>Idade</InputLabel>
            <input required type="number" name="age" value={formData.age} onChange={handleChange} className={inputClasses} />
          </div>
          <div>
            <InputLabel>Gênero</InputLabel>
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
            </select>
          </div>
          <div>
            <InputLabel>Peso (kg)</InputLabel>
            <input required type="number" name="weight" value={formData.weight} onChange={handleChange} className={inputClasses} />
          </div>
          <div>
            <InputLabel>Altura (cm)</InputLabel>
            <input required type="number" name="height" value={formData.height} onChange={handleChange} className={inputClasses} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InputLabel>Nível de Atividade</InputLabel>
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className={inputClasses}>
              <option value="sedentary">Sedentário (Pouco/Nenhum)</option>
              <option value="light">Leve (1-3 dias)</option>
              <option value="moderate">Moderado (3-5 dias)</option>
              <option value="active">Ativo (6-7 dias)</option>
              <option value="very_active">Muito Ativo (Intenso)</option>
            </select>
          </div>
          <div>
            <InputLabel>Objetivo</InputLabel>
            <select name="goal" value={formData.goal} onChange={handleChange} className={inputClasses}>
              <option value="lose_weight">🔥 Perder Peso</option>
              <option value="maintain">⚖️ Manter Peso</option>
              <option value="gain_muscle">💪 Ganhar Massa</option>
            </select>
          </div>
        </div>

        <div>
           <InputLabel>Restrições (Opcional)</InputLabel>
           <textarea name="dietaryRestrictions" value={formData.dietaryRestrictions} onChange={handleChange} placeholder="Ex: Sem glúten, Vegetariano, Alergia a amendoim..." className={`${inputClasses} h-24 resize-none`} />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-heading font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="animate-spin" /> : <> Calcular e Iniciar <ArrowRight size={20} /> </>}
        </button>
      </form>
    </div>
  );
};

export default MacroCalculator;
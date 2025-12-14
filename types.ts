export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface Ingredient {
  item: string;
  amount: string;
  category: string;
}

export interface Meal {
  id: string;
  name: string;
  type: 'Café da Manhã' | 'Almoço' | 'Jantar' | 'Lanche';
  calories: number;
  macros: Macros;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string;
}

export interface DayPlan {
  day: string; // "Segunda-feira", etc.
  meals: Meal[];
  totalMacros: Macros;
}

export interface WeekPlan {
  id: string;
  title: string;
  days: DayPlan[];
}

export interface UserProfile {
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female';
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryRestrictions: string;
  calculatedMacros?: Macros;
}

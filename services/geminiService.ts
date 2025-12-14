import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, WeekPlan, Macros } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

// Schema for Macros
const macrosSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    protein: { type: Type.NUMBER },
    carbs: { type: Type.NUMBER },
    fats: { type: Type.NUMBER },
    calories: { type: Type.NUMBER },
  },
  required: ["protein", "carbs", "fats", "calories"],
};

// Schema for User Macro Calculation Response
const userMacrosResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    macros: macrosSchema,
    advice: { type: Type.STRING },
  },
  required: ["macros", "advice"],
};

// Schema for Meal Plan Generation
const mealPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: "Day of week in Portuguese" },
          totalMacros: macrosSchema,
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["Café da Manhã", "Almoço", "Jantar", "Lanche"] },
                calories: { type: Type.NUMBER },
                macros: macrosSchema,
                prepTime: { type: Type.STRING },
                instructions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      item: { type: Type.STRING },
                      amount: { type: Type.STRING },
                      category: { type: Type.STRING, description: "Produce, Dairy, Meat, Pantry, etc." }
                    },
                    required: ["item", "amount", "category"]
                  }
                }
              },
              required: ["name", "type", "calories", "macros", "ingredients", "instructions", "prepTime"]
            }
          }
        },
        required: ["day", "meals", "totalMacros"]
      }
    }
  },
  required: ["title", "days"]
};

export const calculateUserMacros = async (profile: UserProfile): Promise<{ macros: Macros; advice: string }> => {
  const prompt = `
    Calcule as macros diárias ideais (proteína, carboidratos, gorduras, calorias totais) para esta pessoa:
    Idade: ${profile.age}
    Peso: ${profile.weight}kg
    Altura: ${profile.height}cm
    Gênero: ${profile.gender}
    Nível de Atividade: ${profile.activityLevel}
    Objetivo: ${profile.goal}
    Restrições: ${profile.dietaryRestrictions || "Nenhuma"}
    
    Forneça também um conselho curto (advice) motivacional e nutricional em português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: userMacrosResponseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error calculating macros:", error);
    throw error;
  }
};

export const generateWeeklyPlan = async (profile: UserProfile): Promise<WeekPlan> => {
  const prompt = `
    Crie um cardápio semanal completo (7 dias, começando segunda-feira) em Português para uma pessoa com o seguinte perfil:
    Calorias Alvo: ${profile.calculatedMacros?.calories || 2000}
    Objetivo: ${profile.goal}
    Restrições Alimentares: ${profile.dietaryRestrictions || "Nenhuma"}
    
    Cada dia deve ter Café da Manhã, Almoço, Lanche e Jantar.
    As receitas devem ser saudáveis, práticas e "fitness".
    
    A resposta deve seguir estritamente o schema JSON fornecido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: mealPlanSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    const data = JSON.parse(text);
    return { ...data, id: Date.now().toString() };
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw error;
  }
};

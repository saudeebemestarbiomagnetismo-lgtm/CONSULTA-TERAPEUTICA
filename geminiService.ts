
import { GoogleGenAI, Type } from "@google/genai";
import { SessionAnalysis } from "./types";

const SYSTEM_INSTRUCTION = `
Você é um Assistente de Análise de Sessões de Biomagnetismo e Bioenergética. Você deve atuar em dois protocolos distintos dependendo do campo 'tipo_sessao'.

PROTOCOLO 1: Biomagnetismo e Bioenergética
Foque no equilíbrio de pH, patógenos (vírus, bactérias, fungos, parasitas) e disfunções orgânicas. Use a base Goiz de reservatórios se aplicável.
Análise: Identificar correlações entre os pares e a queixa física.

PROTOCOLO 2: Desbloqueio Emocional
Foque na psicossomática, emoções aprisionadas (Raiva, Medo, Tristeza, Abandono, etc.) e bloqueios energéticos decorrentes de traumas. 
Análise: Correlacionar a queixa com o impacto emocional nos órgãos e sistemas. Sugerir a liberação de conflitos ativos.

REGRAS GERAIS:
1. IDENTIFICAÇÃO: Para cada par/ponto, explique o que ele representa no contexto do protocolo escolhido.
2. ÉTICA: NUNCA dê diagnósticos médicos. No 'resumo_paciente_friendly', use linguagem acolhedora e evite nomes de doenças/patógenos. Fale em 'ajuste vibracional', 'liberação de cargas acumuladas' e 'restauração do fluxo vital'.
3. FORMATO: Retorne JSON estrito.
`;

export async function analyzeSession(complaint: string, pairs: string, sessionType: 'biomagnetismo' | 'emocional'): Promise<SessionAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tipo de Sessão: ${sessionType}\nQueixa Principal: ${complaint}\nLista de Pares/Pontos: ${pairs}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tipo_sessao: { type: Type.STRING, enum: ['biomagnetismo', 'emocional'] },
          queixa_principal_paciente: { type: Type.STRING },
          analise_profissional: { type: Type.STRING },
          pares_encontrados_analise: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                par: { type: Type.STRING },
                localizacao_pH_negativo: { type: Type.STRING, description: 'Localização ou Emoção Relacionada' },
                patogeno_disfuncao_sugerida: { type: Type.STRING, description: 'Patógeno ou Significado Psicossomático' }
              },
              required: ["par", "localizacao_pH_negativo", "patogeno_disfuncao_sugerida"]
            }
          },
          resumo_paciente_friendly: { type: Type.STRING },
          sugestoes_adicionais_terapeuta: { type: Type.STRING }
        },
        required: [
          "tipo_sessao",
          "queixa_principal_paciente", 
          "analise_profissional", 
          "pares_encontrados_analise", 
          "resumo_paciente_friendly", 
          "sugestoes_adicionais_terapeuta"
        ]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

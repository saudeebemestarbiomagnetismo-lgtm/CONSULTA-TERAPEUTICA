
export interface User {
  id: string;
  email: string;
}

export interface BiomagneticPair {
  par: string;
  localizacao_pH_negativo: string;
  patogeno_disfuncao_sugerida: string;
}

export interface GoizPair {
  id: string;
  name: string;
  description: string;
  user_id?: string;
}

export interface SessionAnalysis {
  tipo_sessao: 'biomagnetismo' | 'emocional';
  queixa_principal_paciente: string;
  analise_profissional: string;
  pares_encontrados_analise: BiomagneticPair[];
  resumo_paciente_friendly: string;
  sugestoes_adicionais_terapeuta: string;
}

export interface SavedSession extends SessionAnalysis {
  id: string;
  patient_id: string;
  patientName: string; // Virtual join for UI
  created_at: string;
}

export interface Patient {
  id: string;
  nome: string;
  whatsapp: string;
  data_nascimento: string;
  observacoes: string;
  created_at: string;
}

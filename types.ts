
export interface BiomagneticPair {
  par: string;
  localizacao_pH_negativo: string;
  patogeno_disfuncao_sugerida: string;
}

export interface GoizPair {
  id: string;
  name: string;
  description: string;
}

export interface SessionAnalysis {
  queixa_principal_paciente: string;
  analise_profissional: string;
  pares_encontrados_analise: BiomagneticPair[];
  resumo_paciente_friendly: string;
  sugestoes_adicionais_terapeuta: string;
}

export interface SavedSession extends SessionAnalysis {
  id: string;
  patientId: string;
  patientName: string;
  date: number;
}

export interface Patient {
  id: string;
  nome: string;
  whatsapp: string;
  dataNascimento: string;
  observacoes: string;
  createdAt: number;
}

export interface UserInput {
  complaint: string;
  pairsList: string;
}

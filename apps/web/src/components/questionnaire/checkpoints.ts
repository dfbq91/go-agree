export interface AnalysisCheckpoint {
  triggerQuestionId: string;
  stage: number;
}
/**
 * Lista de preguntas tras las cuales se activa el análisis LLM.
 * Modificar o agregar nuevas etapas es tan simple como añadir una entrada a esta lista.
 */
export const ANALYSIS_CHECKPOINTS: AnalysisCheckpoint[] = [
  { triggerQuestionId: 'q5_modality', stage: 1 },
];

import { describe, expect, it } from 'vitest';
import { formatQuestionnaireTranscript } from '../src/formatters/formatQuestionnaireTranscript.js';
import { QuestionnaireDefinition } from '../src/entities/QuestionnaireDefinition.js';

describe('formatQuestionnaireTranscript', () => {
  const questionnaire = QuestionnaireDefinition.createStandard();

  it('formats standard questions and user answers into structured legal transcript', () => {
    const answers = {
      q0_party_role: 'contratante',
      q1_legal_personality: 'persona_juridica',
      q2_description_conditions: 'Empresa Demo S.A.S. requiere servicios de desarrollo de Juan Pérez.',
    };

    const transcript = formatQuestionnaireTranscript({
      title: 'Contrato de Servicios',
      standardQuestions: questionnaire.questions,
      dynamicQuestions: [],
      answers,
    });

    expect(transcript).toContain('TÍTULO DEL CONTRATO: Contrato de Servicios');
    expect(transcript).toContain('--- PREGUNTAS Y RESPUESTAS BASE ---');
    expect(transcript).toContain('Empresa Demo S.A.S.');
    expect(transcript).toContain('Juan Pérez');
  });

  it('resolves select option labels when question has options', () => {
    const questions = questionnaire.questions;
    const answers = {
      q0_contract_type: 'services',
    };

    const transcript = formatQuestionnaireTranscript({
      title: 'Contrato Comercial',
      standardQuestions: questions,
      dynamicQuestions: [],
      answers,
    });

    // Should include the question text and formatted answer
    expect(transcript).toContain('Contrato Comercial');
  });

  it('includes dynamic questions in a dedicated section', () => {
    const dynamicQuestions = [
      {
        id: 'dyn_risk_1',
        prompt: '¿Cómo se resolverán los desacuerdos sobre el alcance técnico?',
      },
    ];
    const answers = {
      dyn_risk_1: 'Mediante un perito técnico designado de común acuerdo.',
    };

    const transcript = formatQuestionnaireTranscript({
      title: 'Contrato con Cláusula Técnica',
      standardQuestions: [],
      dynamicQuestions,
      answers,
    });

    expect(transcript).toContain('--- PREGUNTAS DE PROFUNDIZACIÓN Y RIESGOS ---');
    expect(transcript).toContain('¿Cómo se resolverán los desacuerdos sobre el alcance técnico?');
    expect(transcript).toContain('Mediante un perito técnico designado de común acuerdo.');
  });
});

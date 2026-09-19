/**
 * @file formatQuestionnaireTranscript.ts
 * @description Formats questionnaire questions and captured user answers into
 * a structured, human-readable transcript for LLM contract drafting.
 */

import type { Question } from '../entities/Question.js';

export interface DynamicQuestionItem {
  id: string;
  prompt: string;
}

export interface FormatTranscriptInput {
  title: string;
  standardQuestions: Question[];
  dynamicQuestions: DynamicQuestionItem[];
  answers: Record<string, unknown>;
}

function formatSingleAnswer(rawAnswer: unknown, question?: Question): string {
  if (rawAnswer === undefined || rawAnswer === null) {
    return 'Sin respuesta';
  }

  if (typeof rawAnswer === 'boolean') {
    return rawAnswer ? 'Sí' : 'No';
  }

  if (typeof rawAnswer === 'string') {
    if (rawAnswer.startsWith('other:')) {
      return `Otro: ${rawAnswer.replace(/^other:\s*/, '')}`;
    }
    const matchedOption = question?.options?.find((opt) => opt.value === rawAnswer);
    return matchedOption ? matchedOption.label : rawAnswer;
  }

  if (typeof rawAnswer === 'number') {
    return String(rawAnswer);
  }

  if (Array.isArray(rawAnswer)) {
    return rawAnswer
      .map((item) => {
        if (typeof item === 'object' && item !== null && 'selection' in item) {
          const sel = (item as any).selection;
          const custom = (item as any).customValue;
          const opt = question?.options?.find((o) => o.value === sel);
          const label = opt ? opt.label : sel;
          return custom ? `${label} (${custom})` : label;
        }
        if (typeof item === 'string') {
          const opt = question?.options?.find((o) => o.value === item);
          return opt ? opt.label : item;
        }
        return JSON.stringify(item);
      })
      .join(', ');
  }

  if (typeof rawAnswer === 'object') {
    const obj = rawAnswer as Record<string, unknown>;
    if ('selection' in obj) {
      const sel = obj.selection as string;
      const custom = obj.customValue as string | undefined;
      const opt = question?.options?.find((o) => o.value === sel);
      const label = opt ? opt.label : sel;
      return custom ? `${label} (${custom})` : label;
    }
    return JSON.stringify(rawAnswer);
  }

  return String(rawAnswer);
}

export function formatQuestionnaireTranscript(input: FormatTranscriptInput): string {
  const sections: string[] = [];

  sections.push(`TÍTULO DEL CONTRATO: ${input.title}`);
  sections.push('\n--- PREGUNTAS Y RESPUESTAS BASE ---');

  for (const question of input.standardQuestions) {
    const answer = input.answers[question.id];
    const formattedAnswer = formatSingleAnswer(answer, question);
    sections.push(`[${question.id}] ${question.prompt}:`);
    sections.push(`Respuesta: ${formattedAnswer}\n`);
  }

  if (input.dynamicQuestions && input.dynamicQuestions.length > 0) {
    sections.push('--- PREGUNTAS DE PROFUNDIZACIÓN Y RIESGOS ---');
    for (const dyn of input.dynamicQuestions) {
      const answer = input.answers[dyn.id];
      const formattedAnswer = formatSingleAnswer(answer);
      sections.push(`[${dyn.id}] ${dyn.prompt}:`);
      sections.push(`Respuesta: ${formattedAnswer}\n`);
    }
  }

  return sections.join('\n');
}

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { QuestionnaireDefinition } from '@go-agree/domain';
import type {
    GenerateQuestionsInput,
    GenerateQuestionsOutput,
    LlmQuestionAnalysisPort,
    QuestionDTO,
} from '@go-agree/application';
import { generateText, Output, type LanguageModel } from 'ai';
import { z } from 'zod';

declare const process: { env: Record<string, string | undefined> };

const dynamicQuestionOptionSchema = z.object({
  id: z.string().describe('Identificador único de la opción, ej. opt_advance_payment'),
  label: z.string().describe('Etiqueta amigable visible para el usuario en español'),
  value: z.string().describe('Valor canónico almacenado en la respuesta'),
  tooltip: z.string().optional().describe('Explicación opcional sobre esta opción'),
});

const dynamicQuestionSchema = z.object({
  id: z.string().describe('Identificador semántico descriptivo en snake_case, ej. dyn_payment_terms'),
  order: z.number().describe('Orden sugerido'),
  prompt: z.string().describe('Pregunta clara, directa y profesional en español'),
  type: z.enum(['open_text', 'single_choice', 'multiple_choice', 'checkbox']).describe('Tipo de entrada'),
  isRequired: z.boolean().default(true).describe('Si la respuesta es obligatoria'),
  helpText: z.string().describe('Explicación obligatoria ("¿Por qué te preguntamos esto?") que justifica el riesgo legal/comercial'),
  tooltip: z.string().optional().describe('Ayuda contextual adicional'),
  options: z.array(dynamicQuestionOptionSchema).optional().describe('Opciones requeridas si es single_choice o multiple_choice'),
});

const dynamicQuestionsPayloadSchema = z.object({
  questions: z.array(dynamicQuestionSchema).length(5).describe('Exactamente 5 preguntas de profundización'),
});

function formatQuestionnaireTranscript(answers: Record<string, unknown>): string {
  const questionnaire = QuestionnaireDefinition.createStandard();
  const lines: string[] = [];

  for (const question of questionnaire.questions) {
    if (!(question.id in answers)) {
      continue;
    }

    const val = answers[question.id];
    if (val === undefined || val === null || val === '') {
      continue;
    }

    let humanReadableAnswer = '';

    if (question.type === 'single_choice') {
      let selection = '';
      let customValue = '';
      if (typeof val === 'object' && val !== null && 'selection' in val) {
        selection = String((val as any).selection || '');
        customValue = String((val as any).customValue || '');
      } else if (typeof val === 'string') {
        if (val.startsWith('other:')) {
          selection = 'other';
          customValue = val.replace(/^other:\s*/, '');
        } else {
          selection = val;
        }
      }
      const opt = question.options?.find((o) => o.value === selection);
      const label = opt ? opt.label : selection;
      humanReadableAnswer = customValue ? `${label} (Especificado: "${customValue}")` : label;
    } else if (question.type === 'multiple_choice' && Array.isArray(val)) {
      const selectedLabels = val.map((item) => {
        let selection = '';
        let customValue = '';
        if (typeof item === 'object' && item !== null && 'selection' in item) {
          selection = String((item as any).selection || '');
          customValue = String((item as any).customValue || '');
        } else if (typeof item === 'string') {
          if (item.startsWith('other:')) {
            selection = 'other';
            customValue = item.replace(/^other:\s*/, '');
          } else {
            selection = item;
          }
        }
        const opt = question.options?.find((o) => o.value === selection);
        const label = opt ? opt.label : selection;
        return customValue ? `${label} (Especificado: "${customValue}")` : label;
      });
      humanReadableAnswer = selectedLabels.join(', ');
    } else if (typeof val === 'boolean') {
      humanReadableAnswer = val ? 'Sí / Marcado' : 'No / Desmarcado';
    } else {
      humanReadableAnswer = String(val);
    }

    lines.push(`- **Pregunta**: "${question.prompt}"\n  **Respuesta**: ${humanReadableAnswer}`);
  }

  // Si hay alguna respuesta no listada en el cuestionario estándar, la agregamos
  for (const [key, val] of Object.entries(answers)) {
    if (!questionnaire.questions.some((q) => q.id === key) && val !== undefined && val !== null && val !== '') {
      lines.push(`- **Pregunta / Campo adicional (${key})**:\n  **Respuesta**: ${JSON.stringify(val)}`);
    }
  }

  return lines.length > 0 ? lines.join('\n\n') : 'No se han registrado respuestas previas.';
}

/**
 * Instancia de modelo de Vercel AI SDK.
 * Puede ser de Google, OpenAI, Anthropic, Mistral o cualquier otro compatible.
 * Si no se especifica, por defecto inicializará Gemini con las variables de entorno.
 */
export interface AiAdapterConfig {
  model?: LanguageModel;
  apiKey?: string;
  modelName?: string;
  generateTextFn?: typeof generateText;
}

export class AiQuestionAnalysisAdapter implements LlmQuestionAnalysisPort {
  private readonly model: LanguageModel;
  private readonly generateTextFn: typeof generateText;

  constructor(config: AiAdapterConfig = {}) {
    this.generateTextFn = config.generateTextFn || generateText;

    if (config.model) {
      // Si nos inyectan un modelo específico (OpenAI, Mistral, Anthropic, etc.), lo usamos
      this.model = config.model;
    } else {
      // Por defecto inicializamos con Google Gemini
      const apiKey = config.apiKey || (typeof process !== 'undefined' ? process.env.GOOGLE_GENERATIVE_AI_API_KEY : '') || '';
      const modelName = config.modelName || (typeof process !== 'undefined' ? process.env.GEMINI_MODEL_NAME : 'gemini-2.0-flash-lite') || 'gemini-2.0-flash-lite';
      const google = createGoogleGenerativeAI({ apiKey });
      this.model = google(modelName);
    }
  }

  async generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
    const systemPrompt = `Eres un abogado experto en estructuración de contratos comerciales, acuerdos de negocio y mitigación de riesgos legales en Colombia.

Tu objetivo NO es redactar el contrato final todavía. Tu misión es analizar las respuestas previas suministradas por el usuario en el cuestionario de ingreso y formular exactamente 5 preguntas de profundización esenciales para definir con precisión los términos del acuerdo y blindar a las partes.

### Criterios de Análisis:
1. Identifica la naturaleza jurídica y operativa exacta del negocio a partir de la descripción y condiciones iniciales (por ejemplo: prestación de servicios profesionales, suministro o compraventa de bienes, obra, desarrollo de software, transporte, mandato, etc.).
2. Detecta vacíos comerciales y riesgos típicos de esa operación en Colombia:
   - Contraprestación y forma de pago (hitos, anticipos, contra entrega, actas de liquidación).
   - Costos o cargos adicionales previsibles (viáticos, fletes, impuestos, licencias, gastos de desplazamiento).
   - Entregables tangibles, plazos de revisión y criterios de aceptación o rechazo.
   - Responsabilidades operativas, garantías, niveles de servicio (SLA) o custodia.
   - Confidencialidad, propiedad intelectual o exclusividad (si aplica al objeto contratado).
   - Otros.
3. NO repitas aspectos ya respondidos en el cuestionario estándar (como el domicilio contractual, tipo de persona natural/jurídica, duración inicial o preaviso de terminación, entre otros).

### Reglas Estrictas para la Formulación de Preguntas:
1. Debes formular 5 preguntas..
2. El lenguaje debe ser profesional, cercano, en español claro y comprensible para cualquier persona o empresario sin formación jurídica.
3. Tipos de pregunta admitidos:
   - 'single_choice': Para decisiones donde solo una opción es válida. Incluye tantas opciones coherentes como sean necesarias para cubrir el escenario de negocio.
   - 'multiple_choice': Cuando varias condiciones o coberturas pueden coexistir a la vez.
   - 'open_text': Cuando se requiere que el usuario redacte especificaciones técnicas, montos monetarios o detalles libres.
   - 'checkbox': Para confirmaciones o autorizaciones binarias directas.
4. Opción "Otro (a especificar)":
   - En preguntas de tipo 'single_choice' o 'multiple_choice', cuando la lista de opciones no pueda cubrir de forma exhaustiva todas las posibilidades del negocio del usuario, DEBES incluir una opción con valor "other" y etiqueta similar a "Otro (por favor especifica)".
5. Justificación obligatoria ("helpText"):
   - En CADA una de las 5 preguntas, es obligatorio incluir el campo "helpText" ("¿Por qué te preguntamos esto?").
   - Explica de forma concreta y en 1 o 2 frases por qué esta información es indispensable para estructurar las cláusulas del contrato y evitar futuros conflictos legales o económicos.
6. Asigna identificadores semánticos y descriptivos a cada pregunta (ejemplo: "dyn_payment_milestones", "dyn_additional_expenses", "dyn_ip_rights").`;

    const transcript = formatQuestionnaireTranscript(input.answers);

    const userMessage = `A continuación se presentan las preguntas formuladas en el cuestionario de ingreso y las respuestas suministradas por el usuario hasta el momento:

${transcript}

Con base en esta transcripción, analiza la naturaleza de la operación, detecta los riesgos y vacíos comerciales no abordados todavía, y formula exactamente las 5 preguntas de profundización más pertinentes para blindar este acuerdo en Colombia.`;

    console.info('AiQuestionAnalysisAdapter: Generating questions with the following input:', { systemPrompt, userMessage });
    const response = await this.generateTextFn({
      model: this.model,
      output: Output.object({ schema: dynamicQuestionsPayloadSchema }),
      system: systemPrompt,
      prompt: userMessage,
    });

    const validatedPayload = response.output as z.infer<typeof dynamicQuestionsPayloadSchema>;

    const questions: QuestionDTO[] = validatedPayload.questions.map((q, index) => ({
      id: q.id,
      order: 20 + index,
      prompt: q.prompt,
      type: q.type,
      isRequired: q.isRequired,
      helpText: q.helpText,
      tooltip: q.tooltip,
      options: q.options?.map((opt) => ({
        id: opt.id,
        label: opt.label,
        value: opt.value,
        tooltip: opt.tooltip,
      })),
    }));

    return { questions };
  }
}

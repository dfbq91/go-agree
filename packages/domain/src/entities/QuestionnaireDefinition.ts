import { ConditionRule } from '../value-objects/ConditionRule.js';
import { QuestionOption } from '../value-objects/QuestionOption.js';
import { Question } from './Question.js';

export interface QuestionnaireDefinitionProps {
  id: string;
  version: string;
  questions: Question[];
}

export class QuestionnaireDefinition {
  readonly id: string;
  readonly version: string;
  readonly questions: Question[];

  constructor(props: QuestionnaireDefinitionProps) {
    this.id = props.id;
    this.version = props.version;
    this.questions = [...props.questions].sort((a, b) => a.order - b.order);
  }

  getVisibleQuestions(answers: Record<string, unknown>): Question[] {
    if (answers.q0_party_role && answers.q0_party_role !== 'client') {
      return this.questions.filter((q) => q.id === 'q0_party_role');
    }
    return this.questions.filter((q) => q.isVisible(answers));
  }

  getNextQuestion(
    currentIdOrIndex: string | number,
    answers: Record<string, unknown>
  ): Question | null {
    const visible = this.getVisibleQuestions(answers);
    let currentIndex = -1;

    if (typeof currentIdOrIndex === 'number') {
      currentIndex = currentIdOrIndex;
    } else {
      currentIndex = visible.findIndex((q) => q.id === currentIdOrIndex);
    }

    if (currentIndex >= 0 && currentIndex < visible.length - 1) {
      return visible[currentIndex + 1];
    }
    return null;
  }

  getPreviousQuestion(
    currentIdOrIndex: string | number,
    answers: Record<string, unknown>
  ): Question | null {
    const visible = this.getVisibleQuestions(answers);
    let currentIndex = -1;

    if (typeof currentIdOrIndex === 'number') {
      currentIndex = currentIdOrIndex;
    } else {
      currentIndex = visible.findIndex((q) => q.id === currentIdOrIndex);
    }

    if (currentIndex > 0 && currentIndex < visible.length) {
      return visible[currentIndex - 1];
    }
    return null;
  }

  pruneObsoleteAnswers(answers: Record<string, unknown>): Record<string, unknown> {
    const pruned: Record<string, unknown> = { ...answers };
    let changed = true;
    while (changed) {
      changed = false;
      const visibleIds = new Set(this.getVisibleQuestions(pruned).map((q) => q.id));
      for (const question of this.questions) {
        if (question.id in pruned && !visibleIds.has(question.id)) {
          delete pruned[question.id];
          changed = true;
        }
      }
    }
    return pruned;
  }

  static createStandard(): QuestionnaireDefinition {
    const questions: Question[] = [
      new Question({
        id: 'q0_party_role',
        order: 0,
        prompt: 'Indica si eres contratante o contratista',
        type: 'single_choice',
        isRequired: true,
        helpText:
          'Define tu posición contractual en el acuerdo para estructurar adecuadamente las facultades, obligaciones y derechos de cada parte.',
        options: [
          new QuestionOption({
            id: 'opt_client',
            label: 'Contratante',
            value: 'client',
            tooltip:
              'Parte que encarga la ejecución de la obra o prestación del servicio y se compromete al pago del precio convenido.',
          }),
          new QuestionOption({
            id: 'opt_contractor',
            label: 'Contratista',
            value: 'contractor',
            tooltip:
              'Parte encargada de suministrar el bien, ejecutar la obra o prestar el servicio profesional bajo su propia autonomía técnica.',
          }),
        ],
      }),
      new Question({
        id: 'q1_legal_personality',
        order: 1,
        prompt: '¿Eres persona natural o persona jurídica?',
        type: 'single_choice',
        isRequired: true,
        helpText:
          'Determina tu capacidad legal, régimen tributario aplicable y el tipo de representación requerida para celebrar el contrato.',
        options: [
          new QuestionOption({
            id: 'opt_individual',
            label: 'Persona natural',
            value: 'individual',
            tooltip: 'Persona humana que ejerce derechos y cumple obligaciones a título personal.',
          }),
          new QuestionOption({
            id: 'opt_legal_entity',
            label: 'Persona jurídica',
            value: 'legal_entity',
            tooltip:
              'Empresa, sociedad o entidad ficticia legalmente constituida capaz de ejercer derechos y contraer obligaciones civiles y comerciales.',
          }),
        ],
      }),
      new Question({
        id: 'q2_description_conditions',
        order: 2,
        prompt: 'Describe el bien o servicio que necesitas y en qué condiciones lo requieres',
        type: 'open_text',
        isRequired: true,
        helpText:
          'Esta descripción inicial nos permite identificar la naturaleza del contrato y servirá como base para que nuestro asistente inteligente formule preguntas complementarias que precisen el alcance del acuerdo.',
      }),
      new Question({
        id: 'q3_domicile',
        order: 3,
        prompt: 'Define el domicilio del contrato',
        type: 'open_text',
        isRequired: true,
        helpText:
          'Fija el lugar geográfico y domicilio legal donde se cumplirán las obligaciones y ayuda a determinar la jurisdicción territorial aplicable.',
      }),
      new Question({
        id: 'q4_breach_impact',
        order: 4,
        prompt: '¿De qué manera te afectaría un incumplimiento por parte del proveedor?',
        type: 'open_text',
        isRequired: true,
        helpText:
          'Ayuda a calibrar las cláusulas penales pecuniarias y la estimación anticipada de perjuicios e indemnizaciones.',
      }),
      new Question({
        id: 'q5_modality',
        order: 5,
        prompt:
          '¿El bien o servicio se contrata para una entrega única o es periódico/recurrente en el tiempo?',
        type: 'single_choice',
        isRequired: true,
        helpText:
          'Distingue entre contratos de ejecución instantánea y contratos de tracto sucesivo, lo cual impacta causales de terminación y pagos.',
        options: [
          new QuestionOption({
            id: 'opt_one_time',
            label: 'Entrega única',
            value: 'one_time',
            tooltip: 'Se cumple en un solo momento o fecha acordada.',
          }),
          new QuestionOption({
            id: 'opt_recurring',
            label: 'Periódico o recurrente en el tiempo',
            value: 'recurring',
            tooltip:
              'Las obligaciones se ejecutan de manera continuada o escalonada durante un periodo.',
          }),
        ],
      }),
      new Question({
        id: 'q5a_delivery_timeframe',
        order: 6,
        prompt: 'Plazo o fecha de entrega requerida',
        type: 'open_text',
        isRequired: true,
        helpText:
          'Indica el límite temporal máximo para la entrega definitiva del bien o servicio contratado.',
        condition: new ConditionRule({
          dependsOnQuestionId: 'q5_modality',
          operator: 'equals',
          expectedValue: 'one_time',
        }),
      }),
      new Question({
        id: 'q5b_recurring_duration',
        order: 7,
        prompt: 'Duración requerida del contrato',
        type: 'single_choice',
        isRequired: true,
        helpText:
          'La duración determina si aplican normas especiales de ajuste de precio o estabilidad contractual.',
        options: [
          new QuestionOption({
            id: 'opt_lte_12m',
            label: 'Menor o igual a 12 meses',
            value: '<=12',
            tooltip: 'Contratos de corto o mediano plazo.',
          }),
          new QuestionOption({
            id: 'opt_gt_12m',
            label: 'Mayor a 12 meses',
            value: '>12',
            tooltip:
              'Contratos de largo plazo que típicamente requieren ajustes periódicos por inflación.',
          }),
        ],
        condition: new ConditionRule({
          dependsOnQuestionId: 'q5_modality',
          operator: 'equals',
          expectedValue: 'recurring',
        }),
      }),
      new Question({
        id: 'q6_service_profile',
        order: 8,
        prompt:
          'Si se contrata a un proveedor de servicios: Especifica si el proveedor empleará personal o utilizará vehículos',
        type: 'multiple_choice',
        isRequired: true,
        tooltip:
          'Esto es importante para definir obligaciones adicionales exigidas por la ley, como afiliaciones a seguridad social y pólizas de responsabilidad civil.',
        helpText:
          'La vinculación de personal o uso de vehículos genera riesgos laborales y extracontractuales que obligan a pactar cláusulas de indemnidad y pólizas.',
        options: [
          new QuestionOption({
            id: 'opt_employs_people',
            label: 'Empleará personal',
            value: 'employs_people',
            tooltip:
              'El proveedor asignará trabajadores propios o subcontratistas para prestar el servicio.',
          }),
          new QuestionOption({
            id: 'opt_uses_vehicles',
            label: 'Utilizará vehículos',
            value: 'uses_vehicles',
            tooltip: 'Se requerirá el desplazamiento o transporte con vehículos automotores.',
          }),
          new QuestionOption({
            id: 'opt_not_applicable',
            label: 'No aplica / Adquisición de bienes o sin personal ni vehículos',
            value: 'not_applicable',
            tooltip:
              'El contrato es de compraventa o el proveedor presta el servicio de forma directa sin personal ni vehículos.',
          }),
        ],
      }),
      new Question({
        id: 'q7_price_adjustment',
        order: 9,
        prompt: 'Define el mecanismo de incremento de precio',
        type: 'single_choice',
        isRequired: true,
        helpText:
          'En contratos superiores a 12 meses, este mecanismo protege el equilibrio económico del contrato frente a la inflación.',
        options: [
          new QuestionOption({
            id: 'opt_renegotiation',
            label: 'Renegociación entre las partes',
            value: 'renegotiation',
            tooltip:
              'Las partes se reunirán antes del vencimiento del periodo para concertar un nuevo precio de común acuerdo.',
          }),
          new QuestionOption({
            id: 'opt_cpi',
            label: 'Índice de Precios al Consumidor (IPC)',
            value: 'cpi',
            tooltip:
              'Ajuste anual automático indexado a la variación oficial de la inflación reportada.',
          }),
          new QuestionOption({
            id: 'opt_smlmv',
            label: 'Salario Mínimo Legal Vigente (SMLMV)',
            value: 'smlmv',
            tooltip: 'Ajuste indexado al incremento porcentual decretado para el salario mínimo.',
          }),
          new QuestionOption({
            id: 'opt_other_price',
            label: 'Otro mecanismo a especificar',
            value: 'other',
            tooltip: 'Mecanismo personalizado a pactar libremente entre las partes.',
          }),
        ],
        condition: new ConditionRule({
          dependsOnQuestionId: 'q5b_recurring_duration',
          operator: 'equals',
          expectedValue: '>12',
        }),
      }),
      new Question({
        id: 'q8_termination_notice',
        order: 10,
        prompt: 'Define el plazo de preaviso de terminación que debe otorgar el proveedor',
        type: 'single_choice',
        isRequired: true,
        helpText:
          'El preaviso otorga tiempo razonable para buscar un reemplazo o planificar la transición operativa sin traumatismos.',
        options: [
          new QuestionOption({
            id: 'opt_notice_30',
            label: '30 días calendario',
            value: 'days_30',
            tooltip: 'Plazo estándar para servicios ordinarios.',
          }),
          new QuestionOption({
            id: 'opt_notice_60',
            label: '60 días calendario',
            value: 'days_60',
            tooltip: 'Recomendado si la transición de proveedor requiere tiempo intermedio.',
          }),
          new QuestionOption({
            id: 'opt_notice_90',
            label: '90 días calendario',
            value: 'days_90',
            tooltip: 'Adecuado para servicios críticos o altamente especializados.',
          }),
          new QuestionOption({
            id: 'opt_notice_other',
            label: 'Otro plazo a especificar',
            value: 'other',
            tooltip: 'Plazo específico según tus necesidades operativas.',
          }),
        ],
      }),
      new Question({
        id: 'q9_renewal',
        order: 11,
        prompt: '¿El contrato tendrá renovación automática o una fecha fija de terminación?',
        type: 'single_choice',
        isRequired: true,
        helpText:
          'Define si el contrato se prorroga tácitamente o si expira de forma definitiva llegada la fecha pactada.',
        options: [
          new QuestionOption({
            id: 'opt_renewal_auto',
            label: 'Renovación automática',
            value: 'automatic_renewal',
            tooltip:
              'Se prorroga por periodos iguales salvo que alguna parte notifique su deseo de no renovar.',
          }),
          new QuestionOption({
            id: 'opt_renewal_fixed',
            label: 'Fecha fija de terminación',
            value: 'fixed_term',
            tooltip:
              'El contrato se extingue automáticamente al término pactado sin necesidad de aviso previo.',
          }),
        ],
      }),
      new Question({
        id: 'q9a_renewal_notice',
        order: 12,
        prompt: 'Define el plazo de preaviso requerido para evitar la renovación automática',
        type: 'open_text',
        isRequired: true,
        helpText:
          'Indica con cuánta anticipación debe enviarse la comunicación escrita para impedir la prórroga automática.',
        condition: new ConditionRule({
          dependsOnQuestionId: 'q9_renewal',
          operator: 'equals',
          expectedValue: 'automatic_renewal',
        }),
      }),
      new Question({
        id: 'q10_additional_termination',
        order: 13,
        prompt: 'Define causales adicionales de terminación anticipada más allá de las legales',
        type: 'open_text',
        isRequired: false,
        helpText:
          'Permite listar situaciones de negocio específicas que facultan a dar por terminado el contrato de forma unilateral y sin indemnización.',
      }),
      new Question({
        id: 'q11_dispute_resolution',
        order: 14,
        prompt: 'Mecanismo de resolución de controversias',
        type: 'single_choice',
        isRequired: true,
        helpText:
          'Establece la vía jurídica para resolver discrepancias: los tribunales ordinarios son públicos y económicos pero más lentos; el arbitramento es privado, ágil y especializado pero con mayor costo.',
        options: [
          new QuestionOption({
            id: 'opt_ordinary_courts',
            label: 'Tribunales ordinarios de justicia',
            value: 'ordinary_courts',
            tooltip: 'Jurisdicción estatal ordinaria ante los juzgados y tribunales competentes.',
          }),
          new QuestionOption({
            id: 'opt_arbitration',
            label: 'Tribunal de arbitramento',
            value: 'arbitration',
            tooltip: 'Árbitros privados especializados con decisión vinculante (laudo arbitral).',
          }),
          new QuestionOption({
            id: 'opt_conciliation',
            label: 'Centro de conciliación',
            value: 'conciliation',
            tooltip:
              'Audiencia previa asistida por conciliador certificado antes de acudir a litigio.',
          }),
          new QuestionOption({
            id: 'opt_amicable_settlement',
            label: 'Amigable composición',
            value: 'amicable_settlement',
            tooltip:
              'Mecanismo donde un tercero experto define la solución contractual obligatoria.',
          }),
        ],
      }),
    ];

    return new QuestionnaireDefinition({
      id: 'standard_questionnaire_v1',
      version: '1.0.0',
      questions,
    });
  }
}

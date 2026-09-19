import { getFreeContractLimit } from '@go-agree/domain';

const defaultLimit = getFreeContractLimit();

export const es = {
  brand: {
    name: 'go-agree',
    tagline: 'Generación inteligente y segura de contratos legales para Colombia',
  },
  nav: {
    login: 'Iniciar sesión',
    register: 'Registrarse',
    logout: 'Cerrar sesión',
    dashboard: 'Ir al panel',
    myContracts: 'Mis Contratos',
  },
  auth: {
    loginTitle: 'Inicia sesión en tu cuenta',
    loginSubtitle: 'Accede a tus borradores y contratos generados',
    registerTitle: 'Crea tu cuenta en go-agree',
    registerSubtitle: 'Comienza a redactar acuerdos legales en minutos',
    resetPasswordTitle: 'Recuperar contraseña',
    resetPasswordSubtitle: 'Ingresa tu correo para recibir un enlace de restablecimiento',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: '••••••••',
    passwordHint: 'Mínimo 8 caracteres',
    forgotPasswordLink: '¿Olvidaste tu contraseña?',
    submitLogin: 'Iniciar sesión',
    submitRegister: 'Crear cuenta',
    submitReset: 'Enviar enlace de recuperación',
    loadingLogin: 'Iniciando sesión...',
    loadingRegister: 'Creando cuenta...',
    loadingReset: 'Enviando...',
    continueWithGoogle: 'Continuar con Google',
    haveAccount: '¿Ya tienes una cuenta?',
    noAccount: '¿Aún no tienes una cuenta?',
    signInHere: 'Inicia sesión aquí',
    registerHere: 'Regístrate aquí',
    backToLogin: 'Volver a inicio de sesión',
    resetEmailSentSuccess:
      'Si el correo está registrado en go-agree, recibirás las instrucciones en tu bandeja de entrada.',
  },
  dashboard: {
    title: 'Mis Contratos',
    newContractButton: 'Nuevo Contrato',
    emptyTitle: 'Aún no tienes contratos',
    emptySubtitle:
      'Comienza respondiendo unas sencillas preguntas para generar tu primer contrato legal personalizado.',
    createFirstContract: 'Crear mi primer contrato',
    statusInProgress: 'En progreso',
    statusCompleted: 'Completado',
    lastModified: 'Última modificación',
    createdAt: 'Fecha de creación',
    resumeDraft: 'Continuar borrador',
    viewDocument: 'Ver resumen',
    viewSummary: 'Ver resumen',
    columns: {
      title: 'Título',
      questionsAnswered: 'Preguntas respondidas',
      download: 'Descargar',
      createdAt: 'Fecha de creación',
      updatedAt: 'Última modificación',
      actions: 'Acciones',
    },
    questionsAnsweredCount: (count: number) => `${count} respondidas`,
    download: {
      action: 'Descargar',
      pdf: 'Descargar PDF (.pdf)',
      docx: 'Descargar Word (.docx)',
      notAvailable: 'No disponible',
      tooltipNotGenerated: 'El documento aún no ha sido generado',
      pendingRegenerationBadge: 'Actualización pendiente',
      pendingRegenerationTooltip: 'Respuestas modificadas. Haz clic para revisar y regenerar el documento.',
    },
    deleteModal: {
      title: '¿Eliminar contrato?',
      message:
        '¿Estás seguro de que deseas eliminar este contrato? Esta acción es permanente y eliminará tanto el borrador como los documentos generados.',
      confirm: 'Eliminar',
      cancel: 'Cancelar',
      deleting: 'Eliminando...',
      success: 'Contrato eliminado correctamente.',
      error: 'Error al eliminar el contrato. Inténtalo de nuevo.',
    },
    rename: {
      ariaLabel: 'Hacer clic para editar el título',
      emptyError: 'El título no puede estar vacío.',
      saving: 'Guardando...',
    },
  },
  errors: {
    invalidEmail: 'Ingresa un correo electrónico válido.',
    weakPassword: 'La contraseña debe tener al menos 8 caracteres.',
    invalidCredentials: 'El correo o la contraseña son incorrectos.',
    userAlreadyExists: 'Ya existe una cuenta registrada con este correo.',
    sessionExpired: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    unauthorized: 'Debes iniciar sesión para acceder a esta sección.',
    rateLimitExceeded: 'Demasiados intentos. Por favor, espera un minuto antes de reintentar.',
    networkError:
      'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo nuevamente.',
    googleAuthFailed: 'No se pudo completar la autenticación con Google. Inténtalo de nuevo.',
    genericError: 'Ocurrió un error inesperado. Por favor, inténtalo más tarde.',
  },
  questionnaire: {
    title: 'Cuestionario Estándar',
    subtitle: 'Responde a las siguientes preguntas para definir los términos base de tu contrato.',
    defaultTitlePrefix: 'Mi Contrato',
    editTitlePlaceholder: 'Título del contrato',
    editTitleAria: 'Editar título del contrato',
    emptyTitleError: 'El título del contrato no puede estar vacío.',
    whyAskThis: '¿Por qué te preguntamos esto?',
    requiredField: 'Este campo es requerido.',
    savingStatus: 'Guardando...',
    savedStatus: 'Guardado',
    saveError: 'Error de conexión. Tus datos están a salvo localmente. Reintentando guardar...',
    retry: 'Reintentar',
    retrying: 'Reintentando...',
    charCount: 'caracteres',
    specifyOtherLabel: 'Especifica el valor:',
    specifyOtherPlaceholder: 'Escribe el valor específico aquí...',
    nav: {
      previous: 'Anterior',
      next: 'Siguiente',
      review: 'Revisar respuestas',
      confirm: 'Confirmar cuestionario',
      modify: 'Modificar',
      updateAnswer: 'Actualizar respuesta',
    },
    summary: {
      title: 'Resumen de Respuestas',
      subtitle:
        'Revisa las respuestas del cuestionario estándar antes de continuar con la generación de tu contrato.',
      notAnswered: 'No respondido',
      confirmAction: 'Confirmar y generar contrato',
      generatingContract: 'Generando contrato...',
      downloadWord: 'Descargar Word (.docx)',
      downloadPdf: 'Descargar PDF (.pdf)',
      legalDisclaimerTitle: 'Aviso importante sobre el contenido del contrato',
      legalDisclaimerText:
        'El presente documento se ensambla y redacta automáticamente a partir de las respuestas suministradas en este cuestionario. No constituye asesoría legal profesional ni sustituye la consulta con un abogado titulado.',
      pendingRegenerationBannerTitle: 'Actualización pendiente',
      pendingRegenerationBannerText:
        'Has modificado una o más respuestas después de haber generado el contrato. Debes regenerar el documento para que los cambios se reflejen en los archivos Word y PDF.',
      regenerateAction: 'Regenerar documento',
      regenerating: 'Regenerando documento...',
      incompleteError: 'Debes responder todas las preguntas antes de generar el contrato.',
      backToDraft: 'Volver a la última pregunta',
      backToDashboard: 'Volver al panel',
    },
    contractorNotice: {
      title: 'Flujo para contratistas en desarrollo',
      message:
        'Actualmente la generación de contratos está habilitada únicamente para la parte contratante. El alcance para contratistas se considerará en una posterior iteración. Para continuar con la creación del contrato, por favor selecciona "Contratante".',
      error:
        'Por favor selecciona "Contratante" para continuar con este cuestionario. El flujo para contratistas estará disponible próximamente.',
    },
    guidanceAction: {
      useExample: 'Usar como plantilla',
      viewExample: 'Ver ejemplo',
      hideExample: 'Ocultar ejemplo',
    },
    questions: {
      q0_party_role: {
        title: 'Rol en el contrato',
        prompt: 'Indica si eres contratante o contratista',
        helpText:
          'Define tu posición contractual en el acuerdo para estructurar adecuadamente las facultades, obligaciones y derechos de cada parte.',
        options: {
          client: {
            label: 'Contratante',
            tooltip:
              'Parte que encarga la ejecución de la obra o prestación del servicio y se compromete al pago del precio convenido.',
          },
          contractor: {
            label: 'Contratista',
            tooltip:
              'Parte encargada de suministrar el bien, ejecutar la obra o prestar el servicio profesional bajo su propia autonomía técnica.',
          },
        },
      },
      q1_legal_personality: {
        title: 'Personalidad jurídica',
        prompt: '¿Eres persona natural o persona jurídica?',
        helpText:
          'Determina tu capacidad legal, régimen tributario aplicable y el tipo de representación requerida para celebrar el contrato.',
        options: {
          individual: {
            label: 'Persona natural',
            tooltip: 'Persona humana que ejerce derechos y cumple obligaciones a título personal.',
          },
          legal_entity: {
            label: 'Persona jurídica',
            tooltip:
              'Empresa, sociedad o entidad ficticia legalmente constituida capaz de ejercer derechos y contraer obligaciones civiles y comerciales.',
          },
        },
      },
      q2_description_conditions: {
        title: 'Descripción y condiciones del bien o servicio',
        prompt: 'Describe el bien o servicio que necesitas y en qué condiciones lo requieres',
        placeholder:
          'Ej. Servicios de desarrollo de software para plataforma web de comercio electrónico, entregado en 90 días calendario y bajo metodología ágil...',
        helpText:
          'Esta descripción inicial nos permite identificar la naturaleza del contrato y servirá como base para que nuestro asistente inteligente formule preguntas complementarias que precisen el alcance del acuerdo.',
        guidance: {
          title: 'Recomendaciones para describir el bien o servicio',
          badge: '🤖 Base para análisis del Asistente de IA',
          context:
            'Esta descripción es fundamental porque se enviará como prompt hacia nuestro modelo de IA para que genere preguntas adicionales orientadas a especificar el alcance de tu contrato de la mejor manera.',
          tips: [
            {
              icon: '📦',
              title: 'Detalla el objeto',
              text: 'Especifica qué bien o servicio requieres con exactitud (especificaciones técnicas, actividades concretas, entregables o alcances).',
            },
            {
              icon: '⏱️',
              title: 'Condiciones de entrega y plazos',
              text: 'Indica tiempos esperados de entrega, frecuencia de avances, modalidades (remota o presencial) o lugares clave de prestación.',
            },
            {
              icon: '🎯',
              title: 'Criterios de calidad y aceptación',
              text: 'Define cómo evaluarás que el bien o servicio cumple con tus expectativas (pruebas de recepción, empaque sellado, garantías mínimas o estándares técnicos).',
            },
          ],
          examples: [
            {
              label: 'Ejemplo de Servicio',
              text: 'Contratación de servicios de desarrollo de software para una aplicación web y móvil de e-commerce en React y Node.js, incluyendo pasarela de pagos integrada, panel administrativo, entrega en 3 hitos durante 90 días calendario y soporte técnico posentrega por 3 meses.',
            },
            {
              label: 'Ejemplo de Bien',
              text: 'Suministro e instalación de 30 estaciones de trabajo ergonómicas modulares en melamina de 18mm con estructura metálica y sillas ejecutivas regulables, entregadas en la sede corporativa en Bogotá en un plazo máximo de 20 días hábiles con garantía técnica de 1 año.',
            },
          ],
        },
      },
      q3_domicile: {
        title: 'Domicilio del contrato',
        prompt: 'Define el domicilio del contrato',
        placeholder: 'Ej. Calle 100 # 15-20, Oficina 501, Bogotá D.C., Colombia',
        helpText:
          'Fija el lugar geográfico y domicilio legal donde se cumplirán las obligaciones y ayuda a determinar la jurisdicción territorial aplicable.',
      },
      q4_breach_impact: {
        title: 'Impacto por incumplimiento',
        prompt:
          'Cuéntanos, ¿cómo crees que te verías afectado si el proveedor incumple el contrato?',
        placeholder:
          'Ej. Parálisis operativa, pérdida directa de ingresos comerciales, sanciones de clientes terceros o daño reputacional...',
        helpText:
          'Ayuda a calibrar las cláusulas penales pecuniarias y la estimación anticipada de perjuicios e indemnizaciones.',
        guidance: {
          title: 'Recomendaciones para evaluar el impacto de un incumplimiento',
          badge: '⚖️ Calibración de Cláusulas Penales',
          context:
            'Tu respuesta permitirá determinar el rigor y valor de las cláusulas penales pecuniarias y las pólizas de seguro necesarias para proteger tu negocio.',
          tips: [
            {
              icon: '🛑',
              title: 'Impacto operativo',
              text: '¿Se interrumpirían actividades indispensables, procesos productivos clave o la atención a tus propios clientes?',
            },
            {
              icon: '💸',
              title: 'Pérdidas económicas directas',
              text: '¿Generaría pérdidas directas de ventas, lucro cesante, gastos de contingencia para contratar un reemplazo urgente o penalidades con terceros?',
            },
            {
              icon: '🛡️',
              title: 'Riesgo legal y reputacional',
              text: '¿Podrías enfrentar multas regulatorias o pérdida de confianza y credibilidad de tus usuarios en el mercado?',
            },
          ],
          examples: [
            {
              label: 'Ejemplo de impacto operativo y financiero',
              text: 'Un retraso superior a 15 días en la entrega detendría el lanzamiento de nuestra campaña anual, ocasionando pérdidas estimadas de ingresos comerciales y sobrecostos por tener que contratar personal de contingencia.',
            },
          ],
        },
      },
      q5_modality: {
        title: 'Modalidad de entrega',
        prompt:
          '¿El bien o servicio se contrata para una entrega única o es periódico/recurrente en el tiempo?',
        helpText:
          'Distingue entre contratos de ejecución instantánea y contratos de tracto sucesivo, lo cual impacta causales de terminación y pagos.',
        options: {
          one_time: {
            label: 'Entrega única',
            tooltip: 'Se cumple en un solo momento o fecha acordada.',
          },
          recurring: {
            label: 'Periódico o recurrente en el tiempo',
            tooltip:
              'Las obligaciones se ejecutan de manera continuada o escalonada durante un periodo.',
          },
        },
      },
      q5a_delivery_timeframe: {
        title: 'Plazo de entrega',
        prompt: 'Plazo o fecha de entrega requerida',
        placeholder: 'Ej. 30 días calendario contados a partir de la firma del contrato...',
        helpText:
          'Indica el límite temporal máximo para la entrega definitiva del bien o servicio contratado.',
      },
      q5b_recurring_duration: {
        title: 'Duración del contrato',
        prompt: 'Duración requerida del contrato',
        helpText:
          'La duración determina si aplican normas especiales de ajuste de precio o estabilidad contractual.',
        options: {
          lte_12m: {
            label: 'Menor o igual a 12 meses',
            tooltip: 'Contratos de corto o mediano plazo.',
          },
          gt_12m: {
            label: 'Mayor a 12 meses',
            tooltip:
              'Contratos de largo plazo que típicamente requieren ajustes periódicos por inflación.',
          },
        },
      },
      q6_service_profile: {
        title: 'Perfil del servicio',
        prompt:
          'Si se contrata a un proveedor de servicios: Especifica si el proveedor empleará personal o utilizará vehículos',
        tooltip:
          'Esto es importante para definir obligaciones adicionales exigidas por la ley, como afiliaciones a seguridad social y pólizas de responsabilidad civil.',
        helpText:
          'La vinculación de personal o uso de vehículos genera riesgos laborales y extracontractuales que obligan a pactar cláusulas de indemnidad y pólizas.',
        options: {
          employs_people: {
            label: 'Empleará personal',
            tooltip:
              'El proveedor asignará trabajadores propios o subcontratistas para prestar el servicio.',
          },
          uses_vehicles: {
            label: 'Utilizará vehículos',
            tooltip: 'Se requerirá el desplazamiento o transporte con vehículos automotores.',
          },
          not_applicable: {
            label: 'No aplica / Adquisición de bienes o sin personal ni vehículos',
            tooltip:
              'El contrato es de compraventa o el proveedor presta el servicio de forma directa sin personal ni vehículos.',
          },
        },
      },
      q7_price_adjustment: {
        title: 'Ajuste de precio',
        prompt: 'Define el mecanismo de incremento de precio',
        helpText:
          'En contratos superiores a 12 meses, este mecanismo protege el equilibrio económico del contrato frente a la inflación.',
        options: {
          renegotiation: {
            label: 'Renegociación entre las partes',
            tooltip:
              'Las partes se reunirán antes del vencimiento del periodo para concertar un nuevo precio de común acuerdo.',
          },
          cpi: {
            label: 'Índice de Precios al Consumidor (IPC)',
            tooltip:
              'Ajuste anual automático indexado a la variación oficial de la inflación reportada.',
          },
          smlmv: {
            label: 'Salario Mínimo Legal Vigente (SMLMV)',
            tooltip: 'Ajuste indexado al incremento porcentual decretado para el salario mínimo.',
          },
          other: {
            label: 'Otro mecanismo a especificar',
            tooltip: 'Mecanismo personalizado a pactar libremente entre las partes.',
          },
        },
      },
      q8_termination_notice: {
        title: 'Preaviso de terminación',
        prompt: 'Define el plazo de preaviso de terminación que debe otorgar el proveedor',
        helpText:
          'El preaviso otorga tiempo razonable para buscar un reemplazo o planificar la transición operativa sin traumatismos.',
        options: {
          days_30: {
            label: '30 días calendario',
            tooltip: 'Plazo estándar para servicios ordinarios.',
          },
          days_60: {
            label: '60 días calendario',
            tooltip: 'Recomendado si la transición de proveedor requiere tiempo intermedio.',
          },
          days_90: {
            label: '90 días calendario',
            tooltip: 'Adecuado para servicios críticos o altamente especializados.',
          },
          other: {
            label: 'Otro plazo a especificar',
            tooltip: 'Plazo específico según tus necesidades operativas.',
          },
        },
      },
      q9_renewal: {
        title: 'Renovación del contrato',
        prompt: '¿El contrato tendrá renovación automática o una fecha fija de terminación?',
        helpText:
          'Define si el contrato se prorroga tácitamente o si expira de forma definitiva llegada la fecha pactada.',
        options: {
          automatic_renewal: {
            label: 'Renovación automática',
            tooltip:
              'Se prorroga por periodos iguales salvo que alguna parte notifique su deseo de no renovar.',
          },
          fixed_term: {
            label: 'Fecha fija de terminación',
            tooltip:
              'El contrato se extingue automáticamente al término pactado sin necesidad de aviso previo.',
          },
        },
      },
      q9a_renewal_notice: {
        title: 'Preaviso de renovación',
        prompt: 'Define el plazo de preaviso requerido para evitar la renovación automática',
        placeholder: 'Ej. 30 días calendario antes de la fecha de vencimiento...',
        helpText:
          'Indica con cuánta anticipación debe enviarse la comunicación escrita para impedir la prórroga automática.',
      },
      q10_additional_termination: {
        title: 'Causales de terminación adicional',
        prompt: 'Define causales adicionales de terminación anticipada más allá de las legales',
        placeholder:
          'Ej. Pérdida de certificaciones técnicas, cambio de control accionario del proveedor, o quiebra/insolvencia...',
        helpText:
          'Permite listar situaciones de negocio específicas que facultan a dar por terminado el contrato de forma unilateral y sin indemnización.',
      },
      q11_dispute_resolution: {
        title: 'Resolución de controversias',
        prompt: 'Mecanismo de resolución de controversias',
        helpText:
          'Establece la vía jurídica para resolver discrepancias: los tribunales ordinarios son públicos y económicos pero más lentos; el arbitramento es privado, ágil y especializado pero con mayor costo.',
        options: {
          ordinary_courts: {
            label: 'Tribunales ordinarios de justicia',
            tooltip: 'Jurisdicción estatal ordinaria ante los juzgados y tribunales competentes.',
          },
          arbitration: {
            label: 'Tribunal de arbitramento',
            tooltip: 'Árbitros privados especializados con decisión vinculante (laudo arbitral).',
          },
          conciliation: {
            label: 'Centro de conciliación',
            tooltip:
              'Audiencia previa asistida por conciliador certificado antes de acudir a litigio.',
          },
          amicable_settlement: {
            label: 'Amigable composición',
            tooltip:
              'Mecanismo donde un tercero experto define la solución contractual obligatoria.',
          },
        },
      },
    },
  },
  landing: {
    nav: {
      howItWorks: 'Cómo funciona',
      pricing: 'Precios',
      openMenuAria: 'Abrir menú de navegación',
      closeMenuAria: 'Cerrar menú de navegación',
    },
    hero: {
      badge: '✨ Crea acuerdos legales claros y confiables',
      title: 'Crea contratos a tu medida respondiendo un cuestionario guiado',
      subtitle:
        'Olvídate de formatos genéricos y confusos. go-agree analiza tus necesidades paso a paso para generar un acuerdo legal personalizado y listo para descargar.',
      freeTrialBadge: `🎁 ${defaultLimit} contratos gratis sin tarjeta de crédito`,
      formatFreeTrialBadge: (count: number) =>
        `🎁 ${count} contratos gratis sin tarjeta de crédito`,
      ctaPrimary: 'Comenzar gratis',
      ctaSecondary: 'Iniciar sesión',
      ctaDashboard: 'Ir a mis contratos',
      contractCountNote: `Regístrate hoy y redacta tus primeros ${defaultLimit} contratos totalmente gratis.`,
      formatContractCountNote: (count: number) =>
        `Regístrate hoy y redacta tus primeros ${count} contratos totalmente gratis.`,
    },
    howItWorks: {
      tagline: 'Proceso simple y transparente',
      title: 'Cómo funciona go-agree',
      subtitle:
        'Tres sencillos pasos para obtener un contrato legal ajustado a la realidad de tu acuerdo.',
      steps: {
        step1: {
          badge: 'Paso 1',
          title: 'Responde preguntas guiadas',
          description:
            'Completa un cuestionario interactivo con lenguaje claro sobre las partes, el objeto, condiciones de entrega, pagos y resolución de controversias.',
        },
        step2: {
          badge: 'Paso 2',
          title: 'Análisis inteligente del acuerdo',
          description:
            'El sistema analiza automáticamente tus respuestas para formular preguntas adicionales específicas y calibrar cláusulas de protección personalizadas.',
        },
        step3: {
          badge: 'Paso 3',
          title: 'Descarga inmediata en Word o PDF',
          description:
            'Genera el documento definitivo y descárgalo de inmediato en formato Word editable (.docx) o en PDF listo para imprimir y compartir.',
        },
      },
    },
    pricing: {
      tagline: 'Precios transparentes y sin sorpresas',
      title: 'Un plan diseñado para respaldar tus acuerdos',
      subtitle:
        'Acceso completo e ilimitado para generar contratos profesionales cuando los necesites.',
      freeTrialBanner: {
        badge: 'Prueba gratuita',
        title: `${defaultLimit} contratos gratis incluidos`,
        formatTitle: (count: number) => `${count} contratos gratis incluidos`,
        description: `Crea tu cuenta sin costo y genera tus primeros ${defaultLimit} contratos completos antes de suscribirte. Sin tarjeta de crédito requerida.`,
        formatDescription: (count: number) =>
          `Crea tu cuenta sin costo y genera tus primeros ${count} contratos completos antes de suscribirte. Sin tarjeta de crédito requerida.`,
      },
      billingCycle: {
        label: 'Frecuencia de facturación',
        monthly: 'Facturación mensual',
        annual: 'Facturación anual',
        saveBadge: 'Ahorra 20%',
      },
      period: {
        monthly: 'mes',
        billedMonthly: 'Facturación mensual sin compromiso a largo plazo',
        billedAnnually: 'Facturado anualmente a {annualTotal} / año',
      },
      cta: 'Comenzar ahora',
      featuresTitle: 'Todo lo que incluye el Plan Pro:',
      features: [
        'Generación ilimitada de contratos legales',
        'Cuestionario guiado pregunta a pregunta',
        'Análisis inteligente para preguntas de alcance específico',
        'Descarga directa en formato Word (.docx) y PDF',
        'Autoguardado incremental y reanudación de borradores',
        'Historial de contratos creados y acceso permanente',
      ],
    },
    footer: {
      brandTagline: 'Generación inteligente y segura de contratos legales.',
      legalDisclaimer:
        'Aviso legal: go-agree es una herramienta tecnológica automatizada para la redacción y generación de borradores de contratos. No constituye una firma de abogados, no presta asesoría jurídica personalizada ni sustituye la consulta con un profesional del derecho.',
      rightsReserved: 'Todos los derechos reservados.',
    },
  },
  plans: {
    free: 'Plan Gratuito',
    pro: 'Plan Pro',
    quotaMeter: '{used} de {max} contratos generados ({remaining} restantes)',
    quotaAvailable: '{count} disponibles',
    quotaExhausted: `Has utilizado tus ${defaultLimit} contratos gratuitos`,
    formatQuotaExhausted: (count: number) => `Has utilizado tus ${count} contratos gratuitos`,
    unlimitedAccess: 'Acceso Pro: Contratos ilimitados',
    upgradeButton: 'Comprar Plan Pro',
    upgradeModalTitle: 'Límite de contratos gratuitos alcanzado',
    upgradeModalDescription: `Has generado tus ${defaultLimit} contratos gratuitos. Para continuar creando contratos ilimitados y acceder a todas las funciones profesionales, adquiere el Plan Pro.`,
    formatUpgradeModalDescription: (count: number) =>
      `Has generado tus ${count} contratos gratuitos. Para continuar creando contratos ilimitados y acceder a todas las funciones profesionales, adquiere el Plan Pro.`,
    upgradeModalCta: 'Comprar Plan Pro',
    upgradeModalClose: 'Seguir revisando mis contratos',
  },
  checkout: {
    title: 'Adquiere tu Plan Pro',
    subtitle: 'Selecciona tu ciclo de facturación y método de pago preferido.',
    providerSectionTitle: 'Pasarela de pago',
    providerSectionSubtitle: 'Selecciona tu pasarela de pago para continuar:',
    payButton: 'Pagar con {provider}',
    processing: 'Procesando pago...',
    duplicateWarning:
      'Ya tienes un Plan Pro activo o una transacción en curso. No es necesario realizar un nuevo pago.',
    noProvidersForCountry:
      'No hay pasarelas de pago disponibles actualmente para tu país ({country}).',
    errors: {
      alreadyActive: 'Tu cuenta ya cuenta con una suscripción activa a Plan Pro.',
      checkoutFailed: 'No fue posible iniciar la sesión de pago. Por favor intenta de nuevo.',
    },
  },
  paymentResult: {
    approvedTitle: '¡Pago exitoso!',
    approvedSubtitle: 'Tu Plan Pro está activo. Ya puedes generar contratos sin límites.',
    pendingTitle: 'Pago en proceso de verificación',
    pendingSubtitle:
      'Tu entidad financiera está procesando la transacción. Esto puede tomar unos momentos.',
    rejectedTitle: 'Pago no completado',
    rejectedSubtitle: 'La transacción no pudo ser aprobada por tu entidad financiera.',
    verifyStatusButton: 'Verificar estado',
    verifying: 'Verificando...',
    retryButton: 'Reintentar pago',
    backToDashboard: 'Ir al panel',
    referenceLabel: 'Referencia:',
    reasons: {
      insufficientFunds: 'Fondos insuficientes en la cuenta.',
      declinedByBank: 'Transacción declinada por la entidad financiera.',
      expired: 'El tiempo límite para completar la transacción ha expirado.',
      duplicate: 'El pago fue identificado como duplicado y no fue aceptado.',
      generic: 'Ocurrió un error al procesar la transacción.',
    },
  },
} as const;

export type LocalizationDictionary = typeof es;

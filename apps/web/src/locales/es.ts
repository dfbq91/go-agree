export const es = {
  brand: {
    name: 'go-agree',
    tagline: 'Generación inteligente y segura de contratos legales',
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
    emptyTitle: 'Aún no tienes contratos generados',
    emptySubtitle: 'Comienza respondiendo el cuestionario estándar para generar tu primer contrato legal.',
    createFirstContract: 'Comenzar cuestionario',
    statusInProgress: 'En progreso',
    statusCompleted: 'Completado',
    lastModified: 'Última modificación',
    resumeDraft: 'Continuar edición',
    viewDocument: 'Ver resumen',
    viewSummary: 'Ver resumen',
  },
  errors: {
    invalidEmail: 'Ingresa un correo electrónico válido.',
    weakPassword: 'La contraseña debe tener al menos 8 caracteres.',
    invalidCredentials: 'El correo o la contraseña son incorrectos.',
    userAlreadyExists: 'Ya existe una cuenta registrada con este correo.',
    sessionExpired: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    unauthorized: 'Debes iniciar sesión para acceder a esta sección.',
    rateLimitExceeded: 'Demasiados intentos. Por favor, espera un minuto antes de reintentar.',
    networkError: 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo nuevamente.',
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
      subtitle: 'Revisa las respuestas del cuestionario estándar antes de continuar con la generación de tu contrato.',
      notAnswered: 'No respondido',
      confirmAction: 'Confirmar y continuar',
      backToDraft: 'Volver a la última pregunta',
      backToDashboard: 'Volver al panel',
    },
    questions: {
      q0_description: {
        title: 'Descripción del bien o servicio',
        prompt: 'Describe el bien o servicio que necesitas',
        placeholder: 'Ej. Servicios de desarrollo de software para plataforma web de comercio electrónico...',
        helpText: 'Esta descripción inicial nos permite identificar la naturaleza de la relación contractual y preparar las cláusulas técnicas y operativas más adecuadas.',
      },
      q1_legal_personality: {
        title: 'Personalidad jurídica',
        prompt: '¿Eres persona natural o persona jurídica?',
        helpText: 'Determina tu capacidad legal, régimen tributario aplicable y el tipo de representación requerida para celebrar el contrato.',
        options: {
          individual: {
            label: 'Persona natural',
            tooltip: 'Persona humana que ejerce derechos y cumple obligaciones a título personal.',
          },
          legal_entity: {
            label: 'Persona jurídica',
            tooltip: 'Empresa, sociedad o entidad ficticia legalmente constituida capaz de ejercer derechos y contraer obligaciones civiles y comerciales.',
          },
        },
      },
      q2_delivery_conditions: {
        title: 'Condiciones de entrega',
        prompt: '¿Bajo qué condiciones requieres que se entregue el bien o servicio solicitado?',
        placeholder: 'Ej. Vida útil mínima de 12 meses para productos perecederos, entregas en empaque sellado, o estándares técnicos específicos...',
        helpText: 'Establecer criterios de aceptación claros previene disputas sobre calidad y define cuándo se entiende cumplida la obligación de entrega.',
      },
      q3_location: {
        title: 'Ubicación del contrato',
        prompt: '¿Cuál es la ubicación del contrato (dirección exacta)?',
        placeholder: 'Ej. Calle 100 # 15-20, Oficina 501, Bogotá D.C., Colombia',
        helpText: 'Fija el lugar geográfico donde se cumplirán las obligaciones y ayuda a determinar la jurisdicción territorial aplicable.',
      },
      q4_modality: {
        title: 'Modalidad de entrega',
        prompt: '¿El bien o servicio se contrata para una entrega única o es periódico/recurrente en el tiempo?',
        helpText: 'Distingue entre contratos de ejecución instantánea y contratos de tracto sucesivo, lo cual impacta causales de terminación y pagos.',
        options: {
          one_time: {
            label: 'Entrega única',
            tooltip: 'Se cumple en un solo momento o fecha acordada.',
          },
          recurring: {
            label: 'Periódico o recurrente en el tiempo',
            tooltip: 'Las obligaciones se ejecutan de manera continuada o escalonada durante un periodo.',
          },
        },
      },
      q4a_delivery_timeframe: {
        title: 'Plazo de entrega',
        prompt: 'Plazo o fecha de entrega requerida',
        placeholder: 'Ej. 30 días calendario contados a partir de la firma del contrato...',
        helpText: 'Indica el límite temporal máximo para la entrega definitiva del bien o servicio contratado.',
      },
      q4b_recurring_duration: {
        title: 'Duración del contrato',
        prompt: 'Duración requerida del contrato',
        helpText: 'La duración determina si aplican normas especiales de ajuste de precio o estabilidad contractual.',
        options: {
          lte_12m: {
            label: 'Menor o igual a 12 meses',
            tooltip: 'Contratos de corto o mediano plazo.',
          },
          gt_12m: {
            label: 'Mayor a 12 meses',
            tooltip: 'Contratos de largo plazo que típicamente requieren ajustes periódicos por inflación.',
          },
        },
      },
      q5_service_profile: {
        title: 'Perfil del servicio',
        prompt: 'Si se contrata a un proveedor de servicios: Especifica si el proveedor empleará personal o utilizará vehículos',
        tooltip: 'Esto es importante para definir obligaciones adicionales exigidas por la ley, como afiliaciones a seguridad social y pólizas de responsabilidad civil.',
        helpText: 'La vinculación de personal o uso de vehículos genera riesgos laborales y extracontractuales que obligan a pactar cláusulas de indemnidad y pólizas.',
        options: {
          employs_people: {
            label: 'Empleará personal',
            tooltip: 'El proveedor asignará trabajadores propios o subcontratistas para prestar el servicio.',
          },
          uses_vehicles: {
            label: 'Utilizará vehículos',
            tooltip: 'Se requerirá el desplazamiento o transporte con vehículos automotores.',
          },
          not_applicable: {
            label: 'No aplica / Adquisición de bienes o sin personal ni vehículos',
            tooltip: 'El contrato es de compraventa o el proveedor presta el servicio de forma directa sin personal ni vehículos.',
          },
        },
      },
      q6_breach_impact: {
        title: 'Impacto por incumplimiento',
        prompt: '¿De qué manera te afectaría un incumplimiento por parte del proveedor?',
        placeholder: 'Ej. Parálisis operativa, pérdida directa de ingresos comerciales, sanciones de terceros o daño reputacional...',
        helpText: 'Ayuda a calibrar las cláusulas penales pecuniarias y la estimación anticipada de perjuicios e indemnizaciones.',
      },
      q7_price_adjustment: {
        title: 'Ajuste de precio',
        prompt: 'Define el mecanismo de incremento de precio',
        helpText: 'En contratos superiores a 12 meses, este mecanismo protege el equilibrio económico del contrato frente a la inflación.',
        options: {
          renegotiation: {
            label: 'Renegociación entre las partes',
            tooltip: 'Las partes se reunirán antes del vencimiento del periodo para concertar un nuevo precio de común acuerdo.',
          },
          cpi: {
            label: 'Índice de Precios al Consumidor (IPC)',
            tooltip: 'Ajuste anual automático indexado a la variación oficial de la inflación reportada.',
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
        helpText: 'El preaviso otorga tiempo razonable para buscar un reemplazo o planificar la transición operativa sin traumatismos.',
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
        helpText: 'Define si el contrato se prorroga tácitamente o si expira de forma definitiva llegada la fecha pactada.',
        options: {
          automatic_renewal: {
            label: 'Renovación automática',
            tooltip: 'Se prorroga por periodos iguales salvo que alguna parte notifique su deseo de no renovar.',
          },
          fixed_term: {
            label: 'Fecha fija de terminación',
            tooltip: 'El contrato se extingue automáticamente al término pactado sin necesidad de aviso previo.',
          },
        },
      },
      q9a_renewal_notice: {
        title: 'Preaviso de renovación',
        prompt: 'Define el plazo de preaviso requerido para evitar la renovación automática',
        placeholder: 'Ej. 30 días calendario antes de la fecha de vencimiento...',
        helpText: 'Indica con cuánta anticipación debe enviarse la comunicación escrita para impedir la prórroga automática.',
      },
      q10_additional_termination: {
        title: 'Causales de terminación adicional',
        prompt: 'Define causales adicionales de terminación anticipada más allá de las legales',
        placeholder: 'Ej. Pérdida de certificaciones técnicas, cambio de control accionario del proveedor, o quiebra/insolvencia...',
        helpText: 'Permite listar situaciones de negocio específicas que facultan a dar por terminado el contrato de forma unilateral y sin indemnización.',
      },
      q11_dispute_resolution: {
        title: 'Resolución de controversias',
        prompt: 'Mecanismo de resolución de controversias',
        helpText: 'Establece la vía jurídica para resolver discrepancias: los tribunales ordinarios son públicos y económicos pero más lentos; el arbitramento es privado, ágil y especializado pero con mayor costo.',
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
            tooltip: 'Audiencia previa asistida por conciliador certificado antes de acudir a litigio.',
          },
          amicable_settlement: {
            label: 'Amigable composición',
            tooltip: 'Mecanismo donde un tercero experto define la solución contractual obligatoria.',
          },
        },
      },
    },
  },
} as const;

export type LocalizationDictionary = typeof es;

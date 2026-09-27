# Roadmap de Producto: Funcionalidades Futuras de go-agree

Este documento recopila las funcionalidades conceptualizadas y validadas visualmente en el sistema de diseño de **Stitch** que actualmente **no forman parte del MVP activo** de go-agree, pero han sido aprobadas para su desarrollo e integración en fases posteriores.

---

## 1. Gestión de Portafolio y Dashboard

### 1.1. Filtro y Clasificación por Tipo de Contrato
* **Descripción:** Selector interactivo para filtrar y agrupar contratos según su categoría legal específica.
* **Comportamiento:** La categoría no es estática; se infiere y asigna dinámicamente a partir del análisis del objeto y la naturaleza del contrato respondida en el cuestionario (ejemplos: *Prestación de Servicios / Consultoría*, *Acuerdo de Confidencialidad (NDA)*, *Contrato Laboral*, *Desarrollo de Software / Tecnología*, *Arrendamiento*, entre otros).
* **Impacto:** Permite a usuarios con múltiples acuerdos comerciales localizar y ordenar sus documentos de forma inmediata según el ámbito del negocio.

### 1.2. Paginación Dinámica
* **Descripción:** Control de paginación estructurada para la tabla de contratos en el dashboard (*"Mostrando 1 a 5 de X contratos"* con controles de *Anterior / Siguiente* y selector de página).
* **Impacto:** Reemplaza la carga infinita o lista continua, mejorando los tiempos de respuesta y optimizando la navegación para usuarios con portafolios de alta volumetría.

---

## 2. Experiencia de Cuestionario ("Contestación de Preguntas")

### 2.1. Chips de Preajustes Rápidos (One-Click Presets)
* **Descripción:** Chips interactivos ubicados en el panel de sugerencia legal (`QuestionGuidance`) que permiten al usuario rellenar instantáneamente opciones frecuentes o complejas con un solo clic.
* **Ejemplos:**
  * Para preguntas de personal/vehículos: `[Personal calificado propio]`, `[Subcontratación autorizada]`, `[Sin personal adicional ni vehículos]`.
  * Para cláusulas de terminación o plazos: `[30 días calendario con preaviso escrito]`, `[Terminación inmediata con justa causa]`.
* **Impacto:** Reduce drásticamente la fricción y el tiempo de llenado del cuestionario, manteniendo una redacción jurídica estandarizada y coherente.

### 2.2. Mapeo a Cláusulas en Tiempo Real
* **Descripción:** Indicador contextual visible en la tarjeta de la pregunta que informa al usuario qué cláusula y qué sección del contrato final está configurando con su respuesta.
* **Ejemplo visual:** `"Sección 2: Estructura Operativa • CLÁUSULA CUARTA: RECURSOS Y RESPONSABILIDAD LABORAL"`.
* **Impacto:** Brinda total transparencia y pedagogía legal al usuario, quien comprende exactamente la repercusión contractual de cada opción seleccionada.

---

## 3. Resumen Ejecutivo y Generación de Documento (`/summary`)

### 3.1. Estructuración en Acordeones por Categorías Jurídicas
* **Descripción:** Agrupación modular de las preguntas y respuestas en 5 secciones temáticas colapsables (con opción de *"Expandir / Colapsar todas"*), creadas a partir de la naturaleza del contrato:
  1. *Identificación y Personería Jurídica*
  2. *Objeto del Contrato y Entregables*
  3. *Plazos, Vigencia y Régimen de Prórrogas*
  4. *Condiciones Económicas, Tarifas y Reajuste (IPC)*
  5. *Solución de Controversias, Ley Aplicable y Jurisdicción*
* **Impacto:** Facilita la revisión rápida y focalizada antes de la generación, evitando listas interminables de 14+ preguntas en un solo plano. Cada bloque cuenta con su botón `Editar ✎` directo.

### 3.2. Previsualización Fotorrealista de la Primera Página
* **Descripción:** Visor o mockup realista integrado en el panel de descarga que muestra una vista previa fidedigna de la primera página del documento formal generado (papel membretado, cabecera formal, radicado y formato de cláusulas).
* **Impacto:** Genera satisfacción y certeza visual inmediata en el usuario sobre la calidad del entregable antes de proceder a la descarga.

### 3.3. Código QR y Hash Criptográfico SHA-256
* **Descripción:** Inclusión de un sello visual de integridad compuesto por un código QR verificable y la huella criptográfica SHA-256 calculada a partir del contenido del contrato generado.
* **Impacto:** Proporciona un mecanismo de auditoría y validación inmutable para confirmar que el documento PDF no ha sufrido alteraciones posteriores a su generación en la plataforma.

---

## 4. Firma, Seguridad y Autenticación

### 4.1. Firma Electrónica Integrada y Envío a Contrapartes
* **Descripción:** Flujo end-to-end dentro de go-agree para enviar el contrato generado por correo electrónico a las partes firmantes y recopilar sus firmas electrónicas con plena validez probatoria (bajo la Ley 527 de 1999 de comercio electrónico y firmas digitales en Colombia).
* **Impacto:** Cierra el ciclo contractual dentro de la plataforma, eliminando la necesidad de descargar el documento para firmarlo mediante herramientas de terceros.

### 4.2. Autenticación en Dos Pasos (2FA / MFA)
* **Descripción:** Capa adicional de seguridad mediante códigos de verificación de un solo uso (OTP vía SMS o app autenticadora como Google Authenticator) al iniciar sesión.
* **Impacto:** Protege cuentas corporativas que almacenan información contractual sensible, confidencial o financiera de las empresas.

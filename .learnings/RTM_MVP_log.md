# Registro de Decisiones de Diseño: MVP de Revisión Técnico Mecánica (RTM)

## 🗂️ Fase 1: Inicialización y Modelado de Datos

### 1. Inicialización de Next.js (Bypass de Restricción npm)
- **Decisión:** Se intentó inicializar la aplicación con `create-next-app` directamente en la raíz de la carpeta de trabajo `CDA`. Sin embargo, esto falló debido a que el instalador de npm restringe las mayúsculas en el nombre del paquete.
- **Solución:** Se inicializó la aplicación Next.js en un subdirectorio con nombre en minúsculas `cda-app` empleando la bandera `--yes` en modo no interactivo. Posteriormente, se movieron todos los archivos (incluyendo ficheros ocultos y de configuración) al directorio raíz de la carpeta de trabajo y se eliminó la carpeta temporal vacía.

### 2. Configuración y Migración de Prisma v7
- **Decisión:** Al emplear Prisma v7, nos encontramos con dos cambios de arquitectura críticos (arquitectura libre de Rust/Wasm):
  1. La directiva `url` dentro del bloque `datasource db` en `schema.prisma` está deprecada y no se admite a nivel de esquema en esta versión. Se trasladó enteramente la configuración de base de datos a `prisma.config.ts`.
  2. La instanciación del cliente de Prisma (`PrismaClient`) requiere explícitamente un **driver adapter** para conectores locales como SQLite.
- **Solución:**
  - Se instalaron `better-sqlite3` y `@prisma/adapter-better-sqlite3`.
  - Se configuró la semilla utilizando el nuevo estándar de `prisma.config.ts` (`migrations.seed = 'npx tsx prisma/seed.ts'`).
  - Se instanció el cliente Prisma con el adaptador `PrismaBetterSqlite3` pasando un objeto de configuración con la propiedad `url: 'file:./dev.db'`.

### 3. Modelado de Datos de Negocio (Ley 769 de 2002)
- **Modelos implementados:**
  - **User:** Administra el login del personal técnico. Tiene control de intentos y estado de bloqueo.
  - **Propietario:** Estrictamente **5 atributos principales**: `idPropietario` (cédula), `nombre`, `telefono`, `correo`, `direccion`.
  - **Vehiculo:** Estrictamente **5 atributos principales**: `placa`, `tipo` (Carro/Moto), `marca`, `modelo`, `color`, más la clave foránea `idPropietario`.
  - **Cita:** Permite registrar la solicitud vinculando la placa del vehículo. Guarda estado como 'Asignada' o 'Rechazada por Deuda'.

### 4. Simulación de Deudas Externas (Gobernación y Tránsito)
- **Decisión:** En consonancia con la respuesta alineada en el `/grill-me`, se implementó un módulo estático TypeScript (`lib/externalDebts.ts`) que emula la consulta API externa a los servidores del SIMIT / Gobernación de Antioquia.
- **Datos iniciales (morosos):** Placas `'XMA15G'` y `'AAA123'` marcadas con deudas activas en la semilla para comprobación del motor de citas.

---

## 🔐 Fase 2: Módulo de Iniciar Sesión (Autenticación & UX Writing)

### 1. Definición de Tipos Estrictos (`types/index.ts`)
- **Decisión:** En concordancia con la skill `typescript-expert`, se definieron interfaces estrictas e inmutables (`readonly`) para todas las entidades (`User`, `Propietario`, `Vehiculo`, `Cita`) y DTOs de transferencia de datos de formularios. Se prohibió el uso de `any` para garantizar la robustez del compilador.

### 2. Control de Intentos y Lógica de Bloqueo (`services/authService.ts`)
- **Decisión:** Se implementó el control estricto de intentos de login a nivel de base de datos.
  - Al ingresar credenciales correctas, el contador de intentos fallidos vuelve a `0`.
  - Al fallar el ingreso, se incrementa `intentos` en 1.
  - Al llegar al tercer intento fallido consecutivo (`intentos === 3`), el campo `bloqueado` de la cuenta de usuario se establece en `true` y se rechaza la autenticación de forma inmediata.
  - Las contraseñas se gestionan con cifrado `bcryptjs`.

### 3. API Routes y Manejo de Sesión (`app/api/auth/login`)
- **Decisión:** Se creó el endpoint de autenticación que expone la lógica pura de negocio del servicio. Para el manejo de sesión en el MVP, se optó por configurar una cookie HTTP-only segura (`session_user`) persistente durante 2 horas. El cierre de sesión se maneja en el endpoint `/api/auth/logout` borrando dicha cookie.

### 4. Middleware de Redirección y Protección
- **Decisión:** Se implementó un middleware nativo de Next.js (`middleware.ts`) que intercepta las peticiones.
  - Redirige al login (`/`) si se intenta entrar a las pantallas del dashboard sin una sesión activa.
  - Redirige directamente al panel (`/dashboard/registro`) si se intenta entrar al login (`/`) teniendo una sesión activa en las cookies.

### 5. UI con Aplicación de la Skill de UX Writing (`app/page.tsx`)
- **Decisión:** Se construyó una interfaz premium con Tailwind utilizando clases profesionales y modernos gradientes estéticos.
- **Aplicación de UX Writing:** En caso de bloqueo de cuenta, el sistema muestra una tarjeta de error crítica en color rojo `#EF4444` explicando con empatía que la cuenta ha sido congelada por seguridad debido a los 3 intentos erróneos, bloqueando y deshabilitando completamente el formulario y los botones de envío en el cliente.

---

## 📋 Fase 3: Módulo de Registro (Propietarios & Vehículos)

### 1. Interfaz Unificada de Pestañas (Tabbed UI)
- **Decisión:** Para simplificar el flujo de trabajo del operador técnico del CDA, se implementó una interfaz de pestañas que permite conmutar entre el registro de Propietarios y el de Vehículos sin cambiar de página, agilizando el flujo del operador.

### 2. Validación de Integridad Relacional
- **Decisión:** Se protegió la integridad de la base de datos a nivel de frontend y backend. El formulario de vehículos valida en tiempo real y al enviar que la cédula del propietario asociada (`idPropietario`) exista en el sistema. De lo contrario, se despliega una alerta explicativa y se bloquea el envío para evitar errores de clave foránea en SQLite.

### 3. Listados Interactivos en Tiempo Real
- **Decisión:** Se agregaron grillas dinámicas debajo de los formularios para desplegar los propietarios y vehículos registrados. Esto permite una validación visual rápida para el operador y facilita las pruebas inmediatas en el MVP.

---

## 📅 Fase 4: Motor de Agendamiento de Citas (Control de SIMIT & Tránsito)

### 1. Integración con el Servicio de Verificación de Deudas (`lib/externalDebts.ts`)
- **Decisión:** Siguiendo la normativa colombiana de tránsito (Ley 769 de 2002), se diseñó un validador que emula de forma segura una API externa para consultar multas e infracciones de tránsito no pagadas (SIMIT y Gobernación de Antioquia).
- **Control de Restricción:** Si el vehículo ingresado posee multas pendientes (placas simuladas morosas `'XMA15G'` y `'AAA123'`), el motor de citas rechaza de manera inmediata la solicitud guardando el registro de la cita con el estado `Rechazada por Deuda`.

### 2. Alertas Críticas de Control de Tránsito
- **Decisión:** Si el agendamiento es rechazado por deudas, la interfaz despliega una alerta crítica de alto contraste en rojo HSL explicando que el vehículo posee deudas pendientes con tránsito y que el CDA no puede emitir la cita hasta que se resuelva la situación de cartera.

### 3. Buscador Integrado por Placa
- **Decisión:** Se dotó a la vista de un motor de búsqueda rápida que permite filtrar las citas registradas según la placa del vehículo, facilitando la consulta de estados para el operador.

---

## 📊 Fase 5: Motor de Consultas, Filtros y Estadísticas

### 1. Panel de Métricas Clave (KPI Cards)
- **Decisión:** Se implementó una hilera de tarjetas de estadísticas de alto valor estético para resumir el estado operacional del CDA en tiempo real:
  - Propietarios Registrados.
  - Vehículos en Base de Datos.
  - Citas Agendadas Exitosamente.
  - Citas Rechazadas por Multas.

### 2. Filtros Avanzados de Búsqueda
- **Decisión:** Para garantizar que el operador pueda auditar las operaciones, se implementó un motor de filtrado multi-criterio que combina placa, cédula del propietario, rango de fechas y estado de la cita, refrescando de forma reactiva el grid de resultados.

---

## 🎨 Fase 6: Estandarización de Componentes de UI Modulares (Clean UI Standard)

### 1. Refactorización a una Biblioteca Interna de Componentes Premium (`components/ui`)
- **Decisión:** Con el objetivo de eliminar duplicación de estilos y código espagueti en las vistas del cliente, se aislaron cuatro componentes de interfaz reutilizables con tipado estricto (`TypeScript` estricto, sin `any`):
  - **Alert.tsx:** Control de alertas con 5 variantes estéticas (`info`, `success`, `warning`, `error`, `critical`) con colores HSL calculados y animaciones de entrada (`animate-fade-in`).
  - **Button.tsx:** Botón premium con gradiente azul-emerald, control de estado `loading` con spinner SVG y deshabilitado por dependencias del formulario.
  - **Input.tsx:** Campo de formulario unificado que maneja dinámicamente inputs de texto y selectores (select) mapeando opciones dinámicas, etiquetas en mayúsculas, asteriscos de obligatoriedad y textos de ayuda.
  - **Card.tsx:** Panel contenedor glassmórfico de alta fidelidad visual con bordes difuminados y sombras profundas.

### 2. Aseguramiento de Tipos y Cumplimiento de Lints (ESLint & TSC)
- **Decisión:** Se realizaron optimizaciones profundas para cumplir con las directrices más estrictas de TypeScript 5 y ESLint de React 19:
  - Eliminación completa de castings `as any`, reemplazándolos por tipos exactos (`TipoVehiculo`, `'Carro' | 'Moto'`).
  - Resolución de advertencias de ciclo de vida (`react-hooks/set-state-in-effect`) difiriendo la actualización de estados de renderizado inicial mediante `setTimeout` no bloqueante de 0 ms.
  - Reordenación de declaraciones en la capa de componentes para evitar uso de variables antes de su declaración (Temporal Dead Zone).


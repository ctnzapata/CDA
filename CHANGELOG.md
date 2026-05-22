# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-05-22

### Adicionado
- **Módulo de Autenticación Seguro**:
  - Hash de contraseñas de administrador con `bcryptjs`.
  - Control riguroso de 3 intentos fallidos consecutivos con bloqueo temporal de cuenta guardado en la base de datos local SQLite y reflejado en el `localStorage` del navegador.
  - Gestión de sesión mediante cookies seguras HTTP-only y protección/redirección de rutas mediante Next.js Middleware (`middleware.ts`).
- **Módulo de Registro de Datos RTM**:
  - Interfaz unificada con pestañas (Tabs) interactivas para Propietarios y Vehículos.
  - Validación de integridad relacional que bloquea el registro de un vehículo si el ID del propietario no existe en la base de datos.
  - Grillas interactivas en tiempo real para visualizar los registros.
- **Motor de Solicitud de Citas con Control SIMIT (Ley 769 de 2002)**:
  - Formulario dinámico de solicitud de citas.
  - Simulación estática de deudas de tránsito externas (SIMIT / Gobernación de Antioquia) con placas morosas de prueba (`'XMA15G'` y `'AAA123'`).
  - Lógica de rechazo automático inmediato si el vehículo posee multas de tránsito pendientes, registrando el estado como `Rechazada por Deuda`.
  - Buscador reactivo de citas por número de placa.
- **Módulo de Consultas y Reportes Operativos**:
  - Panel KPI con tarjetas de métricas sobre propietarios, vehículos, citas exitosas y tasa de rechazo.
  - Buscador multicriterio integrado (filtrado por placa, cédula de propietario, rango de fechas y estado).
  - Tabla interactiva optimizada para la visualización de resultados históricos.
- **Biblioteca Estándar de Componentes de Interfaz Premium (`components/ui`)**:
  - `Alert.tsx`: Alertas con soporte para 5 variantes (`info`, `success`, `warning`, `error`, `critical`) con SVG dedicados y animaciones HSL.
  - `Button.tsx`: Botones con gradientes premium Slate/Blue/Emerald, soporte de deshabilitación y spinner de estado `loading` reactivo.
  - `Input.tsx`: Campo unificado que maneja dinámicamente cuadros de texto y selectores (select) con mapeo dinámico de opciones, obligatoriedad e indicaciones de ayuda.
  - `Card.tsx`: Paneles glassmórficos con desenfoque de fondo y sombras profundas.

### Modificado
- **Refactorización de Vistas del Dashboard**:
  - Se sustituyeron las implementaciones duplicadas de formularios, inputs, botones y alertas de las pantallas por las nuevas versiones de los componentes estandarizados.
  - Estructuración estética en tonos oscuros profesionales y tipografías premium alineadas a los requisitos del diseño.
- **Alineación de Lints y Ciclo de Vida (React 19 / TypeScript 5)**:
  - Se reordenaron las funciones asíncronas en `app/dashboard/registro/page.tsx` para evitar accesos de variables antes de su declaración (Temporal Dead Zone).
  - Se resolvieron las advertencias `react-hooks/set-state-in-effect` envolviendo las actualizaciones de estado síncronas iniciales en efectos mediante `setTimeout` diferidos de 0 ms.
  - Se eliminaron las importaciones y variables huérfanas en el Layout principal.

### Seguridad
- Cifrado seguro de contraseñas de administrador en el seed y en base de datos.
- Cookies HTTP-only seguras que protegen la sesión contra ataques XSS.
- Bloqueo empático e inhabilitación total de inputs de login en el cliente tras 3 fallos consecutivos.

---

[1.0.0]: https://github.com/ctnzapata/CDA/releases/tag/v1.0.0

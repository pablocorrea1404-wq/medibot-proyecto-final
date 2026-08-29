# 4. Diseño y Arquitectura

## 4.1 Arquitectura de Microservicios
MediBot utiliza una arquitectura basada en contenedores gestionados por Docker Compose. Cada componente es independiente, lo que permite escalabilidad y facilidad de mantenimiento.

- **Frontend**: Aplicación SPA (Single Page Application) construida con React y Vite.
- **Backend API**: Núcleo del sistema construido con Symfony y API Platform.
- **Base de Datos**: MariaDB para persistencia de datos relacionales.
- **Gestor de BD**: phpMyAdmin para administración visual.
- **Motor de Orquestación y Automatización**: n8n, que actúa como puente entre la API, el Agente de IA (GPT-4) y servicios externos (Google Calendar, Telegram).

## 4.2 Modelo de Datos (ER)
El corazón de MediBot es su base de datos relacional. Las entidades principales y sus relaciones son:

### Entidades Core:
1. **Patient (Paciente)**: Almacena información personal, contacto y DNI. Relacionado 1:N con citas y registros médicos.
2. **Staff (Personal)**: Médicos y recepcionistas. Incluye nombre, email y especialidad.
3. **Appointment (Cita)**: Entidad central que vincula a un paciente con un profesional en una fecha y hora determinada. Contiene el estado (pendiente, confirmada, cancelada).

### Entidades Avanzadas:
4. **DentalRecord & MedicalRecord**: Historias clínicas detalladas asociadas a cada paciente.
5. **TreatmentPlan**: Pautas de tratamiento propuestas por el médico.
6. **Payment**: Registro de transacciones vinculadas a tratamientos.
7. **StockItem**: Gestión de inventario de la clínica (guantes, mascarillas, resinas, etc.).

## 4.3 Diseño de la API REST
La API sigue los principios de diseño de API Platform:
- **Formatos**: Soporte para JSON-LD, JSON y HTML.
- **Paginación**: Implementada en todos los listados de recursos.
- **Validación**: Uso de Assertions de Symfony para asegurar la calidad de los datos de entrada.
- **Endpoints Autogenerados**: CRUD completo para todas las entidades principales.
- **Controladores Custom**: Rutas específicas para lógica de negocio compleja, como el cálculo de disponibilidad horaria (`GET /api/availability`).

## 4.4 Flujo de Información del Agente de IA
1. El Agente recibe un mensaje en lenguaje natural.
2. Identifica si necesita información externa (herramientas).
3. Realiza una petición `GET` a la API de MediBot.
4. Con los datos obtenidos, razona y ejecuta una acción (`POST` a la API para crear cita).
5. Notifica al usuario el resultado final.

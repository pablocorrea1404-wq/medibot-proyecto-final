# 🏥 MediBot: Sistema Integral de Gestión de Clínicas con IA
## Trabajo de Fin de Grado (TFG) - MEMORIA COMPLETA

**Especialidad**: Desarrollo de Aplicaciones Web (DAW) / Desarrollo de Aplicaciones Multiplataforma (DAM)  
**Autor**: Pablo Correa  
**Fecha de Entrega**: 8 de Diciembre  
**Año**: 2026

---

# 📝 RESUMEN / ABSTRACT

**Español**:
MediBot es una solución integral para la gestión de clínicas dentales que combina un backend en Symfony, un frontend en React y un Agente de IA en n8n. El proyecto automatiza la gestión de citas mediante un bot de Telegram inteligente capaz de razonar y ejecutar acciones sobre una base de datos real. Además, incluye módulos de historia clínica, odontograma interactivo, gestión de stock y facturación, todo desplegado en una arquitectura de microservicios con Docker. El sistema destaca por su enfoque en la experiencia de usuario y la ciberseguridad, implementando roles de acceso y protección de datos médicos.

**English**:
MediBot is an end-to-end management solution for dental clinics, combining a Symfony backend, a React frontend, and an AI Agent on n8n. The project automates appointment management through an intelligent Telegram bot capable of reasoning and executing actions on a real database. It also features clinical history modules, an interactive odontogram, stock management, and billing, all deployed within a Docker-based microservices architecture. The system stands out for its focus on user experience and cybersecurity, implementing access roles and medical data protection.

---

# 📋 ÍNDICE GENERAL

1. [Introducción](#1-introducción)
2. [Análisis y Requisitos (Casos de Uso)](#2-análisis-y-requisitos)
3. [Estado del Arte](#3-estado-del-arte)
4. [Diseño Detallado de la Base de Datos](#4-diseño-de-la-base-de-datos)
5. [Diseño y Arquitectura del Sistema](#5-diseño-y-arquitectura-del-sistema)
6. [Tecnologías y Seguridad](#6-tecnologías-y-seguridad)
7. [Implementación del Backend](#7-implementación-del-backend)
8. [Implementación del Frontend](#8-implementación-del-frontend)
9. [Automatización y Agente de IA](#9-automatización-y-agente-de-ia)
10. [Infraestructura y Docker](#10-infraestructura-y-docker)
11. [Planificación y Presupuesto](#11-planificación-y-presupuesto)
12. [Aspectos Legales y Éticos](#12-aspectos-legales-y-éticos)
13. [Manual de Usuario](#13-manual-de-usuario)
14. [Conclusiones y Trabajo Futuro](#14-conclusiones-y-trabajo-futuro)
15. [Bibliografía y Glosario](#15-bibliografía)
16. [Anexo: Guía de Capturas de Pantalla](#16-anexo-guía-de-capturas-de-pantalla)

---

# 1. INTRODUCCIÓN

## 1.1 Motivación
En el sector de la salud, la gestión eficiente del tiempo es fundamental. La mayoría de los problemas de organización provienen de una gestión de citas fragmentada y la carga administrativa de recepción. MediBot transforma estas clínicas permitiendo que el personal se centre en la atención médica mientras un sistema inteligente gestiona las tareas administrativas.

---

# 2. ANÁLISIS Y REQUISITOS (CASOS DE USO)

## 2.1 Casos de Uso Críticos

### 🔴 CU: Cancelación Automática vía Bot
El paciente escribe "No puedo ir mañana". El Agente de IA identifica la cita del usuario, pide confirmación y realiza un `PATCH` a la API para cambiar el estado a `cancelled`. Esto libera el hueco en el calendario web de la clínica al instante, permitiendo que otro paciente ocupe ese lugar.

### 🦷 CU: Odontograma Interactivo
El doctor selecciona una pieza dental en el esquema visual. El sistema permite marcar patologías (caries, ausencia, prótesis) que se guardan mediante peticiones `POST` a `/api/dental_records`. El frontend refleja los cambios visualmente mediante códigos de colores CSS en tiempo real.

---

# 4. DISEÑO DETALLADO DE LA BASE DE DATOS

## 4.1 Tablas y Campos Principales
- **`patient`**: Identificación (dni, name, email).
- **`dental_record`**: Historial dental por pieza (`tooth_number`, `status`, `notes`).
- **`appointment`**: Agenda (`date`, `status`, `notes_ia`).
- **`medical_service`**: Catálogo (`name`, `price`, `duration`).
- **`treatment_plan`**: Presupuestos (JSON `items`, `final_amount`).
- **`stock_item`**: Almacén (`quantity`, `min_threshold`).

---

# 6. TECNOLOGÍAS Y SEGURIDAD

### 🔐 Seguridad Multicapa
- **Backend**: Autenticación **JWT** y control de acceso por **Roles** (Role-Based Access Control). Los recepcionistas no pueden acceder a informes financieros ni borrar pacientes.
- **Frontend**: Protección activa contra **XSS** mediante el escape automático de React y sanitización de datos.
- **CORS**: Configuración restrictiva para permitir peticiones solo desde el dominio del frontend.
- **IA Segura**: No se envían datos sensibles (DNI o dirección) a la API de OpenAI, solo intenciones de cita.

---

# 10. INFRAESTRUCTURA Y DOCKER

## 10.1 Configuración de Docker Compose
- **Redes**: Red interna aislada `medibot-network` para que la BD no sea accesible desde fuera.
- **Volúmenes**: Persistencia total de datos médicos en `db_data`.
- **Variables de Entorno**: Configuración dinámica de la conexión a base de datos y endpoints de API.

---

# 16. ANEXO: GUÍA DE CAPTURAS DE PANTALLA

1. **Dashboard**: Vista general con estadísticas superiores.
2. **Calendario**: Vista semanal con bloques de colores y modal de registro abierto.
3. **Odontograma**: Perfil del paciente con el gráfico dental marcado.
4. **Chat Telegram**: Conversación natural de reserva de cita.
5. **n8n Workflow**: El diagrama técnico de nodos del Agente de IA.

---
**FIN DE LA MEMORIA - PABLO CORREA 2026**

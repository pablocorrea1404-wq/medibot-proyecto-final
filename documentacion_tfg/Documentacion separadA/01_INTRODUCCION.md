# 1. Introducción

## 1.1 Motivación
En el sector de la salud, y específicamente en las clínicas dentales, la gestión eficiente del tiempo y de los recursos es fundamental. La mayoría de los problemas de organización provienen de una gestión de citas fragmentada, la dificultad de contacto directo 24/7 con los pacientes y la carga administrativa que supone para el personal de recepción.

El avance de la inteligencia artificial y la automatización mediante microservicios ofrece una oportunidad única para transformar estas clínicas en centros más eficientes, permitiendo que el personal se centre en la atención médica mientras que un sistema inteligente gestiona las tareas repetitivas.

## 1.2 Objetivos del Proyecto
El objetivo principal de **MediBot** es desarrollar una plataforma integral para la gestión de clínicas dentales que combine un panel administrativo moderno con una interfaz de atención al paciente automatizada mediante un Agente de IA.

### Objetivos Específicos:
- **Centralizar la gestión**: Crear un backend robusto capaz de manejar pacientes, personal, citas, planes de tratamiento y cobros.
- **Modernizar la interfaz administrativa**: Implementar un frontend en React que permita al personal visualizar y editar la agenda de forma rápida e intuitiva.
- **Automatización de citas**: Implementar un bot de Telegram que, mediante el uso de Agentes de IA (GPT-4), sea capaz de consultar disponibilidad real y agendar citas sin intervención humana.
- **Integración de servicios**: Sincronizar automáticamente las citas con herramientas externas como Google Calendar.
- **Escalabilidad**: Diseñar el sistema bajo una arquitectura de microservicios con Docker para facilitar su despliegue y crecimiento futuro.

## 1.3 Alcance
El proyecto MediBot abarca desde el diseño de la base de datos hasta la creación del Agente de IA. Se han implementado módulos de:
- Gestión de pacientes e historias clínicas digitales.
- Control de personal y sus especialidades.
- Sistema de citas con calendario visual.
- Módulo de facturación y pagos.
- Control de stock y suministros.
- Integración nativa con Telegram bot y n8n.

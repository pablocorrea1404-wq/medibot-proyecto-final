# 8. Automatización y Agente de IA

## 8.1 El Rol de n8n
n8n actúa como el "cerebro" que orquestador de las interacciones externas. Se han implementado dos flujos principales:

### Workflow 1: Agente Recepcionista (Telegram)
Este flujo utiliza el nodo de **Agente de IA** con las siguientes capacidades:
- **Herramienta `check_availability`**: Consulta al backend qué horas hay libres.
- **Herramienta `register_patient`**: Si el usuario es nuevo, pide sus datos y los guarda en la API.
- **Herramienta `book_appointment`**: Confirma la cita en la base de datos de MediBot.

### Workflow 2: Sincronización y Notificaciones
Este flujo se dispara ante la creación de cualquier cita:
1. **Google Calendar**: Crea un evento compartido para la clínica.
2. **Email**: Envía una confirmación formal al paciente mediante SMTP.
3. **Análisis con IA**: Envía el motivo de la consulta a GPT-4 para que genere un "resumen clínico" automático que el médico leerá antes de atender al paciente.

## 8.2 Configuración del Agente de IA
Se ha dotado al agente de un "System Prompt" que define su personalidad: un asistente amable, eficiente y que nunca inventa horarios, siempre los consulta.

**Ejemplo de razonamiento (Chain of Thought):**
- *Usuario*: "¿Tenéis sitio mañana por la tarde?"
- *Agente*: "Necesito consultar disponibilidad para el día [mañana]. Llamaré a `check_availability`."
- *Resultado Herramienta*: "[16:00, 17:00, 19:00]"
- *Respuesta*: "Sí, tenemos huecos a las 16:00, 17:00 y 19:00. ¿Cuál te viene mejor?"

## 8.3 Beneficios del uso de IA
- **Escalabilidad**: Puede atender a cientos de personas simultáneamente.
- **Reducción de Errores**: Al estar conectado a la API real, no hay posibilidad de citas duplicadas o fuera de horario.
- **Mejora del Servicio**: El paciente siente que tiene una respuesta inmediata a cualquier hora del día.

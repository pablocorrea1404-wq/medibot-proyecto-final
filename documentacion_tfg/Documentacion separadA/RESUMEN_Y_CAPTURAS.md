# 📸 Guía Detallada para Capturas de Pantalla

*Esta guía describe qué debe aparecer en cada captura para que el evaluador comprenda visualmente la potencia del sistema.*

### 🛠️ Captura 1: El Centro de Mando (Frontend Dashboard)
- **Qué capturar**: La vista principal (`http://localhost:5173`).
- **Detalle clave**: Asegúrate de que se vean las tarjetas superiores con estadísticas (Ej: "12 Citas Hoy", "5 Pacientes Nuevos"). A la izquierda el menú de navegación y a la derecha una lista de las próximas 3 citas del día para dar sensación de "proyecto vivo".

### 📅 Captura 2: Gestión de Agenda (Calendario)
- **Qué capturar**: La pestaña "Calendario".
- **Detalle clave**: Debe mostrarse una cuadrícula semanal con al menos 4 o 5 bloques de colores (citas agendadas). Abre un modal de "Nueva Cita" sobre el calendario para que se vea el formulario de selección de paciente y médico, demostrando la interactividad.

### 🦷 Captura 3: Odontograma e Historial
- **Qué capturar**: La vista de detalle de un paciente específico.
- **Detalle clave**: Es la joya tecnológica del frontend. Se debe ver el esquema de la dentadura con algunos dientes marcados en colores (rojo para caries, azul para obturación). En el lateral se debe apreciar el log de tratamientos realizados.

### 🤖 Captura 4: El Agente Recepcionista (Telegram)
- **Qué capturar**: Una captura de pantalla de la app de Telegram (móvil o desktop).
- **Detalle clave**: La conversación debe fluir:
    - Paciente: "Hola, ¿mañana hay algún hueco?"
    - Bot: "Hola Juan, consultando... sí, tengo a las 11:00 y a las 17:00. ¿Cuál prefieres?"
    - Paciente: "Las 11:00 está perfecto".
    - Bot: "✅ Cita confirmada".

### 🧠 Captura 5: Orquestación Técnica (n8n Workflow)
- **Qué capturar**: El panel de n8n (`http://localhost:5679`).
- **Detalle clave**: El workflow de `n8n_telegram_bot.json` desplegado. Debe verse claramente el nodo del **"AI Agent"** conectado a los nodos de **"HTTP Request"** (que son las herramientas que llaman a tu API). Esto demuestra que hay una ingeniería compleja detrás del bot.

---
*💡 Consejo de Presentación: Añade debajo de cada captura un breve pie de foto explicando qué tecnología se está utilizando en esa vista específica (ej: "Renderizado reactivo con React.js" o "Llamada a función via GPT-4").*

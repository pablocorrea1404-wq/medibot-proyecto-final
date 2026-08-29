# 2. Análisis y Requisitos (Casos de Uso Detallados)

## 2.4 Casos de Uso Detallados

### 🟢 CU-01: Agendamiento Inteligente vía Bot
1. El **Paciente** escribe por Telegram: "Quiero cita mañana por la tarde".
2. El **AI Agent** detecta la intención y extrae la fecha relativa.
3. El sistema llama a la herramienta `consultar_disponibilidad`.
4. El Agente presenta 3 opciones libres.
5. El Paciente elige una y proporciona sus datos.
6. El sistema crea el registro en `patient` y `appointment` (status: pending).
7. Se dispara automáticamente un webhook a n8n para crear el evento en **Google Calendar**.

### 🔴 CU-02: Cancelación de Cita por el Bot
1. El **Paciente** escribe: "Hola, no puedo ir a mi cita de mañana, la cancelo".
2. El **AI Agent** busca las citas activas vinculadas al nombre/teléfono del usuario.
3. Si encuentra la cita, pide confirmación previa: "¿Confirmas que quieres cancelar la cita del 25 de marzo a las 16:00?".
4. Tras el "Sí", el Agente realiza un `PATCH` a `/api/appointments/{id}` cambiando el `status` a `cancelled`.
5. El sistema libera el hueco en la agenda web inmediatamente y envía un aviso por email a la clínica.

### 🦷 CU-03: Guardado en Odontograma Interactivo
1. El **Doctor** abre el perfil del paciente y selecciona un diente en el gráfico (ej: Diente 14).
2. Se abre un panel lateral donde selecciona "Caries" en la superficie "Oclusal".
3. Al pulsar "Guardar", el Frontend de React realiza una petición `POST` a `/api/dental_records`.
4. El **Backend** recibe el `toothNumber`, `status` y `patient_id`.
5. Se guarda el registro y el componente React se refresca automáticamente, cambiando el color del diente en el esquema visual mediante una clase CSS dinámica basada en el estado (`status-caries`).

## 2.5 Requisitos de Seguridad Avanzados
- **Integridad**: Ninguna cita puede ser borrada físicamente (Soft Delete), solo cambiada de estado para mantener trazabilidad médica.
- **Validación Cruzada**: El sistema impide agendar una cita si el médico seleccionado ya tiene otra en ese mismo intervalo de tiempo (Validación a nivel de servicios de Symfony).

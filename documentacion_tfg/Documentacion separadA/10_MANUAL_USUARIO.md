# 10. Manual de Usuario

## 10.1 Panel Administrativo (Web)
1. **Acceso**: Abrir `http://localhost:5173`.
2. **Dashboard**: Observe el resumen diario de pacientes y citas.
3. **Gestión de Agenda**:
   - Haga clic en un hueco vacío del calendario para crear una cita.
   - Busque un paciente existente o cree uno nuevo en el momento.
4. **Historial Médico**:
   - Acceda a la pestaña "Pacientes".
   - Seleccione un nombre para ver el odontograma y los tratamientos realizados.

## 10.2 Uso del Bot (Paciente)
1. Buscar el bot por su nombre de usuario en Telegram (ej: `@MediBotClinic`).
2. Pulsar **/start**.
3. **Solicitar Cita**: Escriba "Quiero una limpieza dental para el miércoles".
4. **Proporcionar Datos**: Siga las instrucciones del bot si es su primera vez (Nombre, Email, Teléfono).
5. **Confirmación**: El bot le indicará que la cita ha sido agendada con éxito.

## 10.3 Gestión Técnica
- **Control de BD**: Acceda a `http://localhost:8080` (phpMyAdmin) para realizar limpiezas manuales o backups de datos.
- **Logs**: En caso de error, revise los logs de servicios con `docker-compose logs -f`.

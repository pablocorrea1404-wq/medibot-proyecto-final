# 5. Tecnologías y Seguridad

## 5.5 Medidas de Seguridad Implementadas

### A. Seguridad en el Backend (Symfony)
- **Autenticación JWT (JSON Web Token)**: Todas las peticiones a la API desde el Frontend requieren un token válido en el Header Authorization.
- **Validación de Roles (RBAC)**: Uso de atributos de seguridad de Symfony (`#[IsGranted('ROLE_ADMIN')]`). Los recepcionistas pueden ver la agenda, pero solo los administradores pueden borrar registros o ver informes financieros.
- **Protección contra Inyección SQL**: El uso de Doctrine ORM con sentencias preparadas elimina prácticamente el riesgo de inyecciones SQL.
- **CORS Limited**: La API solo acepta peticiones desde dominios autorizados (el puerto del frontend), evitando ataques desde sitios de terceros.

### B. Seguridad en el Frontend (React)
- **Protección contra XSS**: React escapa automáticamente cualquier contenido insertado en el DOM. Además, se utiliza `dangerouslySetInnerHTML` únicamente donde es estrictamente necesario y con sanitización previa.
- **Sanitización de Inputs**: Validación rigurosa de tipos de datos en el lado del cliente antes de enviar cualquier JSON al servidor.
- **Manejo de Sesiones Seguro**: El token JWT se almacena preferiblemente en `HttpOnly Cookies` o en variables de estado de corta duración para evitar el robo de identidad vía scripts maliciosos.

### C. Seguridad en la Integración con IA
- **Entorno Aislado**: El n8n funciona en su propia red de Docker.
- **Filtrado de Datos Sensibles**: El Agente de IA solo maneja nombres y motivos de cita; los datos clínicos profundos (diagnósticos detallados) nunca se envían a la API de OpenAI para preservar la absoluta confidencialidad del paciente.

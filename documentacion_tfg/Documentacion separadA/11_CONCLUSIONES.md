# 11. Conclusiones y Trabajo Futuro

## 11.1 Conclusiones
El desarrollo de MediBot ha demostrado ser un ejercicio completo de integración de tecnologías modernas. Se ha logrado:
- Un sistema de gestión **sólido y funcional**.
- Una **reducción drástica de la intervención humana** en el agendamiento de citas gracias al Agente de IA.
- Una arquitectura **portátil y escalable** mediante Docker.

A nivel personal, este proyecto ha permitido profundizar en el manejo de Symfony API Platform y entender los retos que supone conectar un modelo de lenguaje (IA) con datos estructurados de una base de datos real.

## 11.2 Limitaciones Actuales
- **Pagos**: Actualmente el sistema registra cobros pero no está integrado con pasarelas reales como Stripe o PayPal.
- **Multi-clínica**: El sistema está diseñado para una sola sede con varios especialistas.

## 11.3 Trabajo Futuro
1. **Integración con WhatsApp**: Expandir el Agente de IA para que también pueda contestar a pacientes vía WhatsApp Business API.
2. **Módulo de Analítica**: Implementar gráficos de tendencias (ej: especialidades más demandadas, crecimiento de ingresos mensual).
3. **APP Móvil Nativa**: Desarrollar una versión específica para pacientes que incluya notificaciones push para recordatorios de citas.
4. **Multitenancy**: Permitir que varias clínicas compartan la infraestructura pero con datos totalmente aislados.

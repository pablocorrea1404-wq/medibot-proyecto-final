# 3. Estado del Arte

## 3.1 Evolución de los CRM Médicos
Tradicionalmente, la gestión de clínicas se realizaba mediante software de escritorio cerrado o incluso libros de citas físicos. Con la llegada de la web 2.0, surgieron soluciones Cloud (SaaS), pero la mayoría seguían siendo reactivas: el usuario debía hacer todo el trabajo.

Actualmente, estamos en la era de la **gestión proactiva e inteligente**, donde el software no solo almacena datos, sino que realiza acciones de forma autónoma.

## 3.2 Tecnologías Dominantes
En el desarrollo actual, destacan varias corrientes que se han aplicado en MediBot:
- **Arquitectura de Microservicios**: Frente al monolito tradicional, permite desacoplar la base de datos, el backend, el frontend y las herramientas de automatización.
- **API-First Design**: La API no es un accesorio, sino el núcleo del sistema al que se conectan tanto la aplicación React como el Agente de IA en n8n.
- **Agentes de IA y Function Calling**: A diferencia de los chatbots basados en reglas (si dice "cita" -> responde "llamanos"), MediBot utiliza "Function Calling" (Llamada a Funciones). Esto permite que un LLM (como GPT-4) decida en tiempo real que necesita ejecutar una consulta a una API específica para obtener datos, procesarlos y devolver una respuesta veraz.

## 3.3 Comparativa de Soluciones
Existen grandes plataformas como *Doctoralia* o *ClinicCloud*. Sin embargo, estas suelen tener costes elevados por licencia y poca capacidad de personalización en la automatización con IA.
MediBot propone una alternativa basada en software moderno (Symfony/React) y automatización flexible (n8n), lo que reduce costes operativos y permite una integración profunda con mensajería instantánea (Telegram/WhatsApp).

## 3.4 Justificación de la Elección Tecnológica
1. **Symfony (PHP)**: Elegido por su madurez, seguridad y el excelente soporte de **API Platform**, que permite generar una API estándar en tiempo récord.
2. **React (Javascript)**: El estándar de la industria para crear interfaces de usuario rápidas que se comportan como aplicaciones móviles.
3. **Docker**: Fundamental para asegurar que el proyecto se pueda desplegar sin problemas de compatibilidad de versiones de PHP o bases de datos ("en mi máquina funciona").
4. **n8n**: Permite orquestar flujos complejos (IA, Google Calendar, Telegram) visualmente, facilitando el mantenimiento y la evolución del sistema.

# 9. Infraestructura y Despliegue (Docker Detail)

## 9.5 Detalles del Orquestador (docker-compose.yml)

El despliegue se basa en una configuración optimizada de contenedores que asegura la comunicación segura y persistencia de los datos.

### 🌐 Redes Internas
Se ha definido una red puente denominada `medibot-network`.
- **Backend y BD**: Se comunican exclusivamente por esta red interna. La base de datos no expone puertos al exterior, evitando ataques de fuerza bruta.
- **Frontend**: Actúa como punto de entrada para el usuario, comunicándose con el backend a través del host bridge.

### 💾 Volúmenes Definidos
Se utilizan volúmenes con nombre para asegurar que los datos no se pierdan al reiniciar contenedores:
- `db_data`: Persistencia de todos los registros de MariaDB.
- `n8n_data`: Almacena la base de datos de workflows y credenciales de n8n.
- Los archivos del proyecto se montan como "Bind Mounts" en el entorno de desarrollo para permitir cambios en tiempo real.

### 🔑 Variables de Entorno Clave
- `DATABASE_URL`: Cadena de conexión interna (`mysql://user:password@db:3306/medibot`).
- `VITE_API_BASE_URL`: URL que el frontend usa para localizar la API (ajustable según el entorno de despliegue).
- `N8N_HOST` / `WEBHOOK_URL`: Configuración crítica para que Telegram pueda enviar mensajes a n8n.

### 🐳 Aislamiento de Servicios
Cada servicio corre con el usuario mínimo necesario. Por ejemplo, el contenedor de n8n no se ejecuta como `root` por seguridad, sino que utiliza el usuario interno `node` del contenedor oficial.

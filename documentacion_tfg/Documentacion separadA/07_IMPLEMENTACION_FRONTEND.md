# 7. Implementación del Frontend

## 7.1 Diseño Visual y UX
El dashboard de MediBot ha sido diseñado priorizando la claridad y la rapidez de uso. Se utiliza un esquema de colores "limpio" (azules médicos y blancos) con elementos de respuesta visual inmediata.

## 7.2 Componentes React Destacados
- **AppointmentCalendar**: Componente que renderiza una cuadrícula de horas. Permite arrastrar para crear citas o hacer clic para ver detalles. Consume datos de `/api/appointments`.
- **Dashboard**: Vista principal con estadísticas en tiempo real (citas de hoy, nuevos pacientes, stock bajo).
- **PatientHistoryModal**: Un componente complejo que aglutina toda la información de un paciente: datos personales, lista de tratamientos previos, archivos de consentimiento y cobros asociados.
- **Odontogram**: Representación interactiva de la dentadura que permite a los dentistas marcar afecciones en piezas específicas simplemente haciendo clic sobre ellas.

## 7.3 Comunicación con el Servidor
Se ha encapsulado la lógica de peticiones en un manejador centralizado que:
1. Añade los headers necesarios.
2. Gestiona los errores de red.
3. Parsea las respuestas JSON-LD habituales de Symfony.

```javascript
const fetchPatients = async () => {
  const response = await fetch(`${API_URL}/api/patients`);
  const data = await response.json();
  setPatients(data['hydra:member']); // Formato estándar de API Platform
};
```

## 7.4 Responsive Design
Mediante el uso de CSS Grid y Media Queries, el panel administrativo es perfectamente usable tanto en monitores de escritorio (usados en recepción) como en tablets (usadas por los médicos dentro de los boxes).

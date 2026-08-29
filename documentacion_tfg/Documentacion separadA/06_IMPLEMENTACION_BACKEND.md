# 6. Implementación del Backend

## 6.1 Estructura del Proyecto Symfony
El código del servidor se organiza siguiendo el estándar de Symfony:
- `src/Entity/`: Definición de los modelos de datos y sus reglas de validación.
- `src/Controller/`: Controladores para endpoints que requieren lógica personalizada (ej: `/api/availability`).
- `src/Repository/`: Consultas personalizadas a la base de datos (ej: buscar huecos libres).

## 6.2 Definición de Entidades
Un ejemplo clave es la entidad `Appointment`:
```php
#[ORM\Entity(repositoryClass: AppointmentRepository::class)]
#[ApiResource]
class Appointment
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'appointments')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Patient $patient = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $appointmentDate = null;
    
    // ... otros campos como status, staff, notes_ia
}
```
API Platform detecta estas clases y genera automáticamente la interfaz de documentación en `/api`.

## 6.3 Lógica de Disponibilidad
Se ha implementado un servicio que calcula los huecos libres para una fecha dada. La lógica consiste en:
1. Definir un horario de apertura (ej: 09:00 a 20:00).
2. Consultar todas las citas existentes en esa fecha para un médico específico.
3. Restar los intervalos ocupados del horario total.
4. Devolver un array de horas disponibles al Agente de IA o al Frontend.

## 6.4 Conexión con MariaDB
La configuración se gestiona mediante variables de entorno (`.env`), facilitando el cambio de credenciales sin tocar el código fuente. Doctrine se encarga de las migraciones para mantener sincronizado el código PHP con la estructura de tablas.

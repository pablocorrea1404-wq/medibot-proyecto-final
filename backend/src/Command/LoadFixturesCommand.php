<?php

namespace App\Command;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:load-fixtures', description: 'Carga datos de prueba en la base de datos')]
class LoadFixturesCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $conn = $this->em->getConnection();

        // Check if data already exists
        $count = $conn->fetchOne('SELECT COUNT(*) FROM staff');
        if ($count > 0) {
            $output->writeln('Los datos ya existen, saltando...');
            return Command::SUCCESS;
        }

        $output->writeln('Insertando datos de prueba...');

        // Staff
        $staffData = [
            ['Dr. Alberto Ramos', 'Odontología General', 'alberto@medibot.com'],
            ['Dra. Silvia Conde', 'Ortodoncia', 'silvia@medibot.com'],
            ['Dr. Roberto Sanz', 'Implantología', 'roberto@medibot.com'],
            ['Dra. Marta Vidal', 'Odontopediatría', 'marta@medibot.com'],
            ['Dra. Carmen Gil', 'Periodoncia', 'carmen@medibot.com'],
            ['Dr. Javier Soler', 'Cirugía Oral', 'javier@medibot.com'],
            ['Mónica Luque', 'Higienista Dental', 'monica@medibot.com'],
            ['Sara Ibáñez', 'Higienista Dental', 'sara@medibot.com'],
            ['Pablo Correa', 'Director Jefe', 'pablo@medibot.com'],
            ['Elena Blanco', 'Administración', 'elena@medibot.com'],
        ];
        foreach ($staffData as [$name, $specialty, $email]) {
            $conn->executeStatement(
                'INSERT INTO staff (name, specialty, email) VALUES (?, ?, ?)',
                [$name, $specialty, $email]
            );
        }

        // Patients
        $now = (new \DateTime())->format('Y-m-d H:i:s');
        $patients = [
            ['Juan Pérez', 'juan.perez@email.com', '600111222', '11111111A'],
            ['María García', 'maria.garcia@email.com', '600222333', '22222222B'],
            ['Carlos Rodríguez', 'carlos.r@email.com', '600333444', '33333333C'],
            ['Ana Martínez', 'ana.m@email.com', '600444555', '44444444D'],
            ['Luis López', 'luis.l@email.com', '600555666', '55555555E'],
            ['Elena Sánchez', 'elena.s@email.com', '600666777', '66666666F'],
            ['Jorge Ruiz', 'jorge.r@email.com', '600777888', '77777777G'],
            ['Laura Castro', 'laura.c@email.com', '600888999', '88888888H'],
            ['Pedro Jiménez', 'pedro.j@email.com', '600999000', '99999999I'],
            ['Sofía Torres', 'sofia.t@email.com', '600000111', '00000000J'],
        ];
        foreach ($patients as [$name, $email, $phone, $dni]) {
            $conn->executeStatement(
                'INSERT INTO patient (name, email, phone, dni, created_at) VALUES (?, ?, ?, ?, ?)',
                [$name, $email, $phone, $dni, $now]
            );
        }

        // Medical Services
        $services = [
            ['Limpieza Dental', 'Limpieza profunda de sarro y pulido', 50.00, 30],
            ['Empaste Simple', 'Obturación de composite en una cara', 60.00, 45],
            ['Extracción Simple', 'Extracción de pieza dental sin cirugía', 80.00, 30],
            ['Ortodoncia Brackets', 'Tratamiento correctivo mensual', 120.00, 30],
            ['Implante Dental', 'Colocación de pieza de titanio', 800.00, 60],
            ['Blanqueamiento', 'Tratamiento LED en clínica', 250.00, 60],
            ['Revisión General', 'Examen completo y diagnóstico', 0.00, 20],
            ['Endodoncia', 'Tratamiento de conductos', 150.00, 90],
            ['Radiografía Panorámica', 'Imagen completa de la boca', 40.00, 15],
            ['Férula Descarga', 'Tratamiento para bruxismo', 200.00, 45],
        ];
        foreach ($services as [$name, $desc, $price, $duration]) {
            $conn->executeStatement(
                'INSERT INTO medical_service (name, description, price, duration_minutes) VALUES (?, ?, ?, ?)',
                [$name, $desc, $price, $duration]
            );
        }

        // Stock items
        $stock = [
            ['Guantes Nitrilo (Caja 100)', 50, 10],
            ['Mascarillas Quirúrgicas (Caja)', 30, 5],
            ['Agujas Anestesia (Pack)', 25, 5],
            ['Carpules Anestesia (Pack)', 15, 3],
            ['Composite A2 (Jeringa)', 12, 4],
            ['Composite A3 (Jeringa)', 10, 4],
            ['Alginato (Bolsa)', 8, 2],
            ['Escafandras Protección', 15, 5],
            ['Vasos Plástico (Pack 1000)', 5, 2],
            ['Servilletas Paciente (Pack)', 20, 5],
        ];
        foreach ($stock as [$name, $qty, $min]) {
            $conn->executeStatement(
                'INSERT INTO stock_item (name, quantity, min_threshold) VALUES (?, ?, ?)',
                [$name, $qty, $min]
            );
        }

        // Appointments (using future dates for the demo)
        $appointments = [
            [1, 1, 7, '2026-06-01 10:00:00', 'confirmed'],
            [2, 2, 4, '2026-06-01 11:30:00', 'pending'],
            [3, 3, 5, '2026-06-02 16:00:00', 'confirmed'],
            [4, 4, 1, '2026-06-02 09:00:00', 'pending'],
            [5, 5, 8, '2026-06-03 12:00:00', 'confirmed'],
            [6, 6, 3, '2026-06-03 10:30:00', 'confirmed'],
            [7, 7, 1, '2026-06-04 13:00:00', 'pending'],
            [8, 2, 4, '2026-06-04 15:30:00', 'confirmed'],
            [9, 1, 2, '2026-06-05 11:00:00', 'pending'],
            [10, 8, 1, '2026-06-05 17:00:00', 'confirmed'],
        ];
        foreach ($appointments as [$patId, $staffId, $serviceId, $date, $status]) {
            $conn->executeStatement(
                'INSERT INTO appointment (patient_id, staff_id, appointment_date, status, service_id) VALUES (?, ?, ?, ?, ?)',
                [$patId, $staffId, $date, $status, $serviceId]
            );
        }

        $output->writeln('¡Datos de prueba cargados correctamente!');
        return Command::SUCCESS;
    }
}

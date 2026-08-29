<?php

namespace App\Controller;

use App\Repository\AppointmentRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/availability')]
class AvailabilityController extends AbstractController
{
    #[Route('', name: 'app_availability', methods: ['GET'])]
    public function index(Request $request, AppointmentRepository $appointmentRepository): JsonResponse
    {
        $dateParam = $request->query->get('date');
        $staffId = $request->query->get('staffId');

        if (!$dateParam) {
            $dateParam = (new \DateTime())->format('Y-m-d');
        }

        $madrid = new \DateTimeZone('Europe/Madrid');

        try {
            // Interpretar la fecha en hora de Madrid para que los slots 9-17
            // correspondan a la hora real de la clínica, no a UTC del servidor.
            $date = new \DateTime($dateParam, $madrid);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Invalid date format'], 400);
        }

        // Definir horario laboral (hora Madrid)
        $startHour = 9;
        $endHour = 17;
        $slots = [];

        // Rango del día en Madrid convertido a UTC para la consulta a BD
        // (las fechas se almacenan en UTC gracias a la conversión del bot)
        $dayStart = clone $date;
        $dayStart->setTime(0, 0, 0);
        $dayStartUtc = clone $dayStart;
        $dayStartUtc->setTimezone(new \DateTimeZone('UTC'));

        $dayEnd = clone $date;
        $dayEnd->setTime(23, 59, 59);
        $dayEndUtc = clone $dayEnd;
        $dayEndUtc->setTimezone(new \DateTimeZone('UTC'));

        // Query appointments for the day
        $queryBuilder = $appointmentRepository->createQueryBuilder('a')
            ->where('a.appointmentDate BETWEEN :start AND :end')
            ->setParameter('start', $dayStartUtc)
            ->setParameter('end', $dayEndUtc);

        if ($staffId) {
            $queryBuilder->andWhere('a.staff = :staffId')
                ->setParameter('staffId', $staffId);
        }

        $appointments = $queryBuilder->getQuery()->getResult();
        $occupiedSlots = [];
        foreach ($appointments as $apt) {
            // Convertir la fecha UTC almacenada a hora Madrid para comparar con los slots
            $aptMadrid = clone $apt->getAppointmentDate();
            $aptMadrid->setTimezone($madrid);
            $occupiedSlots[] = $aptMadrid->format('H:00');
        }

        for ($i = $startHour; $i < $endHour; $i++) {
            $timeString = sprintf('%02d:00', $i);
            if (!in_array($timeString, $occupiedSlots)) {
                $slots[] = $timeString;
            }
        }

        return $this->json([
            'date' => $date->format('Y-m-d'),
            'staffId' => $staffId,
            'available_slots' => $slots
        ]);
    }
}

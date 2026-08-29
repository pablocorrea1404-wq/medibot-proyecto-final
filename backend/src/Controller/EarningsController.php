<?php

namespace App\Controller;

use App\Entity\Appointment;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class EarningsController extends AbstractController
{
    #[Route('/api/earnings/export', name: 'api_earnings_export', methods: ['GET'])]
    public function export(EntityManagerInterface $em): Response
    {
        try {
            $today = new \DateTime();
            $startOfDay = (clone $today)->setTime(0, 0, 0);
            $endOfDay = (clone $today)->setTime(23, 59, 59);

            $appointments = $em->getRepository(Appointment::class)->createQueryBuilder('a')
                ->where('a.appointmentDate BETWEEN :start AND :end')
                ->setParameter('start', $startOfDay)
                ->setParameter('end', $endOfDay)
                ->getQuery()
                ->getResult();

            $rows = [];
            // Bom for UTF-8 (Excel compatibility correctly)
            $content = "\xEF\xBB\xBF";
            $rows[] = ['ID', 'Fecha', 'Paciente', 'Servicio', 'Precio', 'Estado'];

            $total = 0;
            foreach ($appointments as $app) {
                $price = $app->getService() ? $app->getService()->getPrice() : 0;
                $status = $app->getStatus();
                $isPresented = ($status === 'presentado' || $status === 'confirmed' || $status === 'Completed');

                if ($isPresented) {
                    $total += (float) $price;
                }

                $rows[] = [
                    $app->getId(),
                    $app->getAppointmentDate() ? $app->getAppointmentDate()->format('d/m/Y H:i') : 'N/A',
                    $app->getPatient() ? $app->getPatient()->getName() : 'N/A',
                    $app->getService() ? $app->getService()->getName() : 'General',
                    $price . '€',
                    $status . ($isPresented ? ' (Contabilizado)' : ' (No cobrado)')
                ];
            }

            $rows[] = ['', '', '', 'TOTAL', $total . '€', ''];

            foreach ($rows as $row) {
                // Use semicolon as separator for European Excel
                $content .= implode(';', $row) . "\r\n";
            }

            $response = new Response($content);
            $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
            $response->headers->set('Content-Disposition', 'attachment; filename="ganancias_' . $today->format('Y-m-d') . '.csv"');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', '0');

            return $response;
        } catch (\Exception $e) {
            return new Response("Error al generar CSV: " . $e->getMessage(), 500);
        }
    }
}

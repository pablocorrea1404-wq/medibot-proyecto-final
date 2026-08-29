<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'MediBot Backend is running',
            'api_endpoint' => '/api',
            'status' => 'optimal',
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s')
        ]);
    }
}

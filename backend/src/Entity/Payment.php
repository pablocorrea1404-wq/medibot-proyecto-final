<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['payment:read']],
    denormalizationContext: ['groups' => ['payment:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['patient' => 'exact', 'method' => 'exact'])]
#[ApiFilter(DateFilter::class, properties: ['paymentDate'])]
class Payment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['payment:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['payment:read', 'payment:write'])]
    private ?Patient $patient = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['payment:read', 'payment:write'])]
    private ?TreatmentPlan $treatmentPlan = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['payment:read', 'payment:write'])]
    private ?string $amount = null;

    /** cash, card, transfer, insurance */
    #[ORM\Column(length: 50)]
    #[Groups(['payment:read', 'payment:write'])]
    private ?string $method = 'cash';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['payment:read', 'payment:write'])]
    private ?string $concept = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['payment:read', 'payment:write'])]
    private ?\DateTimeInterface $paymentDate = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['payment:read'])]
    private ?\DateTimeInterface $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->paymentDate = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPatient(): ?Patient
    {
        return $this->patient;
    }
    public function setPatient(?Patient $patient): static
    {
        $this->patient = $patient;
        return $this;
    }

    public function getTreatmentPlan(): ?TreatmentPlan
    {
        return $this->treatmentPlan;
    }
    public function setTreatmentPlan(?TreatmentPlan $treatmentPlan): static
    {
        $this->treatmentPlan = $treatmentPlan;
        return $this;
    }

    public function getAmount(): ?string
    {
        return $this->amount;
    }
    public function setAmount(string $amount): static
    {
        $this->amount = $amount;
        return $this;
    }

    public function getMethod(): ?string
    {
        return $this->method;
    }
    public function setMethod(string $method): static
    {
        $this->method = $method;
        return $this;
    }

    public function getConcept(): ?string
    {
        return $this->concept;
    }
    public function setConcept(?string $concept): static
    {
        $this->concept = $concept;
        return $this;
    }

    public function getPaymentDate(): ?\DateTimeInterface
    {
        return $this->paymentDate;
    }
    public function setPaymentDate(\DateTimeInterface $paymentDate): static
    {
        $this->paymentDate = $paymentDate;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }
    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }
}

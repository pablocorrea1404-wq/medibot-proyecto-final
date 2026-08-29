<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['budget:read']],
    denormalizationContext: ['groups' => ['budget:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['patient' => 'exact'])]
class TreatmentPlan
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['budget:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['budget:read', 'budget:write'])]
    private ?Patient $patient = null;

    #[ORM\Column(length: 255)]
    #[Groups(['budget:read', 'budget:write'])]
    private ?string $title = null;

    /** Estado: draft, presented, accepted, in_progress, completed, rejected */
    #[ORM\Column(length: 50)]
    #[Groups(['budget:read', 'budget:write'])]
    private ?string $status = 'draft';

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['budget:read', 'budget:write'])]
    private ?string $totalAmount = '0.00';

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2, nullable: true)]
    #[Groups(['budget:read', 'budget:write'])]
    private ?string $discountPercent = '0.00';

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['budget:read', 'budget:write'])]
    private ?string $finalAmount = '0.00';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['budget:read', 'budget:write'])]
    private ?string $notes = null;

    /** JSON con items: [{service, toothNumber, description, price, status}] */
    #[ORM\Column(type: Types::JSON)]
    #[Groups(['budget:read', 'budget:write'])]
    private array $items = [];

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['budget:read', 'budget:write'])]
    private ?Staff $createdBy = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['budget:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['budget:read', 'budget:write'])]
    private ?\DateTimeInterface $acceptedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
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

    public function getTitle(): ?string
    {
        return $this->title;
    }
    public function setTitle(string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }
    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getTotalAmount(): ?string
    {
        return $this->totalAmount;
    }
    public function setTotalAmount(string $totalAmount): static
    {
        $this->totalAmount = $totalAmount;
        return $this;
    }

    public function getDiscountPercent(): ?string
    {
        return $this->discountPercent;
    }
    public function setDiscountPercent(?string $discountPercent): static
    {
        $this->discountPercent = $discountPercent;
        return $this;
    }

    public function getFinalAmount(): ?string
    {
        return $this->finalAmount;
    }
    public function setFinalAmount(string $finalAmount): static
    {
        $this->finalAmount = $finalAmount;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }
    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;
        return $this;
    }

    public function getItems(): array
    {
        return $this->items;
    }
    public function setItems(array $items): static
    {
        $this->items = $items;
        return $this;
    }

    public function getCreatedBy(): ?Staff
    {
        return $this->createdBy;
    }
    public function setCreatedBy(?Staff $createdBy): static
    {
        $this->createdBy = $createdBy;
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

    public function getAcceptedAt(): ?\DateTimeInterface
    {
        return $this->acceptedAt;
    }
    public function setAcceptedAt(?\DateTimeInterface $acceptedAt): static
    {
        $this->acceptedAt = $acceptedAt;
        return $this;
    }
}

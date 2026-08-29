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
    normalizationContext: ['groups' => ['dental:read']],
    denormalizationContext: ['groups' => ['dental:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['patient' => 'exact'])]
class DentalRecord
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['dental:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['dental:read', 'dental:write'])]
    private ?Patient $patient = null;

    /** Número de diente (1-32, notación FDI: 11-48) */
    #[ORM\Column]
    #[Groups(['dental:read', 'dental:write'])]
    private ?int $toothNumber = null;

    /** Estado: healthy, caries, filling, crown, implant, extraction, bridge, root_canal, missing */
    #[ORM\Column(length: 50)]
    #[Groups(['dental:read', 'dental:write'])]
    private ?string $status = 'healthy';

    /** Superficie afectada: mesial, distal, oclusal, vestibular, lingual, o combinaciones */
    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['dental:read', 'dental:write'])]
    private ?string $surface = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['dental:read', 'dental:write'])]
    private ?string $notes = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['dental:read', 'dental:write'])]
    private ?string $treatment = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['dental:read', 'dental:write'])]
    private ?string $material = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['dental:read', 'dental:write'])]
    private ?Staff $treatedBy = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['dental:read', 'dental:write'])]
    private ?string $cost = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['dental:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['dental:read', 'dental:write'])]
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
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

    public function getToothNumber(): ?int
    {
        return $this->toothNumber;
    }
    public function setToothNumber(int $toothNumber): static
    {
        $this->toothNumber = $toothNumber;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }
    public function setStatus(string $status): static
    {
        $this->status = $status;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getSurface(): ?string
    {
        return $this->surface;
    }
    public function setSurface(?string $surface): static
    {
        $this->surface = $surface;
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

    public function getTreatment(): ?string
    {
        return $this->treatment;
    }
    public function setTreatment(?string $treatment): static
    {
        $this->treatment = $treatment;
        return $this;
    }

    public function getMaterial(): ?string
    {
        return $this->material;
    }
    public function setMaterial(?string $material): static
    {
        $this->material = $material;
        return $this;
    }

    public function getTreatedBy(): ?Staff
    {
        return $this->treatedBy;
    }
    public function setTreatedBy(?Staff $treatedBy): static
    {
        $this->treatedBy = $treatedBy;
        return $this;
    }

    public function getCost(): ?string
    {
        return $this->cost;
    }
    public function setCost(?string $cost): static
    {
        $this->cost = $cost;
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

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }
    public function setUpdatedAt(?\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}

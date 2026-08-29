<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Doctrine\DBAL\Types\Types;

#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['patient:read']],
    denormalizationContext: ['groups' => ['patient:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['phone' => 'exact'])]
#[UniqueEntity(fields: ['dni'], message: 'Ya existe un paciente con este DNI.')]
class Patient
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['patient:read', 'appointment:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['patient:read', 'patient:write', 'appointment:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['patient:read', 'patient:write'])]
    private ?string $email = null;

    #[ORM\Column(length: 20)]
    #[Assert\NotBlank]
    #[Groups(['patient:read', 'patient:write'])]
    private ?string $phone = null;

    #[ORM\Column(length: 20, unique: true, nullable: true)]
    #[Groups(['patient:read', 'patient:write'])]
    private ?string $dni = null;

    // ========== NUEVOS CAMPOS CLÍNICOS ==========

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['patient:read', 'patient:write'])]
    private ?\DateTimeInterface $birthDate = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['patient:read', 'patient:write'])]
    private ?string $address = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['patient:read', 'patient:write'])]
    private ?string $allergies = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['patient:read', 'patient:write'])]
    private ?string $medicalConditions = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['patient:read', 'patient:write'])]
    private ?string $medications = null;

    #[ORM\Column(length: 10, nullable: true)]
    #[Groups(['patient:read', 'patient:write'])]
    private ?string $bloodType = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['patient:read', 'patient:write'])]
    private ?string $insuranceCompany = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['patient:read', 'patient:write'])]
    private ?string $insuranceNumber = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['patient:read', 'patient:write'])]
    private ?string $clinicalNotes = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['patient:read'])]
    private ?\DateTimeInterface $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    // ========== GETTERS & SETTERS ==========

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }
    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }
    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }
    public function setPhone(string $phone): static
    {
        $this->phone = $phone;
        return $this;
    }

    public function getDni(): ?string
    {
        return $this->dni;
    }
    public function setDni(?string $dni): static
    {
        $this->dni = $dni;
        return $this;
    }

    public function getBirthDate(): ?\DateTimeInterface
    {
        return $this->birthDate;
    }
    public function setBirthDate(?\DateTimeInterface $birthDate): static
    {
        $this->birthDate = $birthDate;
        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }
    public function setAddress(?string $address): static
    {
        $this->address = $address;
        return $this;
    }

    public function getAllergies(): ?string
    {
        return $this->allergies;
    }
    public function setAllergies(?string $allergies): static
    {
        $this->allergies = $allergies;
        return $this;
    }

    public function getMedicalConditions(): ?string
    {
        return $this->medicalConditions;
    }
    public function setMedicalConditions(?string $medicalConditions): static
    {
        $this->medicalConditions = $medicalConditions;
        return $this;
    }

    public function getMedications(): ?string
    {
        return $this->medications;
    }
    public function setMedications(?string $medications): static
    {
        $this->medications = $medications;
        return $this;
    }

    public function getBloodType(): ?string
    {
        return $this->bloodType;
    }
    public function setBloodType(?string $bloodType): static
    {
        $this->bloodType = $bloodType;
        return $this;
    }

    public function getInsuranceCompany(): ?string
    {
        return $this->insuranceCompany;
    }
    public function setInsuranceCompany(?string $insuranceCompany): static
    {
        $this->insuranceCompany = $insuranceCompany;
        return $this;
    }

    public function getInsuranceNumber(): ?string
    {
        return $this->insuranceNumber;
    }
    public function setInsuranceNumber(?string $insuranceNumber): static
    {
        $this->insuranceNumber = $insuranceNumber;
        return $this;
    }

    public function getClinicalNotes(): ?string
    {
        return $this->clinicalNotes;
    }
    public function setClinicalNotes(?string $clinicalNotes): static
    {
        $this->clinicalNotes = $clinicalNotes;
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

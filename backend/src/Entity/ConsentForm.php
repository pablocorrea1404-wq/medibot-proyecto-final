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
    normalizationContext: ['groups' => ['consent:read']],
    denormalizationContext: ['groups' => ['consent:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['patient' => 'exact'])]
class ConsentForm
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['consent:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['consent:read', 'consent:write'])]
    private ?Patient $patient = null;

    /** Tipo: extraction, implant, orthodontics, endodontics, surgery, general, whitening */
    #[ORM\Column(length: 100)]
    #[Groups(['consent:read', 'consent:write'])]
    private ?string $type = null;

    #[ORM\Column(length: 255)]
    #[Groups(['consent:read', 'consent:write'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['consent:read', 'consent:write'])]
    private ?string $content = null;

    /** signed, pending, revoked */
    #[ORM\Column(length: 50)]
    #[Groups(['consent:read', 'consent:write'])]
    private ?string $status = 'pending';

    /** Firma digital: base64 de la imagen de la firma */
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['consent:read', 'consent:write'])]
    private ?string $signatureData = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['consent:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['consent:read', 'consent:write'])]
    private ?\DateTimeInterface $signedAt = null;

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

    public function getType(): ?string
    {
        return $this->type;
    }
    public function setType(string $type): static
    {
        $this->type = $type;
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

    public function getContent(): ?string
    {
        return $this->content;
    }
    public function setContent(string $content): static
    {
        $this->content = $content;
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

    public function getSignatureData(): ?string
    {
        return $this->signatureData;
    }
    public function setSignatureData(?string $signatureData): static
    {
        $this->signatureData = $signatureData;
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

    public function getSignedAt(): ?\DateTimeInterface
    {
        return $this->signedAt;
    }
    public function setSignedAt(?\DateTimeInterface $signedAt): static
    {
        $this->signedAt = $signedAt;
        return $this;
    }
}

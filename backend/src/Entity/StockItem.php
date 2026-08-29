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
    normalizationContext: ['groups' => ['stock:read']],
    denormalizationContext: ['groups' => ['stock:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['category' => 'exact', 'name' => 'partial'])]
class StockItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['stock:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['stock:read', 'stock:write'])]
    private ?string $name = null;

    /** Categorías: material, instrumento, consumible, medicamento, proteccion */
    #[ORM\Column(length: 100)]
    #[Groups(['stock:read', 'stock:write'])]
    private ?string $category = 'consumible';

    #[ORM\Column]
    #[Groups(['stock:read', 'stock:write'])]
    private ?int $quantity = 0;

    #[ORM\Column]
    #[Groups(['stock:read', 'stock:write'])]
    private ?int $minStock = 5;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['stock:read', 'stock:write'])]
    private ?string $unit = 'unidades';

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['stock:read', 'stock:write'])]
    private ?string $unitPrice = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['stock:read', 'stock:write'])]
    private ?string $supplier = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['stock:read', 'stock:write'])]
    private ?string $notes = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['stock:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['stock:read'])]
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

    public function getName(): ?string
    {
        return $this->name;
    }
    public function setName(string $name): static
    {
        $this->name = $name;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }
    public function setCategory(string $category): static
    {
        $this->category = $category;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }
    public function setQuantity(int $quantity): static
    {
        $this->quantity = $quantity;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getMinStock(): ?int
    {
        return $this->minStock;
    }
    public function setMinStock(int $minStock): static
    {
        $this->minStock = $minStock;
        return $this;
    }

    public function getUnit(): ?string
    {
        return $this->unit;
    }
    public function setUnit(?string $unit): static
    {
        $this->unit = $unit;
        return $this;
    }

    public function getUnitPrice(): ?string
    {
        return $this->unitPrice;
    }
    public function setUnitPrice(?string $unitPrice): static
    {
        $this->unitPrice = $unitPrice;
        return $this;
    }

    public function getSupplier(): ?string
    {
        return $this->supplier;
    }
    public function setSupplier(?string $supplier): static
    {
        $this->supplier = $supplier;
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

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }
    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }
}

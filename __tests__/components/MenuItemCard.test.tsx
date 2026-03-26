import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MenuItemCard } from "@/components/MenuItemCard";
import type { MenuItem } from "@/lib/types";

const baseItem: MenuItem = {
  id: "item1",
  name: "Iced Latte",
  description: "Smooth espresso with cold milk",
  categoryName: "Coffee",
  imageUrl: null,
  variations: [
    { id: "v1", name: "Regular", price: 450, formattedPrice: "$4.50", currency: "USD" },
  ],
};

describe("MenuItemCard", () => {
  it("renders item name and price", () => {
    render(<MenuItemCard item={baseItem} />);
    expect(screen.getByText("Iced Latte")).toBeInTheDocument();
    expect(screen.getByText("$4.50")).toBeInTheDocument();
  });

  it("shows placeholder when imageUrl is null", () => {
    render(<MenuItemCard item={baseItem} />);
    // No <img> tag should be present since imageUrl is null
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows 'From' prefix with multiple variations", () => {
    const multiItem: MenuItem = {
      ...baseItem,
      variations: [
        { id: "v1", name: "Small", price: 350, formattedPrice: "$3.50", currency: "USD" },
        { id: "v2", name: "Large", price: 550, formattedPrice: "$5.50", currency: "USD" },
      ],
    };
    render(<MenuItemCard item={multiItem} />);
    expect(screen.getByText("From $3.50")).toBeInTheDocument();
  });

  it("renders description as hidden on mobile via CSS class", () => {
    render(<MenuItemCard item={baseItem} />);
    const desc = screen.getByText("Smooth espresso with cold milk");
    expect(desc.className).toContain("hidden");
    expect(desc.className).toContain("md:block");
  });
});

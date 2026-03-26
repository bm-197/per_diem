import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryNav } from "@/components/CategoryNav";
import type { CategorySummary } from "@/lib/types";

const categories: CategorySummary[] = [
  { id: "cat1", name: "Coffee", itemCount: 5 },
  { id: "cat2", name: "Tea", itemCount: 3 },
  { id: "cat3", name: "Pastries", itemCount: 2 },
];

describe("CategoryNav", () => {
  it("renders All pill and category pills", () => {
    render(
      <CategoryNav
        categories={categories}
        selectedId={null}
        onCategoryChange={() => {}}
      />
    );

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("Tea")).toBeInTheDocument();
    expect(screen.getByText("Pastries")).toBeInTheDocument();
  });

  it("calls onCategoryChange with null when All is clicked", () => {
    const onChange = vi.fn();
    render(
      <CategoryNav
        categories={categories}
        selectedId="cat1"
        onCategoryChange={onChange}
      />
    );

    fireEvent.click(screen.getByText("All"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("calls onCategoryChange with category ID when clicked", () => {
    const onChange = vi.fn();
    render(
      <CategoryNav
        categories={categories}
        selectedId={null}
        onCategoryChange={onChange}
      />
    );

    fireEvent.click(screen.getByText("Tea"));
    expect(onChange).toHaveBeenCalledWith("cat2");
  });
});

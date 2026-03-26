import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocationSelector } from "@/components/LocationSelector";
import type { Location } from "@/lib/types";

const locations: Location[] = [
  {
    id: "loc1",
    name: "Downtown",
    address: { line1: "123 Main St", city: "Austin", state: "TX", postalCode: "78701" },
    timezone: "America/Chicago",
    status: "ACTIVE",
  },
  {
    id: "loc2",
    name: "Uptown",
    address: { line1: "456 Oak Ave", city: "Austin", state: "TX", postalCode: "78702" },
    timezone: "America/Chicago",
    status: "ACTIVE",
  },
];

describe("LocationSelector", () => {
  it("renders all location options", () => {
    render(
      <LocationSelector
        locations={locations}
        selectedId="loc1"
        onLocationChange={() => {}}
      />
    );

    expect(screen.getByText("Downtown")).toBeInTheDocument();
    expect(screen.getByText("Uptown")).toBeInTheDocument();
  });

  it("calls onLocationChange when selection changes", () => {
    const onChange = vi.fn();
    render(
      <LocationSelector
        locations={locations}
        selectedId="loc1"
        onLocationChange={onChange}
      />
    );

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "loc2" } });
    expect(onChange).toHaveBeenCalledWith("loc2");
  });

  it("shows loading text when no locations provided", () => {
    render(
      <LocationSelector
        locations={[]}
        selectedId={null}
        onLocationChange={() => {}}
      />
    );

    expect(screen.getByText("Loading locations...")).toBeInTheDocument();
  });
});

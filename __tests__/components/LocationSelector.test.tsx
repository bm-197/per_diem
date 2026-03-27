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
  it("renders selected location name", () => {
    render(
      <LocationSelector
        locations={locations}
        selectedId="loc1"
        onLocationChange={() => {}}
      />
    );

    expect(screen.getByText("Downtown")).toBeInTheDocument();
    expect(screen.getByText("Pickup from")).toBeInTheDocument();
  });

  it("opens dropdown when clicked and shows all locations", () => {
    render(
      <LocationSelector
        locations={locations}
        selectedId="loc1"
        onLocationChange={() => {}}
      />
    );

    // Click to open
    fireEvent.click(screen.getByText("Downtown"));
    expect(screen.getByText("Uptown")).toBeInTheDocument();
    expect(screen.getByText("123 Main St, Austin, TX")).toBeInTheDocument();
  });

  it("calls onLocationChange when a location is selected", () => {
    const onChange = vi.fn();
    render(
      <LocationSelector
        locations={locations}
        selectedId="loc1"
        onLocationChange={onChange}
      />
    );

    fireEvent.click(screen.getByText("Downtown"));
    fireEvent.click(screen.getByText("Uptown"));
    expect(onChange).toHaveBeenCalledWith("loc2");
  });

  it("shows fallback text when no location selected", () => {
    render(
      <LocationSelector
        locations={[]}
        selectedId={null}
        onLocationChange={() => {}}
      />
    );

    expect(screen.getByText("Select location...")).toBeInTheDocument();
  });
});

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
        onOpenPicker={() => {}}
      />
    );

    expect(screen.getByText("Downtown")).toBeInTheDocument();
    expect(screen.getByText("Pickup from")).toBeInTheDocument();
  });

  it("calls onOpenPicker when clicked", () => {
    const onOpen = vi.fn();
    render(
      <LocationSelector
        locations={locations}
        selectedId="loc1"
        onOpenPicker={onOpen}
      />
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("shows fallback text when no location selected", () => {
    render(
      <LocationSelector
        locations={[]}
        selectedId={null}
        onOpenPicker={() => {}}
      />
    );

    expect(screen.getByText("Select location...")).toBeInTheDocument();
  });
});

import type { CategoryGroup, MenuItem } from "@/lib/types";
import { MenuItemCard } from "./MenuItemCard";

interface MenuSectionProps {
  group: CategoryGroup;
  subtitle?: string;
  onItemClick?: (item: MenuItem) => void;
}

export function MenuSection({ group, subtitle, onItemClick }: MenuSectionProps) {
  return (
    <section id={`section-${group.category.id}`} className="scroll-mt-24">
      <h3 className="text-2xl font-bold text-text-heading">
        {group.category.name}
      </h3>
      {subtitle && (
        <p className="text-sm text-text-muted mt-0.5 mb-4">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-4" />}

      <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
        {group.items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </div>
    </section>
  );
}

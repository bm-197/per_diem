import type { CategoryGroup } from "@/lib/types";
import { MenuItemCard } from "./MenuItemCard";

interface MenuSectionProps {
  group: CategoryGroup;
}

export function MenuSection({ group }: MenuSectionProps) {
  return (
    <section id={`section-${group.category.id}`} className="scroll-mt-24">
      <h3 className="text-2xl font-bold text-text-heading mb-4">
        {group.category.name}
      </h3>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
        {group.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

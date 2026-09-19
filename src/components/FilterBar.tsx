import { Button } from "@/components/ui/button";
import { Camera, Leaf, Lightning, MapPin, Minus, DeviceMobile, DeviceRotate } from "@phosphor-icons/react";
import { type Orientation } from "@/store/settings";

const MODIFIERS = [
  { slug: "nature", label: "Nature", icon: Leaf },
  { slug: "technology", label: "Technology", icon: Lightning },
  { slug: "travel", label: "Travel", icon: MapPin },
  { slug: "minimal", label: "Minimal", icon: Minus },
  { slug: "space", label: "Space", icon: Camera },
];

interface FilterBarProps {
  activeModifier: string | null;
  onSelectModifier: (slug: string | null) => void;
  orientation: Orientation | null;
  onOrientationChange: (orientation: Orientation | null) => void;
}

export function FilterBar({
  activeModifier,
  onSelectModifier,
  orientation,
  onOrientationChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Modifier pills */}
      <Button
        variant={activeModifier === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectModifier(null)}
        className="shrink-0 rounded-full px-4"
      >
        All
      </Button>
      {MODIFIERS.map((mod) => (
        <Button
          key={mod.slug}
          variant={activeModifier === mod.slug ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectModifier(mod.slug === activeModifier ? null : mod.slug)}
          className="shrink-0 rounded-full px-4 gap-1.5"
        >
          <mod.icon className="size-3.5" weight="fill" />
          {mod.label}
        </Button>
      ))}

      {/* Orientation divider */}
      <div className="ml-auto flex items-center gap-1 border-l border-border pl-3">
        <span className="text-xs text-muted-foreground mr-1">Orientation:</span>
        <Button
          variant={orientation === "portrait" ? "default" : "outline"}
          size="sm"
          onClick={() => onOrientationChange(orientation === "portrait" ? null : "portrait")}
          className="shrink-0 rounded-full px-3 gap-1"
        >
          <DeviceMobile className="size-3" weight="fill" />
          Vertical
        </Button>
        <Button
          variant={orientation === "landscape" ? "default" : "outline"}
          size="sm"
          onClick={() => onOrientationChange(orientation === "landscape" ? null : "landscape")}
          className="shrink-0 rounded-full px-3 gap-1"
        >
          <DeviceRotate className="size-3" weight="fill" />
          Horizontal
        </Button>
      </div>
    </div>
  );
}

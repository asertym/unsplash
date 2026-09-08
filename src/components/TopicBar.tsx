import { Button } from "@/components/ui/button";
import { Camera, Heart, Lightning, Palette, Building, MapPin, Leaf } from "@phosphor-icons/react";

interface Topic {
  slug: string;
  label: string;
  icon: React.ReactNode;
}

const TOPICS: Topic[] = [
  { slug: "wallpapers", label: "Wallpapers", icon: <Camera className="size-3.5" weight="fill" /> },
  { slug: "nature", label: "Nature", icon: <Leaf className="size-3.5" weight="fill" /> },
  { slug: "technology", label: "Technology", icon: <Lightning className="size-3.5" weight="fill" /> },
  { slug: "architecture", label: "Architecture", icon: <Building className="size-3.5" weight="fill" /> },
  { slug: "travel", label: "Travel", icon: <MapPin className="size-3.5" weight="fill" /> },
  { slug: "minimal", label: "Minimal", icon: <Palette className="size-3.5" weight="fill" /> },
  { slug: "animals", label: "Animals", icon: <Heart className="size-3.5" weight="fill" /> },
];

interface TopicBarProps {
  activeTopic: string | null;
  onSelectTopic: (slug: string) => void;
  onClear: () => void;
}

export function TopicBar({ activeTopic, onSelectTopic, onClear }: TopicBarProps) {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
      <Button
        variant={activeTopic === null ? "default" : "outline"}
        size="sm"
        onClick={onClear}
        className="shrink-0 rounded-full px-4"
      >
        All
      </Button>
      {TOPICS.map((topic) => (
        <Button
          key={topic.slug}
          variant={activeTopic === topic.slug ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectTopic(topic.slug)}
          className="shrink-0 rounded-full px-4 gap-1.5"
        >
          {topic.icon}
          {topic.label}
        </Button>
      ))}
    </div>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Gear } from "@phosphor-icons/react";
import { useSettingsStore } from "@/store/settings";

export function SettingsPanel() {
  const { paginationMode, setPaginationMode } = useSettingsStore();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <Gear className="size-4" weight="light" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Pagination mode</Label>
              <p className="text-sm text-muted-foreground">
                {paginationMode === "infinite"
                  ? "Photos load automatically as you scroll"
                  : "Click load more to fetch additional photos"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${paginationMode === "infinite" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Infinite</span>
              <Switch
                checked={paginationMode === "load-more"}
                onCheckedChange={(checked) => setPaginationMode(checked ? "load-more" : "infinite")}
              />
              <span className={`text-xs ${paginationMode === "load-more" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Load more</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

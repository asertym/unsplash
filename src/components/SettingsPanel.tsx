import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Gear, FolderOpen } from "@phosphor-icons/react";
import { open } from "@tauri-apps/plugin-dialog";
import { useSettingsStore } from "@/store/settings";

export function SettingsPanel() {
  const { paginationMode, setPaginationMode, saveFolder, setSaveFolder } =
    useSettingsStore();

  const handlePickFolder = async () => {
    const folder = await open({ directory: true, multiple: false });
    if (typeof folder === "string") setSaveFolder(folder);
  };

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
          <div className="space-y-2">
            <Label className="text-base">Save location</Label>
            <p className="break-all text-sm text-muted-foreground">
              {saveFolder ?? "Default (Pictures/Unsplash Wallpapers)"}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePickFolder}>
                <FolderOpen className="mr-1.5 size-3.5" weight="light" />
                Choose folder…
              </Button>
              {saveFolder && (
                <Button variant="ghost" size="sm" onClick={() => setSaveFolder(null)}>
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

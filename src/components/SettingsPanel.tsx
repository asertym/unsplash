import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Gear, FolderOpen, ArrowCounterClockwise } from "@phosphor-icons/react";
import { open } from "@tauri-apps/plugin-dialog";
import { useSettingsStore } from "@/store/settings";
import { useAutoUpdate } from "@/hooks/useAutoUpdate";

export function SettingsPanel() {
  const { paginationMode, setPaginationMode, saveFolder, setSaveFolder } =
    useSettingsStore();
  const { currentVersion, checking, error, updateAvailable, latestVersion, downloading, checkForUpdate, downloadAndInstall } =
    useAutoUpdate();

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

          <div className="pt-2 border-t">
            <Label className="text-base">Updates</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Current version: <span className="font-mono">{currentVersion}</span>
            </p>
            {updateAvailable && latestVersion && (
              <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Update available
                </p>
                <p className="text-xs text-muted-foreground">
                  Version <span className="font-mono">{latestVersion}</span> is ready to install
                </p>
                <Button
                  size="sm"
                  onClick={downloadAndInstall}
                  disabled={downloading}
                  className="w-full"
                >
                  {downloading ? "Downloading…" : "Update & Relaunch"}
                </Button>
              </div>
            )}
            {error && (
              <p className="text-xs text-destructive mb-2">{error}</p>
            )}
            <Button variant="outline" size="sm" onClick={checkForUpdate} disabled={checking} className="w-full">
              <ArrowCounterClockwise className="mr-1.5 size-3.5" weight="light" />
              {checking ? "Checking…" : "Check for updates"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

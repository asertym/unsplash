import { useState, useCallback, useEffect, useRef } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import packageJson from "../../package.json";

export function useAutoUpdate() {
	const currentVersion = packageJson.version;
	const [checking, setChecking] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [latestVersion, setLatestVersion] = useState<string | null>(null);
	const [downloading, setDownloading] = useState(false);
	const updateRef = useRef<Awaited<ReturnType<typeof check>> | null>(null);

	const checkForUpdate = useCallback(async () => {
		setChecking(true);
		setError(null);
		try {
			const update = await check();
			updateRef.current = update;
			if (update) {
				setLatestVersion(update.version);
				setUpdateAvailable(true);
			} else {
				setUpdateAvailable(false);
				setLatestVersion(null);
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setChecking(false);
		}
	}, []);

	const downloadAndInstall = useCallback(async () => {
		setDownloading(true);
		setError(null);
		try {
			const update = updateRef.current;
			if (update) {
				await update.downloadAndInstall();
				// ponytail: Windows auto-relaunches; macOS/Linux need explicit relaunch
				await relaunch();
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setDownloading(false);
		}
	}, []);

	useEffect(() => {
		checkForUpdate();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		currentVersion,
		checking,
		error,
		updateAvailable,
		latestVersion,
		downloading,
		checkForUpdate,
		downloadAndInstall,
	};
}

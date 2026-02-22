import type { PartialDeep } from "type-fest";
import type { LanguageCode } from "./translationApi";
import { deepMerge } from "./utils";

export const settings = {
	outgoingMessages: {
		enabled: false,
		automatic: true,
		case: "none" as "none" | "lower" | "upper",
		targetLanguage: "en" as LanguageCode,
	},
	incomingMessages: {
		enabled: true,
		automatic: true,
		display: "both" as "both" | "original" | "translation",
		displayType: "inline" as "inline" | "tooltip",
		fontSizeInEm: 1,
		targetLanguage: "en" as LanguageCode,
	},
};
export type Settings = typeof settings;

const eventTarget = new EventTarget();
export function updateSettings(newSettings: PartialDeep<Settings>) {
	// merge new settings with old settings
	deepMerge(settings, newSettings);
	// save the new settings
	GM_setValue("settings", settings);

	eventTarget.dispatchEvent(new Event("settingsUpdated"));
}

export function addSettingsListener(callback: (newSettings: Settings) => void) {
	eventTarget.addEventListener("settingsUpdated", () => {
		callback(settings);
	});
}

export function loadSettings() {
	// merge the saved settings with the default settings
	deepMerge(settings, GM_getValue("settings", {}));
}

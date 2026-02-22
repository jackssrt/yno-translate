import type fastdom from "fastdom/extensions/fastdom-promised";
import hookChatbox from "./hookChatbox";
import hookMessageSending from "./hookMessageSending";
import { loadSettings } from "./settings";
import { addOutgoingTranslateButton, addSettingsModal } from "./ui";
import { log, waitForElement } from "./utils";

declare global {
	interface Window {
		chatboxAddMessage: (
			msg: string,
			type: string,
			player: string | Record<string, unknown>,
			ignoreNotify: boolean,
			mapId: string,
			prevMapId: string,
			prevLocationsStr: string,
			x: number,
			y: number,
			msgId: unknown,
			timestamp: unknown,
			shouldScroll: boolean
		) => HTMLDivElement | undefined;
		showToastMessage: (message: string) => void;
		addTooltip: (
			target: HTMLElement,
			content: string | Node,
			asTooltipContent?: boolean,
			delayed?: boolean,
			interactive?: boolean,
			options?: Record<string, unknown>
		) => void;
		scrollChatMessages: () => void;
		chatInputActionFired: () => void;
		fastdom: typeof fastdom;
	}
}

function printBanner(): void {
	console.log(
		"%cYNO Translate",
		"font-size: 2em; color: #ff0000; font-weight: bold; text-shadow: 0 0 5px #ff0000;"
	);
	console.log(
		"%cDream internationally!",
		"font-size: 1.5em; color: #ff0000; font-weight: bold; text-shadow: 0 0 5px #ff0000;"
	);
}

async function main() {
	printBanner();
	loadSettings();

	// if we are in development mode, do some extra stuff
	if (import.meta.env.DEV) {
		log("Applying nice development stuff");
		// disable onbeforeunload, and remove the ability to add it back
		unsafeWindow.onbeforeunload = null;
		Object.defineProperty(unsafeWindow, "onbeforeunload", {
			get: () => null,
			set: () => null,
		});
	}

	// add ui elements
	await waitForElement("#chatInput");
	addSettingsModal();
	addOutgoingTranslateButton();

	// hook
	await Promise.all([hookChatbox(), hookMessageSending()]);
}

void main();

import { settings } from "./settings";
import translate from "./translationApi";
import { hookFunction, pawait } from "./utils";

let previousAbortController: AbortController | undefined = undefined;

export default async function hookMessageSending() {
	await hookFunction("chatInputActionFired", (originalFunction, ...args) => {
		if (!settings.outgoingMessages.enabled)
			return originalFunction(...args);
		previousAbortController?.abort();
		const abortController = new AbortController();
		previousAbortController = abortController;
		void (async () => {
			// get the chatinput element
			const chatInput =
				document.querySelector<HTMLInputElement>("#chatInput");
			if (!chatInput) return;

			// get the value of the chatinput
			const message = chatInput.value;
			// translate the message
			const [error, translation] = await pawait(
				translate(settings.outgoingMessages.targetLanguage, message)
			);

			// check if the translation failed
			if (error) {
				unsafeWindow.alert("Translation failed");
				abortController.abort();
				return;
			}
			// check if the translation was aborted
			if (abortController.signal.aborted) return;

			// give the new value to the original function
			chatInput.value = translation.translation;
			originalFunction(...args);
		})();
	});
}

import { settings } from "./settings";
import translate, { shouldDebounce } from "./translationApi";
import {
	addTranslationUI,
	deleteTranslationUI,
	showTranslationErrorUI,
	showTranslationUI,
} from "./ui";
import { cleanMessageContent, hookFunction, pawait } from "./utils";

export default async function hookChatbox() {
	// hook into the chatboxAddMessage function
	await hookFunction("chatboxAddMessage", (originalFunction, ...args) => {
		// call the original function and get the message element
		const messageElement = originalFunction(...args);
		if (!messageElement) return;
		void (async function () {
			const message = args[0];
			// generate a unique id for this message
			const id = crypto.randomUUID();

			await unsafeWindow.fastdom.mutate(() =>
				addTranslationUI(messageElement, id)
			);

			// early return if we should debounce
			if (shouldDebounce()) {
				await unsafeWindow.fastdom.mutate(() =>
					showTranslationErrorUI(messageElement, "Debounce")
				);
				return;
			}

			// send off the translation request
			const cleanedMessageContent = cleanMessageContent(message);
			const [error, translation] = await pawait(
				translate(
					settings.incomingMessages.targetLanguage,
					cleanedMessageContent
				)
			);

			// check if the translation failed
			if (error) {
				await unsafeWindow.fastdom.mutate(() =>
					showTranslationErrorUI(messageElement, "Translation failed")
				);
				return;
			}
			// check if the translation si in the same language
			if (translation.src === settings.incomingMessages.targetLanguage) {
				await unsafeWindow.fastdom.mutate(() =>
					deleteTranslationUI(id)
				);
				return;
			}

			// show the translation in the ui
			await unsafeWindow.fastdom.mutate(() => {
				showTranslationUI(id, translation.translation);
			});
			const messages = document.querySelector("#messages")!;
			const task = unsafeWindow.fastdom.measure(
				() =>
					Math.abs(
						messages.scrollHeight -
							messages.scrollTop -
							messages.clientHeight
					) <= 61
			);
			await task.then(
				(shouldScroll) =>
					shouldScroll && unsafeWindow.scrollChatMessages()
			);
		})();
		return messageElement;
	});
}

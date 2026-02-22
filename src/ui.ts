import {
	addSettingsListener,
	settings,
	updateSettings,
	type Settings,
} from "./settings";
import { LANGUAGES, type LanguageCode } from "./translationApi";
import { log, waitForFunction } from "./utils";

export const getTranslationContainersForId = (id: string) =>
	document.querySelectorAll(`#${getTranslationContainerId(id)}`);

export const getTranslationContainerId = (id: string) =>
	`yno-translate-translation-container-${id}`;

export function addTranslationUI(messageElement: HTMLElement, id: string) {
	const content = messageElement.querySelector(".messageContents")!;

	// add div to contain the translation
	const translationContainer = document.createElement("div");
	translationContainer.id = getTranslationContainerId(id);
	content.appendChild(translationContainer);

	// add the translated message
	const translated = document.createElement("span");
	translated.className = "yno-translate-translation messageContents";
	translated.style.fontSize = "0.8em"; // make it smaller
	translated.style.opacity = "1"; // make it invisible
	translated.innerText = "Translation pending...";
	translationContainer.appendChild(translated);
}
function animateTranslationText(translation: HTMLSpanElement, newText: string) {
	// split the text up into chunks where each chunk reveals a bit more of the text
	const NUM_CHUNKS = 3;
	const chunkLength = newText.length / NUM_CHUNKS;

	for (let i = 0; i < NUM_CHUNKS; i++) {
		const chunk = newText.slice(0, Math.round((i + 1) * chunkLength));
		setTimeout(() => {
			translation.innerText = chunk;
		}, i * 100);
	}
}

export function showTranslationErrorUI(
	messageElement: HTMLDivElement,
	error: string
) {
	const translationElement = messageElement.querySelector<HTMLSpanElement>(
		".yno-translate-translation"
	);
	if (!translationElement) return;
	animateTranslationText(translationElement, `Error: ${error}`);
}
export function showTranslationUI(id: string, translation: string) {
	const translationContainers = getTranslationContainersForId(id);
	for (const translationContainer of translationContainers) {
		if (!translationContainer) {
			log("translationContainer not found", id);
			return;
		}
		const translationElement =
			translationContainer.querySelector<HTMLDivElement>(
				".yno-translate-translation"
			);
		if (!translationElement) {
			log("translation not found", id);
			return;
		}
		animateTranslationText(translationElement, translation);
	}
}
export function deleteTranslationUI(id: string) {
	const translationContainers = getTranslationContainersForId(id);
	for (const translationContainer of translationContainers) {
		translationContainer.remove();
	}
}

function addOutgoingTranslateButtonTooltip(button: HTMLButtonElement) {
	const span = document.createElement("span");
	span.innerText =
		"Left click: Toggle auto-translate\nRight click: Open settings";

	void waitForFunction("addTooltip").then(() => {
		unsafeWindow.addTooltip(button, span, false, true);
	});
}

export function addOutgoingTranslateButton() {
	const chatInput =
		document.querySelector<HTMLTextAreaElement>("#chatInput")!;
	// 18px per icon + 20 px padding
	chatInput.style.width = "calc(100% - 56px)";
	chatInput.style.paddingInlineEnd = "56px";
	const chatborder = document.querySelector<HTMLDivElement>("#chatBorder")!;
	chatborder.style.width = "100%";

	const buttons = document.querySelector<HTMLDivElement>(
		"#chatInputContainer"
	)!;
	const button = document.createElement("button");
	button.className = "iconButton";
	function updateButtonIcon() {
		button.innerText = settings.outgoingMessages.enabled ? "💬" : "💭";
	}
	updateButtonIcon();
	addSettingsListener(updateButtonIcon);

	button.style.zIndex = "10";
	button.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		openTranslationModal();
		return false;
	});
	button.addEventListener("click", () => {
		updateSettings({
			outgoingMessages: {
				enabled: !settings.outgoingMessages.enabled,
			},
		});
	});

	buttons.appendChild(button);

	addOutgoingTranslateButtonTooltip(button);
}

export function addSettingsModal() {
	const modalContainer = document.querySelector("#modalContainer")!;
	const modal = document.createElement("div");
	modal.id = "yno-translate-modal";
	modal.className = "modal hidden";

	addSettingsTitle(modal, "YNO Translate Settings", 2);

	const closeButton = document.createElement("button");
	closeButton.className = "modalClose iconButton";
	closeButton.innerText = "✖";
	closeButton.addEventListener("click", () => {
		modal.classList.remove("fadeIn");
		modal.classList.add("fadeOut");
	});
	modal.appendChild(closeButton);

	addSettingsTitle(modal, "Translate outgoing messages", 3);
	addSettingsEnabledCheckbox(
		modal,
		"outgoingMessages",
		"Automatically translate sent messages"
	);
	addTargetLanguageSelector(modal, "outgoingMessages");

	addSettingsTitle(modal, "Translate incoming messages", 3);
	addSettingsEnabledCheckbox(
		modal,
		"incomingMessages",
		"Translate received messages"
	);
	addTargetLanguageSelector(modal, "incomingMessages");

	modalContainer.appendChild(modal);
}
type SettingsKeysWith<T> = {
	[k in keyof Settings]: Settings[k] extends T ? k : never;
}[keyof Settings];

function addSettingsEnabledCheckbox<
	K extends SettingsKeysWith<{ enabled: boolean }>
>(modal: HTMLDivElement, key: K, label: string) {
	const labelElement = document.createElement("label");
	labelElement.innerText = label;
	labelElement.htmlFor = `${key}EnabledCheckbox`;
	modal.appendChild(labelElement);

	// mom can we have react?
	// no we have react at home
	// react at home:
	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.checked = settings[key].enabled;
	checkbox.name = `${key}EnabledCheckbox`;
	checkbox.addEventListener("change", () => {
		updateSettings({
			[key]: {
				enabled: checkbox.checked,
			},
		});
	});
	addSettingsListener((newSettings) => {
		checkbox.checked = newSettings[key].enabled;
	});
	modal.appendChild(checkbox);
}

function addSettingsTitle(modal: HTMLDivElement, title: string, level: number) {
	const titleElement = document.createElement(`h${level}`);
	titleElement.innerText = title;
	modal.appendChild(titleElement);
}

function addTargetLanguageSelector<
	K extends SettingsKeysWith<{ targetLanguage: LanguageCode }>
>(modal: HTMLDivElement, key: K) {
	const targetLanguageLabel = document.createElement("label");
	targetLanguageLabel.innerText = "Target language";
	modal.appendChild(targetLanguageLabel);

	const targetLanguageSelect = document.createElement("select");
	targetLanguageSelect.id = "targetLanguageSelect";

	// add options
	Object.entries(LANGUAGES).forEach(([code, language]) => {
		const option = document.createElement("option");
		option.value = code;
		option.innerText = language;
		targetLanguageSelect.appendChild(option);
	});
	targetLanguageSelect.value = settings[key].targetLanguage;
	targetLanguageSelect.addEventListener("change", () => {
		updateSettings({
			[key]: {
				targetLanguage: targetLanguageSelect.value,
			},
		});
	});
	addSettingsListener((newSettings) => {
		targetLanguageSelect.value = newSettings[key].targetLanguage;
	});
	modal.appendChild(targetLanguageSelect);
}

export function openTranslationModal() {
	const modalContainer = document.querySelector("#modalContainer")!;
	modalContainer.classList.remove("hidden");

	const modal = document.querySelector("#yno-translate-modal")!;
	modal.classList.remove("hidden", "fadeOut");
	modal.classList.add("fadeIn");
}

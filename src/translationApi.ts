import { sendHttpGetRequest } from "./utils";

/**
 * @link https://github.com/Vendicated/Vencord/tree/main/src/plugins/translate
 */
export const LANGUAGES = {
	af: "Afrikaans",
	sq: "Albanian",
	am: "Amharic",
	ar: "Arabic",
	hy: "Armenian",
	as: "Assamese",
	ay: "Aymara",
	az: "Azerbaijani",
	bm: "Bambara",
	eu: "Basque",
	be: "Belarusian",
	bn: "Bengali",
	bho: "Bhojpuri",
	bs: "Bosnian",
	bg: "Bulgarian",
	ca: "Catalan",
	ceb: "Cebuano",
	ny: "Chichewa",
	"zh-CN": "Chinese (Simplified)",
	"zh-TW": "Chinese (Traditional)",
	co: "Corsican",
	hr: "Croatian",
	cs: "Czech",
	da: "Danish",
	dv: "Dhivehi",
	doi: "Dogri",
	nl: "Dutch",
	en: "English",
	eo: "Esperanto",
	et: "Estonian",
	ee: "Ewe",
	tl: "Filipino",
	fi: "Finnish",
	fr: "French",
	fy: "Frisian",
	gl: "Galician",
	ka: "Georgian",
	de: "German",
	el: "Greek",
	gn: "Guarani",
	gu: "Gujarati",
	ht: "Haitian Creole",
	ha: "Hausa",
	haw: "Hawaiian",
	iw: "Hebrew",
	hi: "Hindi",
	hmn: "Hmong",
	hu: "Hungarian",
	is: "Icelandic",
	ig: "Igbo",
	ilo: "Ilocano",
	id: "Indonesian",
	ga: "Irish",
	it: "Italian",
	ja: "Japanese",
	jw: "Javanese",
	kn: "Kannada",
	kk: "Kazakh",
	km: "Khmer",
	rw: "Kinyarwanda",
	gom: "Konkani",
	ko: "Korean",
	kri: "Krio",
	ku: "Kurdish (Kurmanji)",
	ckb: "Kurdish (Sorani)",
	ky: "Kyrgyz",
	lo: "Lao",
	la: "Latin",
	lv: "Latvian",
	ln: "Lingala",
	lt: "Lithuanian",
	lg: "Luganda",
	lb: "Luxembourgish",
	mk: "Macedonian",
	mai: "Maithili",
	mg: "Malagasy",
	ms: "Malay",
	ml: "Malayalam",
	mt: "Maltese",
	mi: "Maori",
	mr: "Marathi",
	"mni-Mtei": "Meiteilon (Manipuri)",
	lus: "Mizo",
	mn: "Mongolian",
	my: "Myanmar (Burmese)",
	ne: "Nepali",
	no: "Norwegian",
	or: "Odia (Oriya)",
	om: "Oromo",
	ps: "Pashto",
	fa: "Persian",
	pl: "Polish",
	pt: "Portuguese",
	pa: "Punjabi",
	qu: "Quechua",
	ro: "Romanian",
	ru: "Russian",
	sm: "Samoan",
	sa: "Sanskrit",
	gd: "Scots Gaelic",
	nso: "Sepedi",
	sr: "Serbian",
	st: "Sesotho",
	sn: "Shona",
	sd: "Sindhi",
	si: "Sinhala",
	sk: "Slovak",
	sl: "Slovenian",
	so: "Somali",
	es: "Spanish",
	su: "Sundanese",
	sw: "Swahili",
	sv: "Swedish",
	tg: "Tajik",
	ta: "Tamil",
	tt: "Tatar",
	te: "Telugu",
	th: "Thai",
	ti: "Tigrinya",
	ts: "Tsonga",
	tr: "Turkish",
	tk: "Turkmen",
	ak: "Twi",
	uk: "Ukrainian",
	ur: "Urdu",
	ug: "Uyghur",
	uz: "Uzbek",
	vi: "Vietnamese",
	cy: "Welsh",
	xh: "Xhosa",
	yi: "Yiddish",
	yo: "Yoruba",
	zu: "Zulu",
} as const satisfies Record<string, string>;
export type LanguageCode = keyof typeof LANGUAGES;
export type LanguageName = (typeof LANGUAGES)[LanguageCode];

type TranslationData = {
	sentences: { trans: string }[];
	src: string;
};
export type FlattenedTranslationData = {
	translation: string;
	src: string;
};

export default async function translate(
	targetLanguage: string,
	text: string
): Promise<FlattenedTranslationData> {
	const { sentences, src } = await sendHttpGetRequest<TranslationData>(
		`https://translate.googleapis.com/translate_a/single?${new URLSearchParams(
			{
				client: "gtx",
				sl: "auto",
				tl: targetLanguage,
				dt: "t",
				dj: "1",
				source: "input",
				q: text,
			}
		).toString()}`
	);
	return {
		translation: sentences.map((sentence) => sentence.trans).join(" "),
		src,
	};
}

let debounce = 0;
const start = Date.now();

export function shouldDebounce(): boolean {
	// debounce translation requests
	if (Date.now() - start < 5000 || Date.now() - debounce < 1000) {
		return true;
	}
	debounce = Date.now();
	return false;
}

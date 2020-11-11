import { prompt } from "enquirer";
import fs from "fs-extra";
import path from "path";
import { createEmojiList, UnicodeVersion } from "./createEmojiList";
import { translateEmojiList } from "./translateEmojiList";

const UNICODE_VERSIONS = [
	{ name: "4.0", message: "v4.0" },
	{ name: "5.0", message: "v5.0" },
	{ name: "11.0", message: "v11.0" },
	{ name: "12.0", message: "v12.0" },
	{ name: "12.1", message: "v12.1" },
	{ name: "13.0", message: "v13.0" },
	{ name: "13.1", message: "v13.1" },
];

const Features = {
	ShortCodes: 'Short code (e.g. "smile")',
	Descriptions: 'Description (e.g. "grinning face with smiling eyes")',
	Modifiers: "Modifiers (e.g. if an emojis skin tone can be modified)",
};

start().catch(console.error);

async function start(): Promise<void> {
	const { version } = await prompt<{ version: UnicodeVersion }>({
		type: "select",
		name: "version",
		message: "What version of Unicode should the list be?",
		// @ts-expect-error
		choices: UNICODE_VERSIONS,
		initial: UNICODE_VERSIONS[UNICODE_VERSIONS.length - 1].name,
	});

	const { shouldBeTranslated } = await prompt<{ shouldBeTranslated: boolean }>({
		type: "toggle",
		name: "shouldBeTranslated",
		message:
			"Should emoji descriptions be translated (requires Google Cloud Credentials)?",
		// @ts-expect-error
		enabled: "Yes",
		disabled: "No",
	});

	let targetLanguage = "en";

	if (shouldBeTranslated) {
		const { lang } = await prompt<{ lang: string }>({
			type: "input",
			name: "targetLanguage",
			message: "What language should the emoji descriptions be in?",
			initial: Intl.DateTimeFormat().resolvedOptions().locale.substring(0, 2),
		});

		targetLanguage = lang;
	}

	const { selectedFeatures } = await prompt<{ selectedFeatures: string[] }>({
		type: "multiselect",
		name: "selectedFeatures",
		message: "What information should the emojis have?",
		choices: Object.entries(Features).map(([, description]) => ({
			name: description,
		})),
	});

	let emojiList = await createEmojiList({
		unicodeVersion: version,
		features: { shortCodes: selectedFeatures.includes(Features.ShortCodes) },
	});

	if (targetLanguage !== "en") {
		emojiList = await translateEmojiList({
			emojiList,
			targetLanguage,
		});
	}

	const addShortCodes = selectedFeatures.includes(Features.ShortCodes);
	const addDescriptions = selectedFeatures.includes(Features.Descriptions);
	const addModifiers = selectedFeatures.includes(Features.Modifiers);

	const mappedEmojis = emojiList.map((category) => ({
		...category,
		emojis: category.emojis.map(
			({ emoji, description, modifiers, shortCode }) => {
				if (!addDescriptions && !addShortCodes && !addModifiers) {
					return emoji;
				}

				const emojiData = [
					emoji,
					addDescriptions && description,
					addShortCodes && shortCode?.join(),
					addModifiers &&
						modifiers.map((mod) => (mod === "skin-tone" ? "s" : "")).join(""),
				].filter((e) => e !== false);

				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				while (!emojiData[emojiData.length - 1]) {
					// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
					emojiData.pop();
				}

				return emojiData;
			}
		),
	}));

	await fs.outputJson(
		path.resolve(`emojis-${targetLanguage}-v${version}.json`),
		mappedEmojis
	);
}

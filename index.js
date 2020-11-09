const path = require("path");
require("dotenv").config({ path: path.resolve(".env.local") });
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const fs = require("fs");
const { TranslationServiceClient } = require("@google-cloud/translate");

fetch("http://www.unicode.org/emoji/charts/full-emoji-list.html")
	.then((response) => response.text())
	.then(extractEmojiData);

async function extractEmojiData(html) {
	const { window } = new JSDOM(html);
	const { document } = window;

	const tableRows = [...document.querySelectorAll("table tr")];

	const emojiList = [];

	for (const row of tableRows) {
		const heading = row.querySelector("th.bighead a");

		if (heading) {
			emojiList.push({
				category: heading.textContent,
				emojis: [],
			});
		} else if (row.children[2]?.className === "chars") {
			emojiList[emojiList.length - 1]?.emojis.push([
				row.children[2].textContent,
				row.children[row.children.length - 1].textContent,
			]);
		}
	}

	const categoryNames = emojiList.map((category) => category.category);
	const translatedCategoryMap = await batchTranslate({
		input: categoryNames,
		targetLanguage: process.env.TARGET_LANGUAGE,
	});

	const promises = emojiList.map(async (category) => {
		category.category =
			translatedCategoryMap.get(category.category) || category.category;

		const emojiDescriptions = category.emojis.map(
			([, description]) => description
		);
		const translatedDescriptionsMap = await batchTranslate({
			input: emojiDescriptions,
			targetLanguage: process.env.TARGET_LANGUAGE,
		});

		category.emojis.forEach((emoji) => {
			const translatedDescription = translatedDescriptionsMap.get(emoji[1]);

			if (translatedDescription) {
				emoji[1] =
					translatedDescription.charAt(0).toUpperCase() +
					translatedDescription.slice(1);
			}
		});
	});

	await Promise.all(promises);

	fs.writeFileSync(
		path.resolve(`emojis-${process.env.TARGET_LANGUAGE}.json`),
		JSON.stringify(emojiList)
	);
}

const translationClient = new TranslationServiceClient();

/**
 * Translates an array of strings into a map that has the inital values as its
 * keys and the translations as its values.
 */
async function batchTranslate({ input, targetLanguage }) {
	const [response] = await translationClient.translateText({
		parent: `projects/${process.env.GCLOUD_PROJECT_ID}/locations/global`,
		contents: input,
		mimeType: "text/plain",
		sourceLanguageCode: "en",
		targetLanguageCode: targetLanguage,
	});

	const translationMap = new Map();

	response.translations.forEach((translation, i) => {
		translationMap.set(input[i], translation.translatedText);
	});

	return translationMap;
}

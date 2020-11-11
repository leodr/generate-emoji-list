import { TranslationServiceClient } from "@google-cloud/translate";
import { Emoji, EmojiList } from "./emojiListTypes";

interface TranslateEmojiListOptions<T> {
	emojiList: T;
	targetLanguage: string;
}

export async function translateEmojiList<T extends EmojiList<Emoji>>({
	emojiList,
	targetLanguage,
}: TranslateEmojiListOptions<T>): Promise<T> {
	const clonedEmojiList = JSON.parse(JSON.stringify(emojiList)) as T;

	if (targetLanguage === "en") return clonedEmojiList;

	const categoryNames = clonedEmojiList.map((category) => category.category);

	const translatedCategoryMap = await batchTranslate({
		input: categoryNames,
		targetLanguage,
	});

	const promises = clonedEmojiList.map(async (category) => {
		category.category =
			translatedCategoryMap.get(category.category) ?? category.category;

		const emojiDescriptions = category.emojis.map(
			({ description }) => description
		);
		const translatedDescriptionsMap = await batchTranslate({
			input: emojiDescriptions,
			targetLanguage,
		});

		category.emojis.forEach((emoji) => {
			const translatedDescription = translatedDescriptionsMap.get(
				emoji.description
			);

			if (translatedDescription !== undefined) {
				emoji.description =
					translatedDescription.charAt(0).toUpperCase() +
					translatedDescription.slice(1);
			}
		});
	});

	await Promise.all(promises);

	return clonedEmojiList;
}

interface BatchTranslateOptions {
	input: string[];
	targetLanguage: string;
}

const translationClient = new TranslationServiceClient();

/**
 * Translates an array of strings into a map that has the inital values as its
 * keys and the translations as its values.
 */
export async function batchTranslate({
	input,
	targetLanguage,
}: BatchTranslateOptions): Promise<Map<string, string>> {
	const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

	if (typeof credentialsPath !== "string") {
		throw Error(
			"The path to Google Cloud Application credentials is not available under the `GOOGLE_APPLICATION_CREDENTIALS` environment variable."
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const projectId = require(credentialsPath).project_id as string;

	const [response] = await translationClient.translateText({
		parent: `projects/${projectId}/locations/global`,
		contents: input,
		mimeType: "text/plain",
		sourceLanguageCode: "en",
		targetLanguageCode: targetLanguage,
	});

	const translationMap = new Map();

	response.translations?.forEach((translation, i) => {
		translationMap.set(input[i], translation.translatedText);
	});

	return translationMap;
}

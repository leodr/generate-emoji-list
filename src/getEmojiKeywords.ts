import cldrAnnotations from "cldr-annotations-modern/annotations/en/annotations.json";
import { Emoji } from "./emojiListTypes";

interface Annotations {
	[key: string]: { default: string[] };
}

/**
 * Returns a map with emojis as its key and the corresponding keywords as its
 * value.
 */
export function getEmojiKeywords(emojis: Emoji[]): Map<string, string[]> {
	const annotations = cldrAnnotations.annotations.annotations as Annotations;
	const keywordsMap = new Map<string, string[]>();
	emojis.forEach(({ emoji }) => {
		const keywords = annotations[emoji]?.default ?? [];
		keywordsMap.set(emoji, keywords);
	});
	return keywordsMap;
}

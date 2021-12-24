import fetch from "isomorphic-unfetch";
import { Emoji, EmojiList } from "./emojiListTypes";
import { getEmojiKeywords } from "./getEmojiKeywords";
import { getEmojiShortCodes } from "./getEmojiShortCodes";

interface CreateEmojiListOptions {
	unicodeVersion?: UnicodeVersion;
	features?: {
		shortCodes: boolean;
		keywords: boolean;
	};
}

export async function createEmojiList(
	options?: CreateEmojiListOptions
): Promise<EmojiList<Emoji>> {
	const {
		unicodeVersion = "13.0",
		features = { shortCodes: true, keywords: true },
	} = options ?? {};

	const emojiList = await getEmojiList(unicodeVersion);

	const shortCodeMap = features.shortCodes
		? await getEmojiShortCodes()
		: undefined;

	const keywords = features.keywords
		? getEmojiKeywords(emojiList.flatMap((l) => l.emojis))
		: undefined;

	return emojiList.map((category) => ({
		...category,
		emojis: category.emojis.map(({ emoji, ...rest }) => ({
			emoji,
			...rest,
			shortCode:
				shortCodeMap !== undefined ? shortCodeMap.get(emoji) ?? [] : undefined,
			keywords: keywords !== undefined ? keywords.get(emoji) : undefined,
		})),
	}));
}

export type UnicodeVersion =
	| "4.0"
	| "5.0"
	| "11.0"
	| "12.0"
	| "12.1"
	| "13.0"
	| "13.1";

const LINE_REGEX = /^.*?; fully-qualified\s+# (.*?) (?:E\d+\.\d+ )?(.*)$/;
const GROUP_REGEX = /^# group: (.*?)$/;

export async function getEmojiList(
	unicodeVersion: UnicodeVersion
): Promise<EmojiList<Emoji>> {
	const response = await fetch(
		`https://unicode.org/Public/emoji/${unicodeVersion}/emoji-test.txt`
	);
	const content = (await response.text()) as string;

	const lines = content.replace(/\r/g, "").split(/\n/);

	const categories: EmojiList<Emoji> = [];

	for (const line of lines) {
		const groupMatch = line.match(GROUP_REGEX);

		if (groupMatch !== null) {
			categories.push({
				category: groupMatch[1],
				emojis: [],
			});
		} else {
			const emojiMatch = line.match(LINE_REGEX);

			if (emojiMatch !== null) {
				const [, emoji, description] = emojiMatch;

				const currentCategory = categories[categories.length - 1];

				/**
				 * Don't add emojis that have modified skin-tone but add a `s`-
				 * modifier to the modifiable emoji, so we can modify it in an
				 * emoji picker.
				 */
				if (description.includes("skin tone")) {
					const lastEmoji =
						currentCategory.emojis[currentCategory.emojis.length - 1];

					if (!lastEmoji.modifiers.includes("skin-tone")) {
						lastEmoji.modifiers.push("skin-tone");
					}
				} else {
					currentCategory.emojis.push({
						emoji,
						description,
						modifiers: [],
					});
				}
			}
		}
	}

	return categories.filter((category) => category.emojis.length > 0);
}

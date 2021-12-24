<div align="center">
    <p align="center">
        <h1 align="center"><img src="https://raw.githubusercontent.com/leodr/generate-emoji-list/main/assets/logo.png" width="500px" alt="generate-emoji-list" /></h1>
    </p>
    <p align="center">
        Generate a comprehensive list of all <a href="https://unicode.org/emoji/charts/full-emoji-list.html">Unicode Emojis</a> in any language.
    </p>
    <p align="center">
        <img alt="NPM Version" src="https://img.shields.io/npm/v/generate-emoji-list?style=for-the-badge" />
        <img alt="GitHub" src="https://img.shields.io/github/license/leodr/generate-emoji-list?style=for-the-badge">
        <img alt="GitHub issues" src="https://img.shields.io/github/issues-raw/leodr/generate-emoji-list?style=for-the-badge">
    </p>
</div>

---

All emoji-data is pulled from the official
[Unicode Emoji lists](https://unicode.org/Public/emoji/) and converted into
JSON. Optionally category names and emoji descriptions can easily be translated
into a target language using the
[Google Cloud Translation API](https://cloud.google.com/translate).

Several precompiled lists can be found in the `lists/` folder.

## Overview

-   [Using the CLI to Generate a Fresh List](#using-the-cli-to-generate-a-fresh-list)
    -   [Generate the List in a Different Language](#generate-the-list-in-a-different-language)
-   [Using the JavaScript-API](#using-the-javascript-api)
    -   [Generating an English Emoji List](#generating-an-english-emoji-list)
    -   [Translating an English Emoji List Into Another Language](#translating-an-english-emoji-list-into-another-language)

## Using the CLI to Generate a Fresh List

The CLI can easily be used by executing it with `npx`:

```bash
npx generate-emoji-list
```

It will ask you about the Unicode-version, features and language of your list.

### Generate the List in a Different Language

If you want the list descriptions and category names to be translated into a
non-english language you have to specify the path of a Google Application
Credentials file under the `GOOGLE_APPLICATION_CREDENTIALS` environment
variable. The official documentation for that can be found
[here](https://cloud.google.com/docs/authentication/getting-started).

The [Cloud Translation API](https://cloud.google.com/translate) has to be active
for the project you are using.

> The free quota for translations should be enough for generating several lists,
> so you do not have to worry about costs.

## Using the JavaScript-API

The methods for generating emoji lists are available via a JavaScript API.

### Generating an English Emoji List

The `createEmojiList`-method works both with Node.js and in the browser.

You can use it like the following:

```js
// ESM
import { createEmojiList } from "generate-emoji-list";

// CJS
const { createEmojiList } = require("generate-emoji-list");

const emojiList = await createEmojiList({
    unicodeVersion: "13.0",
    features: { shortCodes: true, keywords: true },
});
```

The `unicodeVersion` has to be one of our supported Versions of the Unicode
standard, which currently are:

```ts
type UnicodeVersion =
    | "4.0"
    | "5.0"
    | "11.0"
    | "12.0"
    | "12.1"
    | "13.0"
    | "13.1";
```

When the `shortCodes`-feature is activated, an HTTP-Request will be made to the
[GitHub Emoji API](https://api.github.com/emojis) to add short codes to the
emojis (e.g. zap for ⚡️).

### Translating an English Emoji List Into Another Language

The `translateEmojiList`-method can be used to translate an english list into a
specified language.

The Google Cloud Translation API will be used for translating the strings into
another language, so make sure you have
[set up](https://cloud.google.com/docs/authentication/getting-started) your
`GOOGLE_APPLICATION_CREDENTIALS` environment variable corrently and the Cloud
Translation API is enabled for your Google Cloud project.

> This method only works with Node.js, it will not work in the browser.

```js
// ESM
import { createEmojiList, translateEmojiList } from "generate-emoji-list";

// CJS
const { createEmojiList, translateEmojiList } = require("generate-emoji-list");

const emojiList = await createEmojiList({
    unicodeVersion: "13.0",
    features: { shortCodes: true, keywords: true },
});

const germanEmojiList = await translateEmojiList({
    emojiList,
    targetLanguage: "de",
});
```

The `targetLanguage`-parameter takes an
[ISO-639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

<div align="center">
    <h1>Emoji List Generator</h1>
    <p>
        Creates a JSON-file of all emojis based on the <a href="http://www.unicode.org/emoji/charts/full-emoji-list.html">Unicode Emoji List</a>
        with their descriptions in a target language.
    </p>
</div>

---

All emoji-data is pulled from the official unicode-list, converted into JSON and
then categories and emoji descriptions are translated into a target language
with the [Google Cloud Translation API](https://cloud.google.com/translate).

> You can look at an example list of emojis in `emojis-de.json`.

## Generating Your Own Fresh List

A german list for Unicode v13 is available in `emojis-de.json`, but if you want
to generate a new version of the list or use a different language, here's how:

#### 1. Clone the Project

#### 2. Install the dependencies

```bash
# Yarn
yarn install

# NPM
npm install
```

#### 3. Set up a new Google Cloud project

#### 4. Activate the Cloud Translation API and generate a service account

The free quota of the Cloud Translation API should be enough to generate a few
lists.

#### 5. Set up environment variables

Rename the `.env.template`-file to `.env.local`

Now replace the placeholder values with your own. The values are as following:

| Value                          | Description                                                                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| GOOGLE_APPLICATION_CREDENTIALS | The absolute path to your [Google Cloud Credentials JSON-File](https://cloud.google.com/docs/authentication/production) |
| GCLOUD_PROJECT_ID              | The id of your Google Cloud project                                                                                     |
| TARGET_LANGUAGE                | The [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) code of your target language                     |

#### 6. Run the `start` script

```bash
# Yarn
yarn start

# NPM
npm start
```

The script will generate a `emojis-*.json`-file in the root of your project that
contains a list of all current emojis with descriptions, sorted by category.

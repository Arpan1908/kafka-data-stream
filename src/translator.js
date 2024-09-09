const { Translate } = require('@google-cloud/translate').v2;

const translate = new Translate();

async function translateText(text, targetLanguage = 'es') {
  const [translation] = await translate.translate(text, targetLanguage);
  return translation;
}

module.exports = { translate: translateText };
import { containerBootstrap } from '@nlpjs/core';
import { Nlp } from '@nlpjs/nlp';
import { LangEn } from '@nlpjs/lang-en-min';
import fs from 'fs/promises';

export const translate = async (userText) => {
  // reads the json file 
  // TODO: Make it so the answers aren't static and can be imported from the scrapped data into an answers.json
  const answers = JSON.parse(
    await fs.readFile(
      new URL('./db/defaultAnswers.json', import.meta.url)
    )
  )

  // creates the nlp instance used to translate text
  const container = await containerBootstrap();
  container.use(Nlp);
  container.use(LangEn);
  const nlp = container.get('nlp');
  nlp.settings.autoSave = false;
  await nlp.addCorpus(answers);
  await nlp.train();
  const response = await nlp.process('en', userText);
  //console.log(response.answer);
  return response.answer;
};
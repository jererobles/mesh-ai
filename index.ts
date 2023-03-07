import Chat, { SEARCH_CUE } from "./models/gpt-3.5.js";

import { searchGoogle } from "./apis/google.js";
import WebsiteToMarkdown, { WebsiteResult } from "./apis/website.js";

import Summarizer from "./personas/summarizer.js";
import Categorizer from "./personas/categorizer.js";
import Analyzer from "./personas/analyzer.js";
import Responder from "./personas/responder.js";
import { GptResponse } from "./apis/gpt.js";

/**
 * The main function of the program, there are countless edge cases that are not handled :P
 */
const main = async () => {
  const categorizer = new Chat(Categorizer); // not really used, just for show
  const summarizer = new Chat(Summarizer);
  const analyzer = new Chat(Analyzer);
  const responder = new Chat(Responder);

  const webToMd = new WebsiteToMarkdown();

  while (true) {
    const input = (prompt("[>]") || "") + "\n";

    await Promise.all([
      categorizer.send(input, -1), // -1 to disable printing
      summarizer.send(input, -1), // -1 to disable printing
      analyzer.send(input, 1000), // 1000 to wait 1 second before printing
    ]).then(async (results) => {
      const [category, summary, analysis] = results;

      if (analysis.dropped) {
        if (analysis.text === SEARCH_CUE) {
          // the assistant wants to search the web, so we use the response from the summarizer as the search query
          if (!category.dropped) console.debug(`✅ Topic: ${category.text}`);
          if (!summary.dropped)
            console.debug(`🔍 Searching the web for: ${summary.text}`);

          const links = await searchGoogle(summary.text);
          console.log("🔗 Found 10 sources:", links);

          // TODO: read more than one link
          console.log("🤓 Reading...");
          const parsedSite = await webSynth.call(links[1]);

          // FIXME: in some occasions the token limit is exceeded and the error response is not handled
          const webPrompt = `Use your knowledge and the following text to tell me about ${summary.text}:\n"""${parsedSite}"""\n`;
          const response = await responder.gpt(webPrompt, 0);
          await response.doneTyping;
        } else {
          console.error(analysis.text);
        }
      } else {
        // the assistant has an answer that requires no web search, so we wait for typing animation to finish
        await analysis.doneTyping;
      }
    });
  }
};

main();

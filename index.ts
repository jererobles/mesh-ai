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

          const searchResultLinks = await searchGoogle(summary.text);
          console.log("🔗 Found 10 sources:", searchResultLinks);

          // TODO: read more than a few links
          console.log("📖 Fetching...");
          await Promise.allSettled([
            webToMd.fetch(searchResultLinks[0]),
            webToMd.fetch(searchResultLinks[1]),
            webToMd.fetch(searchResultLinks[2]),
            webToMd.fetch(searchResultLinks[3]),
            webToMd.fetch(searchResultLinks[4]),
          ]).then(async (webResults) => {
            // use Responder to parse the text, return a promise that resolves to the parsed text
            const responsePromises: Promise<GptResponse>[] = [];
            webResults.forEach((result) => {
              // console.log(result);
              if (result.status === "fulfilled") {
                const webPrompt = `Use your knowledge and the following text to tell me about ${summary.text}:\n"""${result.value.content}"""\n`;
                responsePromises.push(responder.send(webPrompt, -1));
              }
            });

            console.log("🤓 Reading...");
            await Promise.allSettled(responsePromises).then(
              async (responses) => {
                const gluedResponses = responses
                  .map((response) => {
                    if (response.status === "fulfilled") {
                      return response.value.text;
                    }
                  })
                  .join("\n");
                const finalrompt = `Summarize the following text and make it less repetitive:\n"""${gluedResponses}"""\n`;
                const b = await responder.send(gluedResponses, 0);
                await b.doneTyping;
              }
            );
            // FIXME: in some occasions the token limit is exceeded and the error response is not handled
          });
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

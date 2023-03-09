import Chat, { SEARCH_CUE } from "./models/gpt-3.5.js";

import { searchGoogle } from "./apis/google.js";
import WebsiteToMarkdown from "./apis/website.js";

import Summarizer from "./agents/Summarizer.js";
import Categorizer from "./agents/Categorizer.js";
import Analyzer from "./agents/Analyzer.js";
import Responder from "./agents/Responder.js";
import UserAgent from "./agents/UserAgent.js";

/**
 * The main function of the program, there are countless edge cases that are not handled :P
 * FIXME: multiple nested promises are hard to read, refactor this into a more readable format
 */
const main = async () => {
  const categorizer = new Chat(Categorizer); // not really used, just for show
  const summarizer = new Chat(Summarizer);
  const analyzer = new Chat(Analyzer);

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
          console.log("📖 Reading...");
          await Promise.allSettled([
            webToMd.fetch(searchResultLinks[0]),
            webToMd.fetch(searchResultLinks[1]),
            webToMd.fetch(searchResultLinks[2]),
            webToMd.fetch(searchResultLinks[3]),
            webToMd.fetch(searchResultLinks[4]),
          ]).then(async (websitesInMarkdown) => {
            await Promise.allSettled(
              websitesInMarkdown.flatMap((websiteResultPromise) => {
                if (
                  websiteResultPromise.status === "fulfilled" &&
                  websiteResultPromise.value.content.trim() !== ""
                ) {
                  const websiteMarkdown = websiteResultPromise.value.content;
                  const webPrompt = `Use the following text to tell me about ${summary.text}:\n"""${websiteMarkdown}"""\nDo not use your prior knowledge to answer, if you can't answer with the text I provided simply return an empty string.\n`;
                  const responder = new Chat(UserAgent);
                  return responder.send(webPrompt, -1);
                } else {
                  return [];
                }
              })
            ).then(async (gptResponses) => {
              console.log("🤓 Summarizing...");
              const resolvedResponses = gptResponses.map((response) => {
                if (
                  response.status === "fulfilled" &&
                  response.value.dropped === false &&
                  response.value.text.trim() !== ""
                ) {
                  return response.value.text;
                }
                return "";
              });

              const finalPrompt = `Read through the following bullet points and combine them in a single answer, keeping only those that are the most relevant about ${
                summary.text
              }:\n"""${resolvedResponses.join("\n")}"""\n`;

              const responder = new Chat(Responder);
              const b = await responder.send(finalPrompt, 0);
              await b.doneTyping;
            });
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

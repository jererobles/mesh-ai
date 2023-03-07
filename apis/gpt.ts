// FIXME: this file does too much stuff

import * as https from "node:https";
import { SEARCH_CUE } from "../models/gpt-3.5.js";
import { printDelayed } from "../other/printDelayed.js";

// promise type holding the full text from the response and another promise that resolves when the response is done printing
export type GptResponse = {
  text: string;
  dropped: boolean;
  doneTyping: Promise<void>;
};

// fetch token from .env file
const OPENAI_API_TOKEN = process.env.OPENAI_API_TOKEN;

const PATH = "/v1/chat/completions";

const getRequestHeaders = () => ({
  // some headers that are usually sent from the browser
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
  "Sec-ch-ua": '"Not A(Brand";v="24", "Chromium";v="110"',
  "Sec-ch-ua-mobile": "?0",
  "Sec-ch-ua-platform": '"macOS"',
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",

  // noticed that the response is different when these headers are not sent
  Origin: "https://platform.openai.com",
  Referer: "https://platform.openai.com/",

  // headers that are needed by the API
  "Content-Type": "application/json",
  Accept: "text/event-stream",
  Authorization: "Bearer " + OPENAI_API_TOKEN,
});

const gpt = async (payload: any, printDelay = -1): Promise<GptResponse> => {
  const printQueue: NodeJS.Timeout[] = [];
  const clearPrintQueue = () =>
    printQueue.forEach((timeout) => clearTimeout(timeout));

  const print = (
    text: string,
    chunkNumber: number,
    fn?: (() => void) | undefined
  ) =>
    printDelay > -1 &&
    printQueue.push(
      setTimeout(() => printDelayed(text, chunkNumber, fn), printDelay)
    );

  // construct promise that will resolve when the response is received
  const promise = new Promise<GptResponse>((resolve, reject) => {
    // construct promise that will resolve when the response is done printing
    let resolvePrintingPromise: () => void;
    const printingDone = new Promise<void>(
      (resolvePrinting) => (resolvePrintingPromise = resolvePrinting)
    );

    try {
      const body = JSON.stringify(payload);
      // console.log("body", body);

      const req = https.request({
        protocol: "https:",
        hostname: "api.openai.com",
        port: 443,
        path: PATH,
        method: "POST",
        headers: getRequestHeaders(),
      });

      let chunks = 0;
      let result = "";
      req.on("response", (res) => {
        // the server sends the response in chunks, so we need to collect them and then parse
        // this event is fired when the server sends the first chunk of data
        print("💬 ", chunks);

        const TOKEN_BGN = 'data: {"';
        const TOKEN_END = '"}]}\n\ndata: [DONE]\n\n';
        let buffer = "";

        res.on("error", (e) => {
          if (e.message !== SEARCH_CUE) {
            // the request failed
            console.error("RES: error:" + e.message);
          } else {
            // the request was cancelled because the user asked to search
            // console.log("RES: was cancelled because the user asked to search");
          }
          resolve({ text: result, dropped: true, doneTyping: printingDone });
          resolvePrintingPromise();
        });

        res.on("data", function (chunk) {
          // we just received a new chunk of data
          // this event is fired multiple times until the response is complete
          buffer += chunk.toString();

          const allLines = buffer.split(TOKEN_BGN);
          const entireLines = allLines.filter(
            (line) => line.length > 0 && line.endsWith("\n\n")
          );
          if (entireLines.length === 0) {
            return;
          }
          buffer = allLines.slice(entireLines.length).join(TOKEN_BGN);
          for (const line of entireLines) {
            const message =
              TOKEN_BGN.slice(-2) +
              line
                .replace(TOKEN_END, TOKEN_END.slice(0, 4))
                .replace(/\n\n$/, "");
            try {
              const parsed = JSON.parse(message);
              const text = parsed.choices[0]?.delta?.content || "";
              result += text;
              if (result.includes(SEARCH_CUE)) {
                clearPrintQueue();
                result = SEARCH_CUE;
                res.destroy(new Error(SEARCH_CUE));
                return;
              }
              print(text, chunks++);
            } catch (error) {
              console.error(
                "Could not JSON parse stream message",
                message,
                error
              );
            }
          }
        });

        res.on("end", () => {
          // the server has finished sending the response, now the request is complete
          resolve({ text: result, dropped: false, doneTyping: printingDone });

          // the last chunk however will be printed with a delay, so we resolve the printingDone promise after that
          if (printDelay > -1) {
            print("\n", chunks++, () => resolvePrintingPromise());
          } else {
            resolvePrintingPromise();
          }
        });
      });

      req.on("error", (e) => {
        // the request failed
        console.error("CONN: error:" + e.message);

        resolve({ text: result, dropped: true, doneTyping: printingDone });
        resolvePrintingPromise();
      });

      // send the request
      req.end(body);
    } catch (error) {
      console.error("General error", error);
    }
  });

  return promise;
};

export default gpt;

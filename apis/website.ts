// FIXME: handle errors more gracefully maybe instead of bubbling them to the main loop

import { NodeHtmlMarkdown, TranslatorConfigObject } from "node-html-markdown";
import DOMParser from "dom-parser";

export default class Website {
  private nhm = new NodeHtmlMarkdown(
    {},
    {
      a: {
        content: "", // remove all links
      },
    }
  );

  async call(url: string) {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Dest": "document",
        Referer: url,
        Cookie: "1P_JAR=2021-06-03-08",
      },
    });
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html);
    const [body, main, article] = [
      doc.getElementsByTagName("body"),
      doc.getElementsByTagName("main"),
      doc.getElementsByTagName("article"),
    ];
    const el = article || main || body;
    const target = el ? el[0].innerHTML : html;
    const results = this.nhm.translate(target);
    return results;
  }
}

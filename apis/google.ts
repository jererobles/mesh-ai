// implement a function to make a new search on Google and return the results
// emulate the behavior of the browser including common headers and cookies

import DOMParser from "dom-parser";

export async function searchGoogle(query: string) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
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
      Referer: "https://www.google.com/",
      Cookie: "1P_JAR=2021-06-03-08",
    },
  });
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html);
  const results = doc.getElementsByClassName("yuRUbf") || [];
  const links = results.map((result) => {
    if (!result) return "";
    const a = result.getElementsByTagName("a");
    if (!a) return "";
    return a[0]?.getAttribute("href") || "";
  });
  return links || [];
}

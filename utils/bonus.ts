const { JSDOM } = require("jsdom");
const xml2js = require("xml2js");

export async function getSitemapUrls(sitemapUrl: string) {
  try {
    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(text);

    const urls = result.urlset.url.map((entry: any) => entry.loc[0]);

    return urls;
  } catch (error) {
    console.error("Error fetching or parsing sitemap:", error);
    return [];
  }
}

export async function getWebsiteUrls(baseUrl: string) {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const dom = new JSDOM(text);
    const linkElements = dom.window.document.getElementsByTagName("a");
    const urls = new Set();

    for (let i = 0; i < linkElements.length; i++) {
      const href = linkElements[i].getAttribute("href");
      if (href) {
        const url = new URL(href, baseUrl); // Resolve relative URLs
        if (url.origin === new URL(baseUrl).origin) {
          // Same origin
          urls.add(url.href);
        }
      }
    }

    return Array.from(urls);
  } catch (error) {
    console.error("Error fetching or parsing website:", error);
    return [];
  }
}

export function SplitLargeChunks(text: string, maxChunkSize: number) {
  const content = text?.match(new RegExp(`.{1,${maxChunkSize}}`, "g"));
  return content;
}

export function removeSpaces(text: any) {
  return text.replace(/\s+/g, " ").trim();
}

export const streamText = async (streamTxt: string) => {
  console.log("streamText", streamTxt);
  const stream = new ReadableStream({
    start(controller) {
      function pushData() {
        controller.enqueue(
          "data: " +
            JSON.stringify({
              id: "id",
              object: "object",
              model: "model",
              choices: [
                {
                  index: 0,
                  delta: {
                    content: streamTxt,
                  },
                  finish_reason: "stop",
                },
              ],
            })
        );
        controller.close();
      }
      pushData();
    },
  });
  return stream;
};

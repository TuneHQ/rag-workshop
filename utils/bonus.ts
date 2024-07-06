export async function getSitemapUrls(sitemapUrl: string) {
  try {
    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");

    const urlElements = xmlDoc.getElementsByTagName("url");
    const urls = [];

    for (let i = 0; i < urlElements.length; i++) {
      const locElement = urlElements[i].getElementsByTagName("loc")[0];
      if (locElement) {
        urls.push(locElement.textContent);
      }
    }

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
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    const linkElements = doc.getElementsByTagName("a");
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

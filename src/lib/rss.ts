import Parser from 'rss-parser';

export interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
  isoDate?: string;
}

const parser = new Parser<object, RssItem>({
  customFields: {
    item: ['title', 'link', 'pubDate', 'contentSnippet', 'isoDate'],
  },
});

export async function fetchRssFeed(url: string): Promise<RssItem[]> {
  const feed = await parser.parseURL(url);
  return feed.items;
}

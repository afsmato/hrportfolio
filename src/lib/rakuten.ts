import https from 'node:https';

const RAKUTEN_API_BASE = 'https://openapi.rakuten.co.jp/services/api/BooksTotal/Search/20170404';

export interface RakutenBookItem {
  title: string;
  author: string;
  publisherName: string;
  salesDate: string;
  isbn: string;
  itemCode: string;
  largeImageUrl?: string;
  itemUrl: string;
}

export interface RakutenSearchParams {
  keyword?: string;
  booksGenreId?: string;
  sort?: 'standard' | '-itemPrice' | '+itemPrice' | 'reviewCount' | '-reviewAverage' | 'updateTimestamp';
  page?: number;
  hits?: number;
}

function httpsGet(url: string, headers: Record<string, string>): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Rakuten API error: ${res.statusCode} - ${data}`));
        } else {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

export async function searchRakutenBooks(params: RakutenSearchParams): Promise<RakutenBookItem[]> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  if (!applicationId) throw new Error('RAKUTEN_APPLICATION_ID is not set');
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  if (!accessKey) throw new Error('RAKUTEN_ACCESS_KEY is not set');

  const searchParams = new URLSearchParams({
    applicationId,
    accessKey,
    format: 'json',
    booksGenreId: params.booksGenreId ?? '001004',
    sort: params.sort ?? 'standard',
    page: String(params.page ?? 1),
    hits: String(params.hits ?? 30),
  });

  if (params.keyword) {
    searchParams.set('keyword', params.keyword);
  }

  const siteUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  searchParams.set('referer', siteUrl);
  const url = `${RAKUTEN_API_BASE}?${searchParams.toString()}`;
  const body = await httpsGet(url, {
    'Referer': siteUrl,
    'Origin': siteUrl,
    'User-Agent': 'Node.js',
  });

  const data = JSON.parse(body) as { Items?: { Item: RakutenBookItem }[] };
  return (data.Items ?? []).map((item) => item.Item);
}

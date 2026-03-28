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

  const response = await fetch(`${RAKUTEN_API_BASE}?${searchParams.toString()}`);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Rakuten API error: ${response.status} - ${body}`);
  }

  const data = await response.json() as { Items?: { Item: RakutenBookItem }[] };
  return (data.Items ?? []).map((item) => item.Item);
}

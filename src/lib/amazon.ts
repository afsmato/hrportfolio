// Amazon PA API client
// NOTE: Amazon PA API requires HMAC-SHA256 signing.
// Implementation uses the paapi5-nodejs SDK or manual signing.
// Full implementation will be added during the Books feature phase.

export interface AmazonBookItem {
  asin: string;
  title: string;
  author: string;
  publisher: string;
  isbn?: string;
  imageUrl?: string;
  detailPageUrl: string;
}

export async function searchAmazonBooks(_keyword: string): Promise<AmazonBookItem[]> {
  // TODO: Implement Amazon PA API integration
  // Requires: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG
  return [];
}

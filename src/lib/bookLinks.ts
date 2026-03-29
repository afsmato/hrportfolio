/** 実ISBNかどうか判定（数字のみ10〜13桁） */
function isRealIsbn(isbn: string | null | undefined): isbn is string {
  return !!isbn && /^\d{10,13}$/.test(isbn);
}

export function rakutenBookUrl(isbn: string | null | undefined, title: string): string {
  return isRealIsbn(isbn)
    ? `https://books.rakuten.co.jp/rb/${isbn}/`
    : `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(title)}/`;
}

export function amazonBookUrl(isbn: string | null | undefined, title: string): string {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(isRealIsbn(isbn) ? isbn : title)}`;
}

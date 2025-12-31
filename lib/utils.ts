/**
 * ユーティリティ関数
 */

/**
 * 画像URLをHTTPSに変換する
 * Mixed Content エラーを防ぐため、HTTPをHTTPSに変換
 */
export function ensureHttps(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    // すでにHTTPSの場合はそのまま返す
    if (url.startsWith('https://')) {
      return url;
    }
    
    // HTTPをHTTPSに変換
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    
    // プロトコルがない場合はHTTPSを追加
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    
    return url;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return null;
  }
}

/**
 * クラス名を結合する
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

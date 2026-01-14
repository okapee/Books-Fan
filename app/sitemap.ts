import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://books-fan.com'

  // 静的ページ
  const routes = [
    '',
    '/books',
    '/blog',
    '/about',
    '/contact',
    '/help',
    '/upgrade',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}

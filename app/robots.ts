import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/settings/', '/dashboard/', '/profile/edit'],
      },
    ],
    sitemap: 'https://books-fan.com/sitemap.xml',
  }
}

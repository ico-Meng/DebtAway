import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/form',
          '/success',
          '/error',
          '/flash-chat',
          '/instant-mock-interview',
          '/resume-analysis-lab',
          '/debtstatus',
          '/debtsummary',
          '/balance',
          '/referral',
          '/lead',
          '/alpha',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://ambitology.com/sitemap.xml',
  }
}

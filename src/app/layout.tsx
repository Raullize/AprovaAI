import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AprovaAI - Sua Jornada para a Aprovação Começa Aqui',
  description: 'Plataforma inovadora de estudos com simulados por níveis, gamificação e feedback detalhado. Prepare-se para vestibulares, ENEM e certificações profissionais com inteligência artificial.',
  keywords: 'simulados, vestibular, ENEM, certificações, estudos, gamificação, educação, aprovação',
  authors: [{ name: 'AprovaAI Team' }],
  robots: 'index, follow',
  metadataBase: new URL('https://aprovaai.com.br'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'AprovaAI - Sua Jornada para a Aprovação Começa Aqui',
    description: 'Plataforma inovadora de estudos com simulados por níveis e gamificação.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://aprovaai.com.br',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AprovaAI - Plataforma de Estudos',
      },
    ],
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
} 
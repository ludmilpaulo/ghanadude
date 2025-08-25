import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'GhanaDude — Premium Clothing',
  description: 'Shop GhanaDude: premium apparel, custom designs & branding. Fast delivery, secure checkout.',
  openGraph: {
    title: 'GhanaDude — Premium Clothing',
    description: 'Shop GhanaDude: premium apparel, custom designs & branding.',
    type: 'website'
  },
  icons: [{ rel: 'icon', url: '/logo.svg' }]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

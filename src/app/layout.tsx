import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '용카 - 택배 라우트 분석',
  description: 'AI와 빅데이터를 활용한 스마트 택배 수익성 분석 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-800">
          {children}
        </div>
      </body>
    </html>
  )
}


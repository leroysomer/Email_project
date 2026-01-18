import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Academic Email Assistant',
  description: 'Find and email academics for internship opportunities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

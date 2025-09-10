import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'JOB-TRACKER v1.0.0',
  description: 'Terminal-style job application tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
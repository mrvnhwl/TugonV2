import type React from "react"
import "../../../index.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Evaluation Sequence",
  description: "Interactive evaluation sequence with multiple phases",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light">
          <main className="min-h-screen bg-gray-50">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

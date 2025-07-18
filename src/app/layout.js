import './globals.css'

export const metadata = {
  title: 'Meu Blog',
  description: 'Um blog simples criado com Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

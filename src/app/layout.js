import './globals.css';
import VercelSpeedInsights from './components/VercelSpeedInsights';

export const metadata = {
  title: 'Filipe Souza',
  description: 'Um Portifolio simples criado com Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <VercelSpeedInsights />
      </body>
    </html>
  );
}
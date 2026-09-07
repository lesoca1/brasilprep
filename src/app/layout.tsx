import type { Metadata } from 'next';
import { Providers } from '@/components/layout/providers';
import { AppShell } from '@/components/layout/app-shell';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'BrasilPrep', template: '%s | BrasilPrep' },
  description:
    'Preparação analítica para vestibulares. Sua conta, seus vestibulares e seus objetivos.',
  robots: { index: false, follow: false },
};
const themeScript =
  "try{var t=localStorage.getItem('brasilprep-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){}";
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          id="brasilprep-theme-init"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { FocusProvider } from '../hooks/useFocusContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JSON.engine',
  description: 'Visual JSON editor for OpenClaw configuration management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Preload hints for important resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="bg-surface text-on-surface font-body">
        <FocusProvider>
        {/* Preload crucial JS chunks after main render */}
        <Script 
          id="preload-bundles" 
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const preloadEditor = () => {
                  const link = document.createElement('link');
                  link.rel = 'prefetch';
                  link.href = '/_next/static/chunks/components-editor-CodeEditor.js';
                  document.head.appendChild(link);
                };
                
                const preloadCanvas = () => {
                  const link = document.createElement('link');
                  link.rel = 'prefetch';
                  link.href = '/_next/static/chunks/components-canvas-NodeCanvas.js';
                  document.head.appendChild(link);
                };
                
                // Preload after idle time to improve perceived performance
                window.requestIdleCallback
                  ? requestIdleCallback(() => {
                      preloadEditor();
                      preloadCanvas();
                    })
                  : setTimeout(() => {
                      preloadEditor();
                      preloadCanvas();
                    }, 2000);
              })();
            `
          }} 
        />
        {children}
        </FocusProvider>
      </body>
    </html>
  )
}

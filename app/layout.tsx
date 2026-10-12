import './globals.css'
import ChatVet from './components/ChatVet'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{margin:0, fontFamily:'system-ui'}}>
        {children}
        <ChatVet />
      </body>
    </html>
  )
}

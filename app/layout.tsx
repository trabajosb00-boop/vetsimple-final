import './globals.css'
import ChatVet from './components/ChatVet' // <- 1. importa

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <ChatVet /> {/* <- 2. ponlo aquí al final, no tapa nada porque está cerrado por defecto */}
      </body>
    </html>
  )
}

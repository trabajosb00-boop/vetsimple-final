export const metadata = { title: 'VetSimple CRM', description: 'Agenda veterinaria' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f6f7f9' }}>
        {children}
      </body>
    </html>
  );
}

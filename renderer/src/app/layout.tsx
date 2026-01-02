import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { AudioProvider } from '@/contexts/AudioContext';
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Montserrat:wght@400;700&family=Poppins:wght@400;600&display=swap"
        />
      </head>
      <body>
        <AuthProvider>
          <ServiceProvider>
            <AudioProvider>
              {children}
            </AudioProvider>
          </ServiceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
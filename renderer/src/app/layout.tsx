import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Mira - AI Assistant",
  description: "Voice-enabled AI assistant desktop application",
};

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
      <body className="overflow-hidden h-screen">
        <div className="h-screen bg-gradient-to-br from-[#00ff88] to-[#00cc6a]">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
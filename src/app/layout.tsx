import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/auth/authProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} text-body`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ThemeToggle />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

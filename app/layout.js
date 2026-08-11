import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "GetMeAChai",
  description: "Support the creators you love.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
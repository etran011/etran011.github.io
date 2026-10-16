import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Erik Tran | Data Science & Software Engineering",
  description: "Erik Tran's developer portfolio. Data Science at William & Mary, Class of 2028.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

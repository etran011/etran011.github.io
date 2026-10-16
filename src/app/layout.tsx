import { Navigation } from "@/components/navigation";
import type { Metadata } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Erik Tran | Data Science & Software Engineering",
  description: "Erik Tran's developer portfolio. Data Science at William & Mary, Class of 2028.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Navigation />{children}</body></html>;
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo Manager",
  description: "A smart todo manager with natural language interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-xl font-bold text-gray-900">Todo Manager</h1>
            </div>
          </header>
          <main className="flex-1 px-4 py-6">
            <div className="max-w-4xl mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

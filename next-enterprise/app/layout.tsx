import QueryProvider from "@/shared/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Client-side provider lives inside its own client component */}
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

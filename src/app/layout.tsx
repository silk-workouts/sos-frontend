import type { Metadata } from "next";
import AppLayoutShell from "@/components/layout/AppLayoutShell/AppLayoutShell";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "System of Silk",
  description:
    "Pioneered by the godfather of boxing fitness, Michael 'Silk' Olajide Jr., System of Silk delivers sleek, powerful training through a fusion of boxing, bands, and rhythm. A transformative workout experience for all levels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // modify if site needs to track subdomains in the future
  const isProd = process.env.NEXT_PUBLIC_APP_URL === "https://systemofsilk.com";

  return (
    <html lang="en">
      <head>
        <meta name="version" content="1.0.0" />
        {isProd && (
          <>
            {/* <!-- Google tag (gtag.js) --> */}
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-K37Z5GTZ05"
            ></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-K37Z5GTZ05');
            `,
              }}
            />
          </>
        )}
      </head>
      <body>
        <AppLayoutShell>{children}</AppLayoutShell>
        <div id="modal-root" />
        {/* <Footer /> */}
      </body>
    </html>
  );
}

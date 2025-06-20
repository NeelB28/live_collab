import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Add any custom fonts, meta tags, or external scripts here */}
        <meta
          name="description"
          content="LiveCollab - Collaborative PDF Viewer"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

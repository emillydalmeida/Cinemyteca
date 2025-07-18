import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Butterfly+Kids&display=swap" rel="stylesheet" />
        
        {/* PouchDB CDN */}
        <script src="https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/pouchdb-find@8.0.1/dist/pouchdb.find.min.js"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

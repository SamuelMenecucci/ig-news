//this file is like index.html from within a standard react application. I create it because it will be the file that will be loaded only once, so here I bring the font imports, for example
//I write it in class format, and extend the Document from next/document, as it will overwrite the default document from next with what I pass
//the difference is that it is a component, and we will return an html but with the components of next itself, replacing what we will need
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Roboto:wght@900&display=swap"
            rel="stylesheet"
          />
          <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        </Head>
        <body>
          {/* main is where div root used to be */}
          <Main />

          {/*NextScript is where Next will put the JS files that the appication needs to work. We always need to put it after Main. Think of it as where I put script in html */}
          <NextScript />
        </body>
      </Html>
    );
  }
}

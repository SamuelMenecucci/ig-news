import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import "../../styles/global.scss";
import { Header } from "../components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    //SessionProvider from next-auth. This allows me to use useSession() hook in my application*/}
    <SessionProvider session={pageProps.session}>
      {/* Whenever I need a component to be displayed on all pages, I declare it in  the _app.tsx  */}
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;

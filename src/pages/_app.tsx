import { AppProps } from "next/app";
import "../../styles/global.scss";
import { Header } from "../components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Whenever I need a component to be displayed on all pages, I declare it in  the _app.tsx  */}
      <Header />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

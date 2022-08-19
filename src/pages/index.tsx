import { GetServerSideProps } from "next";
import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";
import styles from "./home.module.scss";

type HomeProps = {
  product: {
    priceId: string;
    amount: number;
  };
};

//the properties that I receive from parameter here are being passes through the node server that's run with next to use the SSR. I can take this props here because I return from function getServerSideProps the properties props, so I have access to the data from node server here, in the function parameters. Remember that, I can only access because the server function is on the same page (file)
export default function Home({ product }: HomeProps) {
  console.log(product);
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <br />

          <h1>
            New about the <span>React</span> world
          </h1>

          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>

          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}

//the getServerSideProps is a way to make a call from  server side rendering.
//the getServerSideProps name is mandatory, just as the function on a const is also
//DOC https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props
export const getServerSideProps: GetServerSideProps = async () => {
  //todo código dentro dessa função é executado no servidor node que o next sobe, para fazer o ssr, ou seja, se eu der um console log aqui, ele não irá aparecer no browser, justamente por não ser client side rendering, e sim server side rendering. esse console.log será exibido no terminal que está exibindo o servidor rodando da aplicação

  //since I'm not using http calls with axios or fetch to consume a route, but a library, when I use stripe. (dot) I already have all the information that I can fet directly, without putting the route completely.
  //DOC https://stripe.com/docs/api
  //since I just want to get a price, I use retrieve(), passing by parameters the id from the product price, that I get from the stripe's page, on product section, that I create.
  const price = await stripe.prices.retrieve("price_1LYZMOBJ8OywdlWv2pLyLiAL");

  const product = {
    priceId: price.id, // the id will be used on subscribeButton
    amount: new Intl.NumberFormat("en-us", {
      style: "currency",
      currency: "USD",
    }).format(price.unit_amount / 100), //the price of product always come in cents, thats why I need to divide by 100. Tip: always treat values in cents, because that way I don't need to work with decimal, making it much easer, because always will be integer numbers
  };

  return {
    props: {
      product,
    },
  };
};

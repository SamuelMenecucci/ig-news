import { GetServerSideProps, GetStaticProps } from "next";
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
//if I want to use SSG (Static Site Generation), the only thing I need to change is: change the name of the const to getStaticProps and the type to the same.
//When I use Static Site Generation, instead next server make a call every time that a user use the application, he will generate a static html file whit all informations that was returned from server on the first call. so, every user will see this static html file. the static html file will update using the time (in seconds) of the revalidate property, that i need to pass when I use the getStaticProps
export const getStaticProps: GetStaticProps = async () => {
  //all code inside this function is executed on the node server that next runs, here works the ssr. if I give a console.log here, will not appear in the browser, precisely because is not client side rendering, but server side rendering. this console.log will be displayed in the terminal where I put "yarn dev"

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
    revalidate: 60 * 60 * 24, //revalidate tells how long (in seconds) I want this page to hold without needing to be revalidated (rebuild)
  };
};

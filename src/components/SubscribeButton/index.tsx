import { signIn, useSession } from "next-auth/react";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripejs";
import styles from "./styles.module.scss";

type SubscribeButtonProps = {
  priceId: string;
};

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  //before I redirect the user to checkout session, I need to check if he is loggedIn on my app
  const session = useSession();

  async function handleSubscribe() {
    if (session.status === "unauthenticated") {
      signIn("github");
      return;
    }

    try {
      //remember, in nextjs, the route name is the same as the file name, because the routes api is being used
      const response = await api.post("/subscribe");

      //destructuring the sessionID that is being returned from the route api.
      const { sessionId } = response.data;

      //getting stripe sdk for front so user is redirected to checkout
      const stripe = await getStripeJs();

      //passing as parameter a object named sessionId. as the property name is the same as the value, I can pass is straight
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe Now
    </button>
  );
}

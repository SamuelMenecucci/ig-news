import { loadStripe } from "@stripe/stripe-js";

export async function getStripeJs() {
  //Every environment variable that needs to be loaded directly into the browser needs to be public. Inside nextjs I make it public by putting NEXT_PUBLIC at the beginning of the environment variable name, inside the .env
  //this is the only way to have a key that can be accessed by the frontend in a next app
  const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

  return stripeJs;
}

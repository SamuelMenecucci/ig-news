import Stripe from "stripe";
import { version } from "../../package.json";

//the first parameter is the private key, the second is an object with required configurations of stripe.
export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2022-08-01",

  //here I will pass some information's that will be used to identify what app are using on services. this will be displayed on stripe account, for exemple
  appInfo: {
    name: "ignews",

    //in version I can import the application version directly from package.json
    version: version,
  },
});

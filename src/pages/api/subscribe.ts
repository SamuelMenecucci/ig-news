import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { stripe } from "../../services/stripe";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //as this is not a backend route, I can't say that this api rout will only be available with the post method, I need to check if the request method is of the post type
  if (req.method === "POST") {
    //on the frontend, for me to know the user information I use useSession()
    //since useSession is a hook, I can't use it outside a jsx component
    //next-auth saves the logged user's data inside the application's cookies, and the cookies can be accessed both ont he frontend and on the backend, as long as it is in the same domain, as the cookie saves the same side.
    //localStorage is only available in the browser, not in the backend either
    //if I wanted to access the user's token, for example, I just had to put req.cookie, but this will only bring the token, not the user
    //there is a method that comes from next-auth itself that calls getSession(). getSession() is a function that receives an object, and I pass the req in this object because the getSession() will that the user's information from that.
    const session = await getSession({ req });

    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
    });

    //creating checkout session
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id, //I need to pass a customer property, which receives the data of the person who is paying. This data will be saved inside the stripe panel, then the customer makes the payment. The id I'm passing is the user's id created inside the stripeCustomer, it's not the user's id inside the fauna
      payment_method_types: ["card"], //Array with the supported methods
      billing_address_collection: "required", // Says whether of not the user's address must be filled in at the time of purchase
      line_items: [{ price: "price_1LYZMOBJ8OywdlWv2pLyLiAL", quantity: 1 }], //Array with the objects referring to the purchase. In "price" I pass the id of the product that will be purchased, the id references the product id in stripe panel
      mode: "subscription", //mode refers to the payment being a subscription service.
      allow_promotion_codes: true, //to allow promotion codes that change the price
      success_url: process.env.STRIPE_SUCCESS_URL, //url that the user will be redirected if the payment has been made
      cancel_url: process.env.STRIPE_CANCEL_URL, //url that the user will be redirected if the payment has be canceled
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id }); //I'm returning as an id because i'm going to use the stripe api to convert this id into a url, and the user will be directed to this url and then will be redirected back.
  } else {
    res.setHeader("Allow", "POST");
    res.status(450).end("Method not allowed ");
  }
};

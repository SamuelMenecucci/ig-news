import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { fauna } from "../../services/fauna";
import { query as q } from "faunadb";
import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

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

    //searching for a user in fauna, using the index user_by_email that I created on the fauna panel. I look for it so that I have the id information
    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index("user_by_email"), q.Casefold(session.user.email)))
    );

    //if this field exists within the user, it will be assigned to the customerId. If this property exists, it means that the user has previously accessed.
    let customerId = user.data.stripe_customer_id;

    //if doesn't exists, then I will create a new user inside stripe, and run a Update(), putting the stripe id in stripe_customer_id
    if (!customerId) {
      //creating a customer only if doesn't exists a property on my user in faunabd. when  I do this, an ID is returned, so i can use it
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      });

      await fauna.query(
        q.Update(q.Ref(q.Collection("users"), user.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id,
          },
        })
      );

      customerId = stripeCustomer.id;
    }

    //creating checkout session
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId, //I need to pass a customer property, which receives the data of the person who is paying. This data will be saved inside the stripe panel, then the customer makes the payment. The id I'm passing is the user's id created inside the stripeCustomer, it's not the user's id inside the fauna
      payment_method_types: ["card"], //Array with the supported methods
      billing_address_collection: "required", // Says whether of not the user's address must be filled in at the time of purchase
      line_items: [{ price: process.env.STRIPE_PRODUCT_ID, quantity: 1 }], //Array with the objects referring to the purchase. In "price" I pass the id of the product that will be purchased, the id references the product id in stripe panel
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

import { fauna } from "../../../services/fauna";
import { query as q } from "faunadb";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string
) {
  //fetch the user in the faunaDB with the customerId, field that was created and saved oin DB then the customer was created inside the stripe.

  //getting the ref field in fauna of the user doing the checkout.session
  const userRef = await fauna.query(
    //as I will only use the ref field, which would be the user id within the fauna, I will use the Select function, passing the field I want as the first parameter, and as the second the necessary query, so the fauna does not charge me for fields that I'm not using
    q.Select(
      "ref",
      q.Get(q.Match(q.Index("user_by_stripe_customer_id"), customerId))
    )
  );

  //stripe oly sends the subscription id and not all the subscription datra, so I do it this way so that I have all the subscription data I need
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  //So that I don't save all the subscription data, I will only save the one that are important to me
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id, //id of the item that was purchased. it's an array of objects. as I'm  working with only one product, i will get the first position of the array, which is where my product is
  };

  //save subscription data in FaunaDB
  await fauna.query(
    q.Create(q.Collection("subscriptions"), {
      data: subscriptionData,
    })
  );
}

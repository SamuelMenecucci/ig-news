//this file refers to the route that will be used by stripe's webhook

import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import { Stripe } from "stripe";
import { stripe } from "../../services/stripe";

//as the stripe sends the webhooks using the streaming format, I need to convert it in a way so that I can use it within node
async function buffer(readable: Readable) {
  const chunks: any = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

//by default, next has a format to understand the request. i understands that every request is coming as a json or as a form submission or something like that. But, in this case, the request is coming as a stream, a readable, so I have to disable nextjs default understanding of what is coming in the request.
//doc https://nextjs.org/docs/api-routes/request-helpers
export const config = {
  api: { bodyParser: false },
};

//putting stripe events that are relevant to my application into a variable. this checkout.session.completed is what I will use.
const relevantEvents = new Set(["checkout.session.completed"]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    //converging received data that is in streaming format
    const buf = await buffer(req);
    //per the stripe documentation, it is exactly this field that is sent when the stripe uses the webhook route
    const secret = req.headers["stripe-signature"];

    //crio uma variável do tipo Event do stripe.
    let event: Stripe.Event;

    //I put the assignment of this variable inside a try catch, which will be done by a stripe function (which is a function of the tripe instance of my services), passing as a parameter the request that comes in converted streaming, the secret that I got it from my headers and the stripe CLI code that is inside my .env
    try {
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      return res.status(400).send(`Webhook error: ${error.message}`);
    }

    //after all attribution with event validation, I have access to the information that is sent by the stripe's webhooks, making the object notation.
    const type = event.type;

    if (relevantEvents.has(type)) {
      console.log(`Received event ${event}`);
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};

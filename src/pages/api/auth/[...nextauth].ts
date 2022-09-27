import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { fauna } from "../../../services/fauna"; // this is the instance of Client from fauna, that I create to make a connection
import { query as q } from "faunadb"; //I renamed the query to q because I'll need to repeat this a lot, so this is simplify the process. the query is used to write a query in fauna

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      //   authorization: {
      //     params: {
      //       scope: "read:user",
      //     },
      //   },
    }),
    // ...add more providers here
  ],
  //next-auth brings some callbacks functions that we can use to control what happens when an action is performed
  //callbacks doc https://next-auth.js.org/configuration/callbacks
  callbacks: {
    //this callback allows us to modify the data that is inside the session, which is where the user's session data is stored, and we can access it anywhere in our application
    async session({ session }) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(q.Index("subscription_by_status"), "active"),
            ])
          )
        );

        return {
          ...session,
          //adding a property inside the session
          activeSubscription: userActiveSubscription,
        };
      } catch {
        return {
          ...session,
          activeSubscription: null,
        };
      }
    },

    //the signIn callback will be triggered as soon as the user log in
    async signIn({ user, account, profile }) {
      const { email } = user; //destructuring email from user

      //I use try catch that the signIn returns true only if the attempt to create a document in my collection is successful
      try {
        //to make a query whit fauna, i need to user .query function from my fauna service
        await fauna.query(
          //Evaluates an expression. If expects 3 parameters, firs is the condition, second is what will happens if returns true, third is whats will happens if not
          q.If(
            //Returns the opposite of a boolean expression.
            q.Not(
              //Returns true if a document has an event at a specific time.
              q.Exists(
                //Returns the set of items that match search terms.
                q.Match(
                  //using the index that I created in faunaDB.Returns the ref for an index.
                  q.Index("user_by_email"),
                  //casefold converts a string into a case-normalized string.
                  q.Casefold(email)
                )
              )
            ),

            //to create a new query, i need to use Create function, from query, that I have import from faunadb. the Create expects 2 params: the collection ref, witch I need to passas Collection() with the name of my collection,  and as second a object, that have data key, and receives what I will record in database
            q.Create(q.Collection("users"), {
              data: { email },
            }),

            //Get retrieves the document for the specified reference.
            q.Get(q.Match(q.Index("user_by_email"), q.Casefold(email)))
          )
        );

        //the signIn callback returns true if everything its ok, and false if not
        return true;
      } catch {
        return false;
      }
    },
  },
});

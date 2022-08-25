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
    //the signIn callback will be triggered as soon as the user log in
    async signIn({ user, account, profile }) {
      const { email } = user; //destructuring email from user

      //I use try catch that the signIn returns true only if the attempt to create a document in my collection is successful
      try {
        //to make a query whit fauna, i need to user .query function from my fauna service
        await fauna.query(
          //to create a new query, i need to use Create function, from query, that I have import from faunadb. the Create expects 2 params: the collection ref, witch I need to passas Collection() with the name of my collection,  and as second a object, that have data key, and receives what I will record in database

          q.Create(q.Collection("users"), {
            data: { email },
          })
        );

        //the signIn callback returns true if everything its ok, and false if not
        return true;
      } catch {
        return false;
      }
    },
  },
});

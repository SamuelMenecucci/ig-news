import Fauna from "faunadb";

export const fauna = new Fauna.Client({
  secret: process.env.FAUNADB_KEY,
});

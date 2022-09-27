import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { getPrismicClient } from "../../services/prismic";
import { asHTML } from "@prismicio/helpers";
import styles from "./post.module.scss";

type PostProps = {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
};

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.title} | ig.news</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={styles.postContent}
            // dangerouslySetInnerHTML is React’s replacement for using innerHTML in the browser DOM.
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params, //to recovery the params on the url I just need to pass the params as the parameter of my function. that will return a object. the key of that object will be the same name that I put on my file and the value will be the path
}) => {
  const session = await getSession({ req }); // //there is a method that comes from next-auth itself that calls getSession(). getSession() is a function that receives an object, and I pass the req in this object because the getSession() will that the user's information from that.

  const { slug } = params;

  const prismic = getPrismicClient(req);

  const response = await prismic.getByUID("post", String(slug), {}); //is a method that exists inside prismic. it is for me to search for any document by its UID (which is exactly the slyg). I pass the type of the document I want to fetch and pass the value

  const post = {
    slug,
    title: response.data.title,
    content: asHTML(response.data.content), //the content that is returned from prismic is an array with object that correspond to paragraphs and so on. I use asHTML to convert into an html that can be interpreted by the browser
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-br",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };

  return {
    props: { post },
  };
};

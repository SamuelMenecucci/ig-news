import { GetStaticProps } from "next";
import Head from "next/head";
import { getPrismicClient } from "../../services/prismic";
import styles from "./styles.module.scss";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};

type PostsProps = {
  posts: Post[];
};

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts?.map((element) => (
            <a key={element.slug} href="">
              <time>{element.updatedAt} </time>
              <strong>{element.title}</strong>
              <p>{element.excerpt}</p>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.getByType("post");

  const posts = response.results.map((element) => ({
    slug: element.uid,
    title: element.data.title,
    excerpt:
      element.data.content.find((element) => element.type === "paragraph")
        ?.text ?? "",

    updatedAt: new Date(element.last_publication_date).toLocaleDateString(
      "pt-br",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  }));

  return {
    props: { posts },
  };
};

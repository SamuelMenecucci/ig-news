import Link from "next/link";
import { SignInButton } from "../SigInButton";
import styles from "./styles.module.scss";

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="" />

        <nav>
          {/* if the href is inside the anchor, when I click on it to display another page, next will load all elements, and the application will be loaded again with all the code, imports and the function from the server. So that doesn't happen, I use the Link and pass the href to it. That way the application will reuse everything that has already been loaded and will not do everything again. That is,it will use the SPA concept. */}
          <Link href="/">
            <a className={styles.active}>Home</a>
          </Link>

          <Link href="posts" prefetch>
            <a>Posts</a>
          </Link>
        </nav>
        <SignInButton />
      </div>
    </header>
  );
}

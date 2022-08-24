import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi";
//useSession() it's a hook that returns tow properties, being data and status. I can use it because I pass the provider on _app, because useSession uses a context to work.
import { useSession, signIn, signOut } from "next-auth/react";
// signIn is a next-auth function that authenticates the user
//signOut is a next-auth function that destroys the current session

import styles from "./styles.module.scss";
export function SignInButton() {
  //status is whether the user is logged in or not. That's what I'm going to use to control.
  //data is the one that has all the information of the logged in user, such as email, name and avatar.
  const { status, data } = useSession();

  return status !== "unauthenticated" ? (
    <button type="button" className={styles.signInButton}>
      <FaGithub color="#04d361" />
      {data?.user.name}
      <FiX
        color="#737380"
        //I pass the singOut without parameter to destroy the current session
        onClick={() => signOut()}
      />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signInButton}
      //in onClick I will trigger a function that triggers signIn. The singIn receives as a parameter the provides that I will use to do the authentication, which here will be github
      //I could have multiple buttons with different authentication providers. For that I will only need pass the provider that I want to use as a parameter
      onClick={() => signIn("github")}
    >
      <FaGithub color="#eba417" />
      SignIn with Github
    </button>
  );
}

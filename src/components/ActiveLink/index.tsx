import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { ReactElement, cloneElement, ReactNode } from "react";

//Pass the LinkProps so that the componente can receive all the properties that the Link receives, for example, the href
type ActiveLinkProps = LinkProps & {
  children: ReactElement;
  activeClassName: string;
};

//pass all the properties to the link that are neither children nor activeClassName with the ...rest
export function ActiveLink({
  children, //children property is a property that every component in react has. server to access the content that is being passed to a component within our application. I can type i as ReactElement or ReactNode. explanation: https://dev.to/fromaline/jsxelement-vs-reactelement-vs-reactnode-2mh2
  activeClassName,
  ...rest
}: ActiveLinkProps) {
  const { asPath } = useRouter();

  const className = asPath === rest.href ? activeClassName : "";

  return (
    <Link {...rest}>
      {/*as the class has to go to the anchor and not to the Link, I need to somehow pass this class to my A tag. I can't put this property directly on children doing {children className =""}, so I use a function from react itself that I clone an element, and I can modify any property I want. as the first parameter I pass the element that I want to clone, and as the second I pass an object, passing what I want to add to it. */}

      {cloneElement(children, {
        className,
      })}
    </Link>
  );
}

export interface LinkProps {
  href: string;
  children: JSX.Element | string;
}

export function Link(props: LinkProps) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}

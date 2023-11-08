const iconRegexp = /^[a-z1-9-]+$/;

export type MarginSize = "0" | "1" | "2" | "3" | "4" | "5" | "auto";

export interface IconProps {
  name: string;
  ms?: MarginSize;
  me?: MarginSize;
}

/**
 * Bootstrap icon wrapper.
 */
export function Icon(props: IconProps) {
  if (!iconRegexp.test(props.name)) {
    throw new Error("Invalid icon name");
  }
  let marginClassName = "";
  if (props.ms !== undefined) {
    marginClassName += "ms-" + props.ms + " ";
  }
  if (props.me !== undefined) {
    marginClassName += "me-" + props.me + " ";
  }
  return <i className={marginClassName + "my-2 bi-" + props.name}></i>;
}

import Image from "next/image";
import Link from "next/link";

interface IconProps {
  src: string;
  href?: string;
  className?: string;
}

export function Icon(props: IconProps) {
  return (
    <Link href={props.href ?? ""}>
      <Image
        alt="Icon"
        src={props.src}
        width={100}
        height={100}
        className={props.className}
      />
    </Link>
  );
}

import { Suspense } from "react";
import Loading from "./loading";

export default function Page(): JSX.Element {
  return <Suspense fallback={<Loading />}>yo</Suspense>;
}

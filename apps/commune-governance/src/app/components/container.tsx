export function Container({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <main className="flex flex-col items-center justify-center w-full px-6 mx-auto animate-fade-in-down max-w-screen-2xl">{children}</main>
  );
}

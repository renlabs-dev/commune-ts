export function Container({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <main className="mx-auto flex w-full max-w-screen-2xl animate-fade-in-down flex-col items-center justify-center px-4 text-white">
      {children}
    </main>
  );
}

export function Container({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="animate-fade-in-down flex justify-center">
      <section className="w-full">{children}</section>
    </div>
  );
}

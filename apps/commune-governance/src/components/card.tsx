interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function CardRoot(props: CardProps) {
  const { children, className = "" } = props;
  return (
    <div className={`border border-gray-500 bg-black/50 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader(props: CardProps) {
  const { children, className = "" } = props;
  return (
    <div
      className={`relative flex w-full items-center justify-center border-b border-gray-500 px-4 py-3 lg:flex-row lg:justify-start ${className}`}
    >
      {children}
    </div>
  );
}

function CardBody(props: CardProps) {
  const { children, className = "" } = props;
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export const Card = {
  Root: CardRoot,
  Body: CardBody,
  Header: CardHeader,
};

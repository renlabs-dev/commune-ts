interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export function Label({ children, className = "" }: LabelProps): JSX.Element {
  return (
    <div
      className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-semibold ${className}`}
    >
      {children}
    </div>
  );
}

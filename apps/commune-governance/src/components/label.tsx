interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export function Label({ children, className = "" }: LabelProps) {
  return (
    <div
      className={`flex gap-1 items-center px-4 py-1 text-sm font-semibold ${className}`}
    >
      {children}
    </div>
  );
}

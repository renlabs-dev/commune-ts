interface SkeletonProps {
  className: string;
}
export function Skeleton(props: SkeletonProps) {
  const { className } = props;
  return <span className={`block bg-gray-700 animate-pulse ${className}`} />;
}

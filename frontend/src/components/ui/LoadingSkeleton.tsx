type LoadingSkeletonProps = {
  count?: number;
};

export function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
  return (
    <div className="skeleton-list" aria-busy="true" aria-label="Đang tải dữ liệu">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index} />
      ))}
    </div>
  );
}

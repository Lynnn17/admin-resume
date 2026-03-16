export default function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"
      style={{ width: size, height: size }}
    />
  );
}

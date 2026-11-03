export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`.trim()}>
      {children}
    </div>
  );
}

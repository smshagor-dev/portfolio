export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(32,82,167,0.24),transparent_35%),linear-gradient(180deg,#08111d_0%,#0c1727_50%,#0a1321_100%)] px-4 py-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

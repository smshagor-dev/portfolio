export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_22%),linear-gradient(180deg,#060b14_0%,#0a1321_46%,#09111d_100%)] px-4 py-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

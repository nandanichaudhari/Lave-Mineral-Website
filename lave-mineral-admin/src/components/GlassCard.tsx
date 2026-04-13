export default function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl p-5 shadow-lg hover:shadow-xl transition">
      {children}
    </div>
  );
}
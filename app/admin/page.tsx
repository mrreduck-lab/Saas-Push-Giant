export default function AdminPage() {
  return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: 24, background: "#f5f1ea", color: "#15120f" }}>
      <section style={{ width: "min(100%, 560px)", background: "#fffaf3", border: "1px solid rgba(21,18,15,.12)", borderRadius: 8, padding: 28 }}>
        <p style={{ margin: "0 0 12px", textTransform: "uppercase", letterSpacing: ".18em", fontSize: 11, color: "#95744d" }}>Admin</p>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display), Georgia, serif", fontSize: 48, fontWeight: 400, lineHeight: 1 }}>Кабинет Push Giant</h1>
        <p style={{ color: "#5d5247", lineHeight: 1.55 }}>Раздел администрирования уже находится в dashboard. Эта страница оставлена как короткий вход без серверного редиректа.</p>
        <a href="/dashboard" style={{ display: "inline-flex", marginTop: 12, padding: "12px 15px", borderRadius: 7, background: "#15120f", color: "#fff", textDecoration: "none" }}>
          Открыть dashboard
        </a>
      </section>
    </main>
  );
}

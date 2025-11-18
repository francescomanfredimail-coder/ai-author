export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-center px-4">
      <div>
        <p className="text-sm tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
          404
        </p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
          Pagina non trovata
        </h1>
        <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
          La pagina richiesta non esiste o è stata spostata.
        </p>
      </div>
    </div>
  );
}

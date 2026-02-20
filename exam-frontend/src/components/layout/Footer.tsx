export function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-200 px-6 py-3">
      <p className="text-center text-xs text-base-content/50">
        © {new Date().getFullYear()} Sistem Ujian · Offline-First · v1.0
      </p>
    </footer>
  );
}

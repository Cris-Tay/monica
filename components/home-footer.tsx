'use client';

export function HomeFooter() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
      © {year} PAES Pro — Plataforma de práctica académica
    </footer>
  );
}

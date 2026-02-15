import { Home, ClipboardList, BarChart3, BookOpen, Notebook } from "lucide-react";

const items = [
  { icon: Home, label: "Inicio", href: "/protected" },
  { icon: BookOpen, label: "Cursos", href: "/protected/cursos" },
  { icon: ClipboardList, label: "Ensayos PAES", href: "/protected/ensayos" },
];

export function DashboardSidebar() {
  return (
    <aside className="w-64 h-screen sticky top-0 bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-blue-200/40">
      <div className="flex flex-col h-full p-4 gap-6">

        {/* Header sidebar */}
        <div className="p-4 rounded-2xl bg-white/80 border border-blue-200/50 shadow-sm">
          <p className="text-sm font-semibold text-blue-900">
            📘 Espacio de Estudio
          </p>
          <p className="text-xs text-blue-600/70 mt-1">
            Organiza tu aprendizaje
          </p>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-2">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl text-blue-700 hover:bg-white hover:shadow-sm transition-all"
            >
              <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <item.icon className="h-4 w-4 text-blue-700" />
              </div>
              <span className="text-sm font-medium">
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="mt-auto p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
          <p className="text-xs font-medium text-amber-800">
            🔥 Tip del día
          </p>
          <p className="text-xs text-amber-700/80 mt-1">
            Repasar errores mejora más que repetir ejercicios
          </p>
        </div>
      </div>
    </aside>
  );
}

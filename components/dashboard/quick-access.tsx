import Link from 'next/link';
import { BookOpen, FileText, TrendingUp } from 'lucide-react';

export function QuickAccess() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Acceso a Cursos */}
      <Link href="/protected/cursos">
        <div className="group bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-200 group-hover:bg-blue-300 transition-colors">
              <BookOpen className="h-6 w-6 text-blue-700" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cursos</h3>
          <p className="text-sm text-gray-600 mb-4">
            Explora todas las materias y temas disponibles
          </p>
          <div className="text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-block">
            Ver Cursos →
          </div>
        </div>
      </Link>

      {/* Acceso a Ensayos */}
      <Link href="/protected/ensayos">
        <div className="group bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-200 group-hover:bg-purple-300 transition-colors">
              <FileText className="h-6 w-6 text-purple-700" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ensayos</h3>
          <p className="text-sm text-gray-600 mb-4">
            Practica con ensayos oficiales o personalizados
          </p>
          <div className="text-purple-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-block">
            Ir a Ensayos →
          </div>
        </div>
      </Link>

      {/* Acceso a Progreso */}
      <Link href="/protected/page">
        <div className="group bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:shadow-lg hover:border-green-400 transition-all cursor-pointer h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-200 group-hover:bg-green-300 transition-colors">
              <TrendingUp className="h-6 w-6 text-green-700" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mi Progreso</h3>
          <p className="text-sm text-gray-600 mb-4">
            Monitorea tu avance y estadísticas
          </p>
          <div className="text-green-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-block">
            Ver Progreso →
          </div>
        </div>
      </Link>
    </div>
  );
}

import { Clock, Calendar, Badge, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface ExamCardProps {
  id: string;
  title: string;
  type: 'oficial' | 'personalizado';
  scheduledAt: string | null;
  durationMinutes: number;
  createdAt: string;
}

export function ExamCard({
  id,
  title,
  type,
  scheduledAt,
  durationMinutes,
  createdAt,
}: ExamCardProps) {
  const isOfficial = type === 'oficial';
  const displayDate = scheduledAt || createdAt;
  const formattedDate = formatDate(new Date(displayDate));

  return (
    <Link href={`/protected/ensayos/${id}`}>
      <div className="group h-full bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer">
        {/* Header con badge */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors flex-1 line-clamp-2">
            {title}
          </h3>
          <div className="flex-shrink-0 ml-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                isOfficial
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {isOfficial ? '✓ Oficial' : 'Mi Ensayo'}
            </span>
          </div>
        </div>

        {/* Información */}
        <div className="space-y-3 mb-4">
          {/* Duración */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>{durationMinutes} minutos</span>
          </div>

          {/* Fecha */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="flex items-center gap-2 text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <span>
            {isOfficial ? 'Rendir Ensayo' : 'Ver Detalles'}
          </span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

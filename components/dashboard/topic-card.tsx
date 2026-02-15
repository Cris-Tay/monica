import { ChevronRight, Lock } from 'lucide-react';

interface TopicCardProps {
  id: string;
  name: string;
  description: string;
  topicNumber: number;
  progress: number; // 0-100
}

export function TopicCard({
  name,
  description,
  topicNumber,
  progress,
}: TopicCardProps) {
  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          {/* Número del tema */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-700">{topicNumber}</span>
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {name}
            </h3>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
              {description || 'Explora este tema'}
            </p>
          </div>
        </div>

        {/* Icon derecha */}
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>

      {/* Barra de Progreso */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Progreso</span>
          <span className="text-xs font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Estado */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
        {progress === 0 ? (
          <>
            <Lock className="h-3 w-3" />
            <span>Sin iniciar</span>
          </>
        ) : progress < 100 ? (
          <>
            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>En progreso</span>
          </>
        ) : (
          <>
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Completado</span>
          </>
        )}
      </div>
    </div>
  );
}

import { BookOpen } from 'lucide-react';

interface SubjectCardProps {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  onClick: () => void;
}

export function SubjectCard({
  name,
  description,
  icon_url,
  onClick,
}: SubjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="group h-full bg-white border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-300 text-left"
    >
      {/* Icon */}
      <div className="mb-4 p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 w-fit transition-colors">
        {icon_url ? (
          <img
            src={icon_url}
            alt={name}
            className="h-6 w-6 object-contain"
          />
        ) : (
          <BookOpen className="h-6 w-6 text-blue-700" />
        )}
      </div>

      {/* Título */}
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
        {name}
      </h3>

      {/* Descripción */}
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
        {description || 'Explora este curso'}
      </p>

      {/* Botón invisible mejorado por hover */}
      <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Ver temas</span>
        <span>→</span>
      </div>
    </button>
  );
}

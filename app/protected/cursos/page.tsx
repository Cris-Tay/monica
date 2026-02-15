'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SubjectCard } from '@/components/dashboard/subject-card';
import { Loader } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  description: string;
  icon_url: string;
}

export default function CursosPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subjects')
          .select('id, name, description, icon_url')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching subjects:', error);
          setError('No se pudieron cargar los cursos');
          return;
        }

        setSubjects(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de Cursos</h1>
        <p className="text-gray-600 mt-2">
          Selecciona una materia para empezar a estudiar
        </p>
      </div>

      {/* Grid de Cursos */}
      {subjects.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-900">No hay cursos disponibles en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              id={subject.id}
              name={subject.name}
              description={subject.description}
              icon_url={subject.icon_url}
              onClick={() => router.push(`/protected/cursos/${subject.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

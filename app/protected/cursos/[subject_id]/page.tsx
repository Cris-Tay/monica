'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, BookOpen, Zap, Loader } from 'lucide-react';
import { TopicCard } from '@/components/dashboard/topic-card';

interface Topic {
  id: string;
  name: string;
  description: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
}

export default function CursoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subject_id = params.subject_id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Traer materia
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('id, name, description')
          .eq('id', subject_id)
          .single();

        if (subjectError) {
          setError('No se encontró la materia');
          return;
        }

        setSubject(subjectData);

        // Traer temas de esa materia
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('id, name, description')
          .eq('subject_id', subject_id)
          .order('name', { ascending: true });

        if (topicsError) {
          console.error('Error fetching topics:', topicsError);
          setError('No se pudieron cargar los temas');
          return;
        }

        setTopics(topicsData || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    if (subject_id) {
      fetchData();
    }
  }, [subject_id, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Cargando contenido...</p>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{error || 'No se encontró la materia'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header con botón atrás */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
          <p className="text-gray-600 mt-1">{subject.description}</p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-semibold text-gray-700">Temas</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">{topics.length}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-green-600" />
            <p className="text-sm font-semibold text-gray-700">Progreso</p>
          </div>
          <p className="text-2xl font-bold text-green-900">0%</p>
        </div>
      </div>

      {/* Lista de Temas */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Temas a Estudiar</h2>

        {topics.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-3" />
            <p className="text-blue-900 font-semibold">No hay temas disponibles</p>
            <p className="text-blue-600 text-sm mt-1">Esta materia se está preparando</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic, index) => (
              <TopicCard
                key={topic.id}
                id={topic.id}
                name={topic.name}
                description={topic.description}
                topicNumber={index + 1}
                progress={0} // Por ahora 0%, luego se calcula desde ex en_attempts
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

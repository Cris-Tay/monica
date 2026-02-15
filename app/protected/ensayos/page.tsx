'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader, Plus, Calendar, FileText } from 'lucide-react';
import { ExamCard } from '@/components/dashboard/exam-card';
import { CreateExamModal } from '@/components/exam/create-exam-modal';

interface Exam {
  id: string;
  title: string;
  type: 'oficial' | 'personalizado';
  scheduled_at: string | null;
  duration_minutes: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

type TabType = 'oficial' | 'personalizado';

export default function EnsayosPage() {
  const [activeTab, setActiveTab] = useState<TabType>('oficial');
  const [officialExams, setOfficialExams] = useState<Exam[]>([]);
  const [customExams, setCustomExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const supabase = createClient();

  // Fetch current user
  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }, [supabase.auth]);

  // Fetch exams
  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await getCurrentUser();
      if (!user) {
        setError('No autenticado');
        return;
      }

      // Traer ensayos oficiales
      const { data: official, error: officialError } = await supabase
        .from('exams')
        .select('id, title, type, scheduled_at, duration_minutes, is_active, created_by, created_at')
        .eq('type', 'oficial')
        .eq('is_active', true)
        .order('scheduled_at', { ascending: true });

      if (officialError) {
        console.error('Error fetching official exams:', officialError);
      }

      // Traer ensayos personalizados del usuario
      const { data: custom, error: customError } = await supabase
        .from('exams')
        .select('id, title, type, scheduled_at, duration_minutes, is_active, created_by, created_at')
        .eq('type', 'personalizado')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (customError) {
        console.error('Error fetching custom exams:', customError);
      }

      setOfficialExams(official || []);
      setCustomExams(custom || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Error inesperado al cargar ensayos');
    } finally {
      setLoading(false);
    }
  }, [supabase, getCurrentUser]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleExamCreated = () => {
    setShowCreateModal(false);
    fetchExams(); // Recargar ensayos
  };

  const exams = activeTab === 'oficial' ? officialExams : customExams;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Cargando ensayos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hub de Ensayos PAES</h1>
          <p className="text-gray-600 mt-2">
            Practica con ensayos oficiales o crea tus propios test
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          Crear Ensayo
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('oficial')}
          className={`px-6 py-4 font-semibold text-sm transition-all ${
            activeTab === 'oficial'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Ensayos Oficiales ({officialExams.length})
          </div>
        </button>

        <button
          onClick={() => setActiveTab('personalizado')}
          className={`px-6 py-4 font-semibold text-sm transition-all ${
            activeTab === 'personalizado'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Mis Ensayos ({customExams.length})
          </div>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Contenido de Tabs */}
      {exams.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            {activeTab === 'oficial' ? (
              <Calendar className="h-12 w-12 text-blue-300" />
            ) : (
              <FileText className="h-12 w-12 text-blue-300" />
            )}
          </div>
          <p className="text-blue-900 font-semibold text-lg">
            {activeTab === 'oficial'
              ? 'No hay ensayos oficiales disponibles'
              : 'Aún no has creado ningún ensayo'}
          </p>
          <p className="text-blue-600 text-sm mt-2">
            {activeTab === 'oficial'
              ? 'Los ensayos oficiales aparecerán aquí'
              : 'Haz clic en "Crear Ensayo" para comenzar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              id={exam.id}
              title={exam.title}
              type={exam.type}
              scheduledAt={exam.scheduled_at}
              durationMinutes={exam.duration_minutes}
              createdAt={exam.created_at}
            />
          ))}
        </div>
      )}

      {/* Modal para crear ensayo */}
      {showCreateModal && (
        <CreateExamModal
          onClose={() => setShowCreateModal(false)}
          onExamCreated={handleExamCreated}
        />
      )}
    </div>
  );
}

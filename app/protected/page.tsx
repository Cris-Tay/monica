'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Loader,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  Brain,
  Zap,
  ArrowRight,
  Target,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { AttemptHistory } from '@/components/dashboard/attempt-history';
import { TopicStats } from '@/components/dashboard/topic-stats';
import { QuickAccess } from '@/components/dashboard/quick-access';

interface DashboardStats {
  totalAttempts: number;
  averageScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracyPercentage: number;
  lastAttemptDate: string | null;
  streakDays: number;
}

interface AttemptData {
  id: string;
  exam_id: string;
  exam_title: string;
  score_total: number;
  correct_count: number;
  incorrect_count: number;
  omitted_count: number;
  finished_at: string;
  accuracy: number;
}

interface TopicData {
  topicName: string;
  subjectName: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [topicStats, setTopicStats] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }, [supabase.auth]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const user = await getCurrentUser();
        if (!user) {
          setError('No autenticado');
          return;
        }

        // Traer todos los exam_attempts del usuario
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('exam_attempts')
          .select(
            `
            id,
            exam_id,
            score_total,
            correct_count,
            incorrect_count,
            omitted_count,
            finished_at,
            exams (title)
            `
          )
          .eq('user_id', user.id)
          .eq('status', 'completado')
          .order('finished_at', { ascending: false });

        if (attemptsError) {
          console.error('Error fetching attempts:', attemptsError);
          setError('No se pudieron cargar los intentos');
          return;
        }

        // Procesar datos de intentos
        const processedAttempts: AttemptData[] = (attemptsData || []).map((attempt: any) => {
          const total = attempt.correct_count + attempt.incorrect_count + attempt.omitted_count;
          const accuracy = total > 0 ? Math.round((attempt.correct_count / total) * 100) : 0;
          return {
            id: attempt.id,
            exam_id: attempt.exam_id,
            exam_title: attempt.exams?.title || 'Ensayo sin título',
            score_total: attempt.score_total,
            correct_count: attempt.correct_count,
            incorrect_count: attempt.incorrect_count,
            omitted_count: attempt.omitted_count,
            finished_at: attempt.finished_at,
            accuracy,
          };
        });

        setAttempts(processedAttempts);

        // Calcular estadísticas globales
        if (processedAttempts.length > 0) {
          const totalCorrect = processedAttempts.reduce((sum, a) => sum + a.correct_count, 0);
          const totalIncorrect = processedAttempts.reduce((sum, a) => sum + a.incorrect_count, 0);
          const totalQuestions = totalCorrect + totalIncorrect + 
            processedAttempts.reduce((sum, a) => sum + a.omitted_count, 0);
          const averageScore = Math.round(
            processedAttempts.reduce((sum, a) => sum + a.score_total, 0) / processedAttempts.length
          );
          const accuracyPercentage = totalQuestions > 0 
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0;

          setStats({
            totalAttempts: processedAttempts.length,
            averageScore,
            totalCorrect,
            totalIncorrect,
            accuracyPercentage,
            lastAttemptDate: processedAttempts[0]?.finished_at || null,
            streakDays: calculateStreak(processedAttempts),
          });
        }

        // Traer estadísticas por tema
        const { data: topicData, error: topicError } = await supabase
          .from('user_answers')
          .select(
            `
            question_id,
            is_correct,
            questions (
              topic_id,
              topics (name, subject_id, subjects (name))
            )
            `
          )
          .eq(
            'attempt_id',
            processedAttempts[0]?.id || '00000000-0000-0000-0000-000000000000'
          );

        if (!topicError && topicData) {
          const topicMap = new Map<string, TopicData>();

          topicData.forEach((answer: any) => {
            const topic = answer.questions?.topics;
            const subject = topic?.subjects;
            if (topic) {
              const key = topic.id;
              if (!topicMap.has(key)) {
                topicMap.set(key, {
                  topicName: topic.name,
                  subjectName: subject?.name || 'Sin asignatura',
                  totalQuestions: 0,
                  correctAnswers: 0,
                  accuracy: 0,
                });
              }
              const current = topicMap.get(key)!;
              current.totalQuestions++;
              if (answer.is_correct) {
                current.correctAnswers++;
              }
              current.accuracy = Math.round((current.correctAnswers / current.totalQuestions) * 100);
            }
          });

          setTopicStats(Array.from(topicMap.values()));
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [supabase, getCurrentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Mi Progreso</h1>
        <p className="text-gray-600 mt-2">
          Monitorea tu avance académico y mejora tu desempeño
        </p>
      </div>

      {/* Acceso Rápido */}
      <QuickAccess />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Estadísticas Principales - Si hay data */}
      {stats && stats.totalAttempts > 0 ? (
        <>
          {/* Grid de KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Promedio de Score */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Puntaje Promedio</h3>
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{stats.averageScore}</p>
              <p className="text-xs text-blue-700 mt-2">Escala PAES (100-1000)</p>
            </div>

            {/* Precisión */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Precisión</h3>
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">{stats.accuracyPercentage}%</p>
              <p className="text-xs text-green-700 mt-2">
                {stats.totalCorrect} correctas de {stats.totalCorrect + stats.totalIncorrect}
              </p>
            </div>

            {/* Ensayos Completados */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Ensayos</h3>
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-900">{stats.totalAttempts}</p>
              <p className="text-xs text-purple-700 mt-2">Completados</p>
            </div>

            {/* Racha de Estudio */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Racha de Estudio</h3>
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-900">{stats.streakDays}</p>
              <p className="text-xs text-orange-700 mt-2">Días consecutivos</p>
            </div>
          </div>

          {/* Gráfico de Progreso y Top Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico Principal */}
            <div className="lg:col-span-2">
              <ProgressChart attempts={attempts} />
            </div>

            {/* Estadísticas Rápidas */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Resultados</h3>
                <div className="space-y-3">
                  {attempts.slice(0, 3).map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {attempt.exam_title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(attempt.finished_at).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">{attempt.score_total}</p>
                        <p className="text-xs text-gray-600">{attempt.accuracy}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas por Tema */}
          {topicStats.length > 0 && <TopicStats topics={topicStats} />}

          {/* Historial Completo */}
          <AttemptHistory attempts={attempts} />
        </>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
          <BookOpen className="h-16 w-16 text-blue-300 mx-auto mb-4" />
          <p className="text-blue-900 font-semibold text-lg mb-2">Sin ensayos completados aún</p>
          <p className="text-blue-600 mb-6">
            Completa tu primer ensayo para ver estadísticas y progreso
          </p>
          <a
            href="/protected/ensayos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Ir a Ensayos
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}

// Función para calcular racha de estudio
function calculateStreak(attempts: AttemptData[]): number {
  if (attempts.length === 0) return 0;

  const sorted = [...attempts].sort(
    (a, b) => new Date(b.finished_at).getTime() - new Date(a.finished_at).getTime()
  );

  let streak = 0;
  let currentDate = new Date(sorted[0].finished_at);
  currentDate.setHours(0, 0, 0, 0);

  for (const attempt of sorted) {
    const attemptDate = new Date(attempt.finished_at);
    attemptDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - attemptDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === streak) {
      streak++;
      currentDate = new Date(attemptDate);
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}
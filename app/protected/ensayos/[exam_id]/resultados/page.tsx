'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Loader,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  SkipForward,
  BarChart3,
} from 'lucide-react';

interface ExamAttempt {
  id: string;
  score_total: number;
  correct_count: number;
  incorrect_count: number;
  omitted_count: number;
  finished_at: string;
}

interface UserAnswer {
  question_id: string;
  selected_option: string | null;
  is_correct: boolean;
}

interface Question {
  id: string;
  content: string;
  correct_answer: string;
  explanation: string;
}

export default function ResultadosPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const exam_id = params.exam_id as string;
  const attempt_id = searchParams.get('attempt_id');

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [questions, setQuestions] = useState<Map<string, Question>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!attempt_id) {
          setError('No se encontró el intento');
          return;
        }

        // Traer intento
        const { data: attemptData, error: attemptError } = await supabase
          .from('exam_attempts')
          .select('id, score_total, correct_count, incorrect_count, omitted_count, finished_at')
          .eq('id', attempt_id)
          .single();

        if (attemptError || !attemptData) {
          setError('No se encontró el intento');
          return;
        }

        setAttempt(attemptData);

        // Traer respuestas del usuario
        const { data: answersData, error: answersError } = await supabase
          .from('user_answers')
          .select('question_id, selected_option, is_correct')
          .eq('attempt_id', attempt_id);

        if (answersError) {
          console.error('Error fetching answers:', answersError);
        } else {
          setAnswers(answersData || []);
        }

        // Traer preguntas
        if (answersData && answersData.length > 0) {
          const questionIds = answersData.map((a) => a.question_id);
          const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('id, content, correct_answer, explanation')
            .in('id', questionIds);

          if (questionsError) {
            console.error('Error fetching questions:', questionsError);
          } else {
            const questionsMap = new Map(
              (questionsData || []).map((q) => [q.id, q])
            );
            setQuestions(questionsMap);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attempt_id, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{error || 'No se encontró el intento'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = attempt.correct_count + attempt.incorrect_count + attempt.omitted_count;
  const percentage = Math.round((attempt.correct_count / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => router.push('/protected/ensayos')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver a Ensayos
        </button>

        {/* Resumen Principal */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-200">
          {/* Encabezado con color */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center text-white">
            <h1 className="text-4xl font-bold mb-2">¡Ensayo Completado!</h1>
            <p className="text-blue-100">
              {new Date(attempt.finished_at).toLocaleDateString('es-CL')}
            </p>
          </div>

          {/* Puntuación Principal */}
          <div className="p-8 text-center border-b border-gray-200">
            <div className="inline-flex flex-col items-center">
              <div className="mb-4">
                <svg className="w-32 h-32" viewBox="0 0 100 100">
                  {/* Fondo del círculo */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* Progreso */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="8"
                    strokeDasharray={`${percentage * 2.83} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute mt-[-76px] text-center">
                  <p className="text-4xl font-bold text-blue-600">{percentage}%</p>
                  <p className="text-sm text-gray-600">Acierto</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-4">
                Puntaje: <span className="text-blue-600">{attempt.score_total}</span>
              </p>
              <p className="text-gray-600 text-sm mt-2">Escala PAES (100-1000)</p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 p-8 bg-blue-50">
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="flex justify-center mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">{attempt.correct_count}</p>
              <p className="text-sm text-gray-600 mt-1">Correctas</p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border border-red-200">
              <div className="flex justify-center mb-2">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">{attempt.incorrect_count}</p>
              <p className="text-sm text-gray-600 mt-1">Incorrectas</p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border border-gray-300">
              <div className="flex justify-center mb-2">
                <SkipForward className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-3xl font-bold text-gray-600">{attempt.omitted_count}</p>
              <p className="text-sm text-gray-600 mt-1">Omitidas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle de Respuestas */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Revisión de Respuestas
        </h2>

        <div className="space-y-4">
          {answers.map((answer) => {
            const question = questions.get(answer.question_id);
            if (!question) return null;

            const isCorrect = answer.is_correct;
            const wasOmitted = answer.selected_option === null;

            return (
              <div
                key={answer.question_id}
                className={`bg-white rounded-xl p-6 border-2 ${
                  isCorrect
                    ? 'border-green-200 bg-green-50'
                    : wasOmitted
                    ? 'border-gray-200'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                {/* Encabezado */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : wasOmitted ? (
                      <SkipForward className="h-6 w-6 text-gray-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{question.content}</h3>
                    <p
                      className={`text-sm font-medium mt-1 ${
                        isCorrect
                          ? 'text-green-700'
                          : wasOmitted
                          ? 'text-gray-700'
                          : 'text-red-700'
                      }`}
                    >
                      {isCorrect
                        ? '✓ Respuesta Correcta'
                        : wasOmitted
                        ? '— Pregunta Omitida'
                        : '✗ Respuesta Incorrecta'}
                    </p>
                  </div>
                </div>

                {/* Respuesta */}
                <div className="ml-9 space-y-2 mb-4">
                  {!wasOmitted && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        Tu respuesta:
                      </p>
                      <p className="text-sm text-gray-800 italic">{answer.selected_option}</p>
                    </div>
                  )}

                  {!isCorrect && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-1">
                        Respuesta correcta:
                      </p>
                      <p className="text-sm text-green-800 font-medium">
                        {question.correct_answer}
                      </p>
                    </div>
                  )}

                  {/* Explicación */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Explicación:</p>
                    <p className="text-sm text-gray-700">{question.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botones finales */}
      <div className="max-w-4xl mx-auto mt-8 flex gap-4 justify-center">
        <button
          onClick={() => router.push('/protected/ensayos')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Ver Más Ensayos
        </button>
        <button
          onClick={() => router.push('/protected')}
          className="px-8 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Ir al Dashboard
        </button>
      </div>
    </div>
  );
}

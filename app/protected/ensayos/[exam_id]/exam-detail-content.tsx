'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader, Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { QuestionCard } from '@/components/exam/question-card';
import { ExamTimer } from '@/components/exam/exam-timer';

interface Exam {
  id: string;
  title: string;
  duration_minutes: number;
  created_at: string;
}

interface Question {
  id: string;
  content: string;
  image_url: string | null;
  difficulty: string;
  correct_answer: string;
  distractors: string[];
  explanation: string;
}

interface UserAnswer {
  question_id: string;
  selected_option: string | null;
}

interface ExamDetailContentProps {
  examId: string;
}

export function ExamDetailContent({ examId }: ExamDetailContentProps) {
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const supabase = createClient();

  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }, [supabase.auth]);

  useEffect(() => {
    if (!examId) {
      setLoading(false);
      return;
    }

    const initExam = async () => {
      try {
        setLoading(true);

        const user = await getCurrentUser();
        if (!user) {
          setError('No autenticado');
          return;
        }

        const { data: examData, error: examError } = await supabase
          .from('exams')
          .select('id, title, duration_minutes, created_at')
          .eq('id', examId)
          .single();

        if (examError || !examData) {
          setError('Ensayo no encontrado');
          return;
        }

        setExam(examData);
        setTimeLeft(examData.duration_minutes * 60);

        const { data: attempt, error: attemptError } = await supabase
          .from('exam_attempts')
          .insert([
            {
              user_id: user.id,
              exam_id: examId,
              status: 'en_progreso',
            },
          ])
          .select()
          .single();

        if (attemptError || !attempt) {
          console.error('Error creating attempt:', attemptError);
          setError('No se pudo iniciar el ensayo');
          return;
        }

        setAttemptId(attempt.id);

        const { data: examQuestions, error: questionsError } = await supabase
          .from('exam_questions')
          .select('question_id')
          .eq('exam_id', examId);

        if (questionsError) {
          setError('No se pudieron cargar las preguntas');
          return;
        }

        const questionIds = examQuestions?.map((eq) => eq.question_id) || [];

        if (questionIds.length === 0) {
          setError('Este ensayo no tiene preguntas');
          return;
        }

        const { data: questionsData, error: detailsError } = await supabase
          .from('questions')
          .select(
            'id, content, image_url, difficulty, correct_answer, distractors, explanation'
          )
          .in('id', questionIds);

        if (detailsError) {
          setError('Error al cargar las preguntas');
          return;
        }

        setQuestions(questionsData || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examId, supabase, getCurrentUser]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleFinishExam();
    }
  }, [timeLeft]);

  const handleAnswerSelected = (questionId: string, answer: string): void => {
    setUserAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, {
        question_id: questionId,
        selected_option: answer,
      });
      return newAnswers;
    });
  };

  const saveAnswerToDatabase = async (
    attemptId: string,
    questionId: string,
    selectedOption: string | null,
    correctAnswer: string
  ) => {
    const isCorrect = selectedOption === correctAnswer;

    const { error } = await supabase.from('user_answers').insert([
      {
        attempt_id: attemptId,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
      },
    ]);

    if (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleFinishExam = async () => {
    if (!attemptId || !exam) return;

    try {
      setSubmitting(true);

      for (const [questionId, answer] of userAnswers.entries()) {
        const question = questions.find((q) => q.id === questionId);
        if (question) {
          await saveAnswerToDatabase(
            attemptId,
            questionId,
            answer.selected_option,
            question.correct_answer
          );
        }
      }

      let correctCount = 0;
      let incorrectCount = 0;
      let omittedCount = 0;

      questions.forEach((question) => {
        const answer = userAnswers.get(question.id);
        if (!answer || answer.selected_option === null) {
          omittedCount++;
        } else if (answer.selected_option === question.correct_answer) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      });

      const totalQuestions = questions.length;
      const percentage = (correctCount / totalQuestions) * 100;
      const score = Math.round(500 + (percentage - 50) * 10);

      const { error: updateError } = await supabase
        .from('exam_attempts')
        .update({
          status: 'completado',
          finished_at: new Date().toISOString(),
          score_total: score,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          omitted_count: omittedCount,
        })
        .eq('id', attemptId);

      if (updateError) {
        console.error('Error updating attempt:', updateError);
      }

      router.push(`/protected/ensayos/${examId}/resultados?attempt_id=${attemptId}`);
    } catch (err) {
      console.error('Error finishing exam:', err);
      setError('Error al finalizar el ensayo');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Cargando ensayo...</p>
        </div>
      </div>
    );
  }

  if (error || !exam || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="text-red-700 font-semibold">Error</p>
          </div>
          <p className="text-red-600 text-sm mt-1">
            {error || 'No se pudo cargar el ensayo'}
          </p>
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

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers.get(currentQuestion.id);
  const answeredCount = userAnswers.size;
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-6">
      {/* Header fijo - optimizado para móvil */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40">
        <div className="max-w-6xl mx-auto px-3 md:px-6 py-2 md:py-4 flex items-center justify-between gap-3">
          {/* Izquierda - Título compacto */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <button
              onClick={() => router.back()}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 md:h-6 w-5 md:w-6 text-gray-600" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm md:text-2xl font-bold text-gray-900 truncate">{exam.title}</h1>
              <p className="text-xs md:text-sm text-gray-600">
                {currentQuestionIndex + 1}/{totalQuestions}
              </p>
            </div>
          </div>

          {/* Derecha - Timer y progreso compacto */}
          <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
            {/* Barra de progreso móvil - muy compacta */}
            <div className="md:hidden flex flex-col items-center">
              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width: `${((answeredCount + 1) / (totalQuestions + 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Barra de progreso escritorio */}
            <div className="hidden md:flex flex-col items-center">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                  style={{
                    width: `${((answeredCount + 1) / (totalQuestions + 1)) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {answeredCount} / {totalQuestions}
              </p>
            </div>

            {/* Timer */}
            {timeLeft !== null && (
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <Clock className="h-4 md:h-5 w-4 md:w-5 text-blue-600" />
                <ExamTimer timeLeft={timeLeft} totalSeconds={exam.duration_minutes * 60} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Padding para el header fijo - ajustado para móvil */}
      <div className="h-14 md:h-20" />

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto">
        {/* Pregunta actual */}
        <QuestionCard
          question={currentQuestion}
          selectedAnswer={currentAnswer?.selected_option || null}
          onAnswerSelected={(answer) => handleAnswerSelected(currentQuestion.id, answer)}
        />

        {/* Botones de navegación - optimizado para móvil */}
        <div className="mt-6 md:mt-8 flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between">
          {/* Botones previo/siguiente */}
          <div className="flex gap-2 md:gap-4">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex-1 md:flex-none px-3 md:px-6 py-2.5 md:py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            >
              ← Anterior
            </button>
            <button
              onClick={() =>
                setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))
              }
              className={`flex-1 md:flex-none px-3 md:px-6 py-2.5 md:py-3 ${
                currentQuestionIndex < totalQuestions - 1
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'hidden'
              } font-semibold rounded-lg transition-colors text-sm md:text-base`}
            >
              Siguiente →
            </button>
          </div>

          {/* Indicador de preguntas - más compacto en móvil */}
          <div className="hidden md:flex gap-2 flex-wrap justify-center max-w-sm">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  idx === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : userAnswers.has(q.id)
                    ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Vista de preguntas en móvil - compacta */}
          <div className="md:hidden flex gap-1 flex-wrap justify-center">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-7 h-7 rounded text-xs font-semibold transition-all ${
                  idx === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : userAnswers.has(q.id)
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Botón finalizar - full width en móvil */}
          {currentQuestionIndex === totalQuestions - 1 && (
            <button
              onClick={handleFinishExam}
              disabled={submitting}
              className="w-full md:w-auto px-3 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
            >
              {submitting ? (
                <>
                  <Loader className="h-4 md:h-5 w-4 md:w-5 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 md:h-5 w-4 md:w-5" />
                  Finalizar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

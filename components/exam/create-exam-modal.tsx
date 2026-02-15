'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, AlertCircle } from 'lucide-react';

interface CreateExamModalProps {
  onClose: () => void;
  onExamCreated: () => void;
}

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export function CreateExamModal({ onClose, onExamCreated }: CreateExamModalProps) {
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(150); // 2h 30m por defecto
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'any' | 'easy' | 'medium' | 'hard'>('any');
  const [numQuestions, setNumQuestions] = useState(40);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching subjects:', error);
      } else {
        setSubjects(data || []);
      }
    };

    fetchSubjects();
  }, [supabase]);

  // Fetch topics for selected subjects (or none if no subject selected)
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        if (selectedSubjects.length === 0) {
          setTopics([]);
          setSelectedTopics([]);
          return;
        }

        const { data, error } = await supabase
          .from('topics')
          .select('id, name, subject_id')
          .in('subject_id', selectedSubjects)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching topics:', error);
        } else {
          setTopics(data || []);
          // If previously selected topics are no longer available, clear them
          setSelectedTopics((prev) => prev.filter((id) => (data || []).some((t) => t.id === id)));
        }
      } catch (err) {
        console.error('Unexpected error fetching topics', err);
      }
    };

    fetchTopics();
  }, [selectedSubjects, supabase]);

  // Get current user
  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }, [supabase.auth]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    if (durationMinutes < 15 || durationMinutes > 300) {
      setError('La duración debe estar entre 15 y 300 minutos');
      return;
    }

    try {
      setLoading(true);

      const user = await getCurrentUser();
      if (!user) {
        setError('No autenticado');
        return;
      }

      // Determine candidate question IDs based on selected topics/subjects/global
      let candidateQuestions: { id: string; difficulty?: string }[] = [];

      // If the user selected specific topics, query those
      if (selectedTopics.length > 0) {
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('id, difficulty')
          .in('topic_id', selectedTopics);

        if (questionsError) {
          console.error('Error fetching questions by topics:', questionsError);
          setError(`Error al buscar preguntas: ${questionsError.message}`);
          setLoading(false);
          return;
        } else if (questions) {
          console.log(`[Topics] Found ${questions.length} questions`);
          candidateQuestions = questions;
        }
      } else if (selectedSubjects.length > 0) {
        // No specific topics selected but subjects selected -> fetch topics for those subjects
        const { data: topicsRes, error: topicsError } = await supabase
          .from('topics')
          .select('id')
          .in('subject_id', selectedSubjects);

        if (topicsError) {
          console.error('Error fetching topics:', topicsError);
          setError(`Error al buscar temas: ${topicsError.message}`);
          setLoading(false);
          return;
        } else if (topicsRes && topicsRes.length > 0) {
          console.log(`[Subjects→Topics] Found ${topicsRes.length} topics for subjects`);
          const topicIds = topicsRes.map((t) => t.id);
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('id, difficulty')
            .in('topic_id', topicIds);

          if (questionsError) {
            console.error('Error fetching questions:', questionsError);
            setError(`Error al buscar preguntas por tema: ${questionsError.message}`);
            setLoading(false);
            return;
          } else if (questions) {
            console.log(`[Subjects→Topics→Questions] Found ${questions.length} questions`);
            candidateQuestions = questions;
          }
        } else {
          console.log('[Subjects→Topics] No topics found for selected subjects');
          setError('No se encontraron temas para las materias seleccionadas');
          setLoading(false);
          return;
        }
      } else {
        // Global exam -> fetch all questions
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('id, difficulty');

        if (questionsError) {
          console.error('Error fetching all questions:', questionsError);
          setError(`Error al buscar preguntas globales: ${questionsError.message}`);
          setLoading(false);
          return;
        } else if (questions) {
          console.log(`[Global] Found ${questions.length} total questions`);
          candidateQuestions = questions;
        }
      }

      // Filter by difficulty client-side if possible
      let filtered = candidateQuestions;
      if (difficulty !== 'any') {
        filtered = candidateQuestions.filter((q) => {
          if (!q.difficulty) return false;
          const d = String(q.difficulty).toLowerCase();
          if (difficulty === 'easy') return d.includes('easy') || d.includes('facil') || d.includes('fácil');
          if (difficulty === 'medium') return d.includes('medium') || d.includes('intermedio') || d.includes('medio');
          if (difficulty === 'hard') return d.includes('hard') || d.includes('dificil') || d.includes('difícil');
          return true;
        });
      }

      // Sample up to numQuestions randomly
      const sampleSize = Math.max(1, Math.min(500, numQuestions));
      let selectedForExam = filtered;
      if (filtered.length > sampleSize) {
        // shuffle and slice
        for (let i = filtered.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }
        selectedForExam = filtered.slice(0, sampleSize);
      }

      console.log(`[Final] Selected ${selectedForExam.length} questions out of ${filtered.length} filtered`);
      console.log('Exam data:', { title: title.trim(), durationMinutes, selectedSubjects, selectedTopics, difficulty, numQuestions });

      if (!selectedForExam || selectedForExam.length === 0) {
        setError('No se encontraron preguntas con los filtros seleccionados');
        setLoading(false);
        return;
      }

      // Crear ensayo ahora que sabemos que hay preguntas disponibles
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert([
          {
            title: title.trim(),
            type: 'personalizado',
            duration_minutes: durationMinutes,
            created_by: user.id,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (examError || !exam) {
        console.error('Error creating exam:', examError);
        setError('No se pudo crear el ensayo');
        setLoading(false);
        return;
      }

      console.log('Exam created:', exam);

      // Asociar preguntas al ensayo
      const examQuestions = selectedForExam.map((q) => ({
        exam_id: exam.id,
        question_id: q.id,
      }));

      console.log(`About to insert ${examQuestions.length} exam_questions:`, examQuestions.slice(0, 3));

      const { error: insertError, data: insertedData } = await supabase.from('exam_questions').insert(examQuestions);
      if (insertError) {
        console.error('Error associating questions:', insertError);
        setError('Error asociando preguntas al ensayo');
      } else {
        console.log('Successfully inserted exam_questions');
      }

      // Éxito
      onExamCreated();
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Crear Ensayo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Título del Ensayo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Mi ensayo de Matemática"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Duración (minutos)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="15"
                max="300"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-bold text-blue-600 min-w-fit">
                {durationMinutes}m
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sugerencia: 150 minutos (2h 30m) para un ensayo completo
            </p>
          </div>

            {/* Dificultad y número de preguntas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Dificultad</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="any">Cualquiera</option>
                  <option value="easy">Fácil</option>
                  <option value="medium">Intermedio</option>
                  <option value="hard">Difícil</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Filtra las preguntas por dificultad</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Número de preguntas</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={200}
                    step={1}
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-bold text-blue-600 w-14 text-right">{numQuestions}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Máx: 200 preguntas. Se seleccionarán aleatoriamente.</p>
              </div>
            </div>

          {/* Materias */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Materias (Opcional)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {subjects.map((subject) => (
                <label
                  key={subject.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={() => toggleSubject(subject.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{subject.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selecciona las materias de las que deseas incluir preguntas
            </p>
          </div>

          {/* Temas específicos (si hay materias seleccionadas) */}
          {topics.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Temas específicos (Opcional)</label>

              <div className="flex items-center gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedTopics(topics.map((t) => t.id))}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-sm"
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTopics([])}
                  className="px-3 py-1 bg-gray-50 text-gray-700 rounded-lg border border-gray-100 text-sm"
                >
                  Limpiar
                </button>
                <p className="text-xs text-gray-500 ml-auto">Puedes elegir temas concretos</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {topics.map((topic) => (
                  <label
                    key={topic.id}
                    className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.id)}
                      onChange={() => toggleTopic(topic.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">{topic.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Ensayo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

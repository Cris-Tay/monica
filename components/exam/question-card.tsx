'use client';

import { useState } from 'react';
import { Info, Image as ImageIcon, Send } from 'lucide-react';
import { useMemo } from 'react';


interface QuestionCardProps {
  question: {
    id: string;
    content: string;
    image_url: string | null;
    difficulty: string;
    correct_answer: string;
    distractors: string[];
    explanation: string;
  };
  selectedAnswer: string | null;
  onAnswerSelected: (answer: string) => void;
}

export function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelected,
}: QuestionCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  // Combinar respuesta correcta con distractores y shufflear
    const options = useMemo(() => {
    return [question.correct_answer, ...question.distractors]
        .sort(() => Math.random() - 0.5);
    }, [question.id]);


  // Asignar letras (A, B, C, D, etc)
  const optionsWithLetters = options.map((opt, idx) => ({
    letter: String.fromCharCode(65 + idx), // A, B, C, D...
    value: opt,
    isCorrect: opt === question.correct_answer,
  }));

  const difficultyColors = {
    facil: 'bg-green-100 text-green-800',
    medio: 'bg-yellow-100 text-yellow-800',
    dificil: 'bg-red-100 text-red-800',
  };

  const selectedOption = optionsWithLetters.find((opt) => opt.value === selectedAnswer);

  // Construir mensaje para WhatsApp
  const buildWhatsAppMessage = () => {
    const optionsText = optionsWithLetters
      .map((opt) => `${opt.letter}. ${opt.value}`)
      .join('\n');

    const message = `Hola, tengo una duda con esta pregunta:\n\n*Pregunta:*\n${question.content}\n\n*Opciones:*\n${optionsText}\n\n*Dificultad:* ${question.difficulty}`;
    return encodeURIComponent(message);
  };

  const whatsappLink = `https://wa.me/56945950373?text=${buildWhatsAppMessage()}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex-1">{question.content}</h2>
          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                difficultyColors[question.difficulty as keyof typeof difficultyColors] ||
                difficultyColors.medio
              }`}
            >
              {question.difficulty}
            </span>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold text-sm"
              title="Consultar en WhatsApp"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.325 0-2.851.123-4.102.271-.638.077-1.195.202-1.586.355-.529.212-1.035.557-1.29 1.067-.256.512-.257 1.088-.164 1.646.209 1.254 1.75 3.518 4.769 5.679 1.012.662 2.195 1.283 3.408 1.629 1.512.451 2.894.36 3.777-.121 1.289-.695 2.067-2.277 2.067-3.829 0-1.104-.213-2.105-.64-2.962-.426-.856-1.064-1.412-1.9-1.662-.529-.16-1.136-.277-1.77-.277z" />
              </svg>
              Ayuda
            </a>
          </div>
        </div>

        {/* Imagen si existe */}
        {question.image_url && (
          <div className="mt-4 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={question.image_url}
              alt="Pregunta"
              className="w-full h-48 object-cover"
            />
          </div>
        )}
      </div>

      {/* Opciones */}
      <div className="p-6 space-y-3">
        <p className="text-sm font-semibold text-gray-700 mb-4">Elige una respuesta:</p>

        {optionsWithLetters.map((option) => (
          <button
            key={option.value}
            onClick={() => onAnswerSelected(option.value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedAnswer === option.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Indicador de opción */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${
                  selectedAnswer === option.value
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                {option.letter}
              </div>

              {/* Texto de opción */}
              <span className="text-gray-900 font-medium">{option.value}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Explicación (toggle) */}
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <Info className="h-4 w-4" />
          {showExplanation ? 'Ocultar' : 'Ver'} explicación
        </button>

        {showExplanation && (
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-800">
            <p className="font-semibold text-blue-900 mb-2">Explicación:</p>
            <p>{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

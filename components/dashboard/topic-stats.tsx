import { Brain, TrendingUp } from 'lucide-react';

interface TopicData {
  topicName: string;
  subjectName: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

interface TopicStatsProps {
  topics: TopicData[];
}

export function TopicStats({ topics }: TopicStatsProps) {
  // Ordenar por accuracy descendente y tomar top 10
  const sortedTopics = [...topics]
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 10);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Desempeño por Tema
        </h3>
        <p className="text-xs text-gray-600">Top 10 temas más practicados</p>
      </div>

      {/* Lista de temas */}
      <div className="space-y-4">
        {sortedTopics.map((topic, idx) => {
          const isStrong = topic.accuracy >= 80;
          const isGood = topic.accuracy >= 60;

          return (
            <div key={`${topic.topicName}-${idx}`} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              {/* Header del tema */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{topic.topicName}</h4>
                  <p className="text-sm text-gray-600">{topic.subjectName}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    isStrong ? 'text-green-600' : isGood ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {topic.accuracy}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {topic.correctAnswers}/{topic.totalQuestions}
                  </p>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isStrong
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : isGood
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      : 'bg-gradient-to-r from-orange-500 to-red-500'
                  }`}
                  style={{ width: `${topic.accuracy}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-2">Temas Dominados</p>
            <p className="text-2xl font-bold text-green-600">
              {sortedTopics.filter((t) => t.accuracy >= 80).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-2">En Progreso</p>
            <p className="text-2xl font-bold text-blue-600">
              {sortedTopics.filter((t) => t.accuracy >= 60 && t.accuracy < 80).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-2">Necesita Mejora</p>
            <p className="text-2xl font-bold text-orange-600">
              {sortedTopics.filter((t) => t.accuracy < 60).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

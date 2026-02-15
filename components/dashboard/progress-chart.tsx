'use client';

import { useMemo } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

interface AttemptData {
  id: string;
  score_total: number;
  finished_at: string;
}

interface ProgressChartProps {
  attempts: AttemptData[];
}

export function ProgressChart({ attempts }: ProgressChartProps) {
  const chartData = useMemo(() => {
    if (attempts.length === 0) return null;

    // Agrupar por semana
    const weeklyData = new Map<string, number[]>();

    attempts.forEach((attempt) => {
      const date = new Date(attempt.finished_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, []);
      }
      weeklyData.get(weekKey)!.push(attempt.score_total);
    });

    // Calcular promedio por semana
    const weeks = Array.from(weeklyData.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .slice(-8) // Últimas 8 semanas
      .map(([key, scores]) => {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const date = new Date(key);
        const label = `Sem ${date.getDate()}`;
        return { label, score: avg, date: key };
      });

    // Encontrar máximo y mínimo para escalar
    const scores = weeks.map((w) => w.score);
    const max = Math.max(...scores, 1000);
    const min = 0;

    return { weeks, max, min };
  }, [attempts]);

  if (!chartData || chartData.weeks.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <p className="text-gray-600 text-center py-12">
          No hay datos suficientes para mostrar el gráfico
        </p>
      </div>
    );
  }

  const { weeks, max } = chartData;
  const range = max - 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Progreso por Semana
          </h3>
          <p className="text-sm text-gray-600 mt-1">Promedio de puntaje PAES</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700">Tendencia</p>
          <p className="text-xs text-gray-600">Últimas 8 semanas</p>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="flex items-end justify-between gap-2 h-64 mb-6">
        {weeks.map((week, idx) => {
          const height = ((week.score - 0) / range) * 100;
          const isIncreasing = idx === 0 || week.score >= weeks[idx - 1].score;

          return (
            <div key={week.date} className="flex flex-col items-center flex-1">
              {/* Barra */}
              <div className="w-full flex items-end justify-center mb-2 h-40">
                <div
                  className={`w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer group relative ${
                    isIncreasing
                      ? 'bg-gradient-to-t from-green-500 to-green-400'
                      : 'bg-gradient-to-t from-blue-500 to-blue-400'
                  }`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {week.score}
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="text-center">
                <p className="text-xs font-medium text-gray-700">{week.label}</p>
                <p className="text-xs text-gray-500">{week.score}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Máximo</p>
          <p className="text-lg font-bold text-green-600">{Math.max(...weeks.map((w) => w.score))}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Promedio</p>
          <p className="text-lg font-bold text-blue-600">
            {Math.round(weeks.reduce((sum, w) => sum + w.score, 0) / weeks.length)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Mínimo</p>
          <p className="text-lg font-bold text-orange-600">{Math.min(...weeks.map((w) => w.score))}</p>
        </div>
      </div>
    </div>
  );
}

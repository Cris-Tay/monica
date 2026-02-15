import { ResultadoDetailContent } from './resultado-detail-content';

interface PageProps {
  params: Promise<{ exam_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResultadosPage({ params, searchParams }: PageProps) {
  const { exam_id } = await params;
  const resolvedSearchParams = await searchParams;
  const attempt_id = resolvedSearchParams.attempt_id as string | undefined;

  if (!attempt_id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-2">No se encontró el intento de examen</p>
        </div>
      </div>
    );
  }

  return <ResultadoDetailContent attemptId={attempt_id} />;
}

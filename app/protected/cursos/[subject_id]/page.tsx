import { CursoDetailContent } from './curso-detail-content';

interface PageProps {
  params: Promise<{ subject_id: string }>;
}

export default async function CursoDetailPage({ params }: PageProps) {
  const { subject_id } = await params;

  return <CursoDetailContent subjectId={subject_id} />;
}

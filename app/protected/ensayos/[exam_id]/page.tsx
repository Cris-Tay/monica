import { ExamDetailContent } from './exam-detail-content';

interface PageProps {
  params: Promise<{ exam_id: string }>;
}

export default async function ExamPage({ params }: PageProps) {
  const { exam_id } = await params;

  return <ExamDetailContent examId={exam_id} />;
}

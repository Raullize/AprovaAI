import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/components/ui/Breadcrumb';
import UnderConstruction from '@/components/ui/UnderConstruction';
import api from '@/services/api';

interface BreadcrumbData {
  exam: { id: string; name: string } | null;
  topic: { id: string; name: string } | null;
  level: { id: string; name: string } | null;
}

export default function QuestionList() {
  const { levelId } = useParams();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbData>({
    exam: null,
    topic: null,
    level: null
  });

  useEffect(() => {
    async function loadBreadcrumbs() {
      try {
        if (!levelId) return;
        
        const levelRes = await api.get(`/levels/${levelId}`);
        const level = levelRes.data;
        
        const topicRes = await api.get(`/topics/${level.topicId}`);
        const topic = topicRes.data;

        const examRes = await api.get(`/exams/${topic.examId}`);
        const exam = examRes.data;

        setBreadcrumbs({ level, topic, exam });
      } catch (error) {
        console.error('Failed to load breadcrumbs', error);
      }
    }
    loadBreadcrumbs();
  }, [levelId]);

  return (
    <div className="space-y-6">
      <Breadcrumb 
        items={[
          { label: 'Exames', href: '/dashboard/exams' },
          { 
            label: breadcrumbs.exam?.name || '...', 
            href: breadcrumbs.exam ? `/dashboard/admin/exams/${breadcrumbs.exam.id}/topics` : '#' 
          },
          { label: 'Tópicos', href: breadcrumbs.exam ? `/dashboard/admin/exams/${breadcrumbs.exam.id}/topics` : '#' },
          { 
            label: breadcrumbs.topic?.name || '...', 
            href: breadcrumbs.topic ? `/dashboard/admin/topics/${breadcrumbs.topic.id}/levels` : '#' 
          },
          { label: 'Níveis', href: breadcrumbs.topic ? `/dashboard/admin/topics/${breadcrumbs.topic.id}/levels` : '#' },
          { label: breadcrumbs.level?.name || '...', href: '#' },
          { label: 'Questões' }
        ]} 
      />
      <div className="flex flex-col items-center justify-center py-12">
        <UnderConstruction 
          title="Gestão de Questões" 
          message="O gerenciamento de questões estará disponível em breve, após a implementação do upload de imagens." 
        />
      </div>
    </div>
  );
}

import React from 'react';
import { Construction } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

interface UnderConstructionProps {
  title?: string;
  message?: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({
  title = 'Em Desenvolvimento',
  message = 'Esta funcionalidade está sendo implementada e estará disponível em breve.',
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
      <div className="bg-primary-50 p-6 rounded-full mb-6">
        <Construction className="h-16 w-16 text-primary-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md mb-8">{message}</p>
      <Button variant="outline" onClick={() => navigate(-1)}>
        Voltar
      </Button>
    </div>
  );
};

export default UnderConstruction;

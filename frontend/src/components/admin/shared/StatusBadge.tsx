interface StatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
        status === 'ACTIVE'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status === 'ACTIVE' ? 'Público' : 'Privado'}
    </span>
  );
}

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  userOverride?: {
    id?: string;
    fullName?: string;
    username?: string;
    avatarUrl?: string | null;
  };
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 'md',
  className,
  userOverride,
}) => {
  const { user: authUser } = useAuth();
  const user = userOverride || authUser;

  const rawAvatarUrl = user?.avatarUrl;
  const BACKEND_URL =
    import.meta.env.VITE_STATIC_URL || 'http://localhost:3001';

  const avatarUrl = rawAvatarUrl
    ? rawAvatarUrl.startsWith('http')
      ? rawAvatarUrl
      : `${BACKEND_URL}${rawAvatarUrl.startsWith('/') ? rawAvatarUrl : `/${rawAvatarUrl}`}`
    : null;

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || 'UD';

  const sizeClasses = {
    xs: 'h-8 w-8 text-[11px]',
    sm: 'h-9 w-9 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl font-bold',
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={user?.fullName || 'User Avatar'}
        className={cn(
          'rounded-full object-cover shrink-0 ring-2 ring-indigo-500/20 shadow-sm',
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shrink-0 font-display ring-2 ring-indigo-500/20 shadow-sm',
        sizeClasses[size],
        className,
      )}
    >
      {user?.fullName || user?.username ? (
        initials
      ) : (
        <UserIcon className="h-4 w-4" />
      )}
    </div>
  );
};

export default UserAvatar;

import React from 'react';
import { Trophy, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';
import UserAvatar from './UserAvatar';

export interface LeaderboardRowData {
  rank: number;
  fullName: string;
  username: string;
  value: number; // XP or bestStreak
  subValue?: number; // streakCount for streak ranking
}

interface LeaderboardTableProps {
  rows: LeaderboardRowData[];
  currentUserUsername?: string;
  type: 'xp' | 'streak';
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  rows,
  currentUserUsername,
  type,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-4 px-4 w-16">Posição</th>
            <th className="py-4 px-4">Estudante</th>
            <th className="py-4 px-4 text-right">
              {type === 'xp' ? 'Experiência' : 'Recorde de Ofensiva'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => {
            const isCurrentUser = row.username === currentUserUsername;
            return (
              <tr
                key={row.username}
                className={cn(
                  'transition-colors text-sm',
                  isCurrentUser
                    ? 'bg-indigo-50/40 font-semibold'
                    : 'hover:bg-slate-50/50'
                )}
              >
                <td className="py-4 px-4">
                  <span
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold font-display text-sm shrink-0',
                      row.rank === 1
                        ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300/50'
                        : row.rank === 2
                          ? 'bg-slate-100 text-slate-700 ring-2 ring-slate-300/50'
                          : row.rank === 3
                            ? 'bg-orange-100 text-orange-850 ring-2 ring-orange-300/50'
                            : 'text-slate-400',
                    )}
                  >
                    {row.rank === 1 ? (
                      <Trophy className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                    ) : row.rank === 2 ? (
                      <Trophy className="h-4.5 w-4.5 text-slate-400 fill-slate-400" />
                    ) : row.rank === 3 ? (
                      <Trophy className="h-4.5 w-4.5 text-amber-700 fill-amber-700" />
                    ) : (
                      row.rank
                    )}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      size="xs"
                      userOverride={
                        isCurrentUser
                          ? undefined
                          : {
                              fullName: row.fullName,
                              username: row.username,
                            }
                      }
                    />
                    <div>
                      <span
                        className={cn(
                          'block',
                          isCurrentUser ? 'text-indigo-900' : 'text-slate-700'
                        )}
                      >
                        {row.fullName} {isCurrentUser && '(Você)'}
                      </span>
                      <span className="text-slate-400 text-xs font-normal">
                        @{row.username}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  {type === 'xp' ? (
                    <span
                      className={cn(
                        'font-bold font-display',
                        isCurrentUser ? 'text-indigo-600' : 'text-slate-600'
                      )}
                    >
                      {row.value} XP
                    </span>
                  ) : (
                    <div className="inline-flex flex-col items-end">
                      <span
                        className={cn(
                          'font-bold font-display flex items-center gap-1',
                          isCurrentUser ? 'text-orange-600' : 'text-slate-700'
                        )}
                      >
                        <Flame className="h-4 w-4 fill-current text-orange-500" />
                        {row.value} {row.value === 1 ? 'dia' : 'dias'}
                      </span>
                      {row.subValue !== undefined && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          Atual: {row.subValue} {row.subValue === 1 ? 'dia' : 'dias'}
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

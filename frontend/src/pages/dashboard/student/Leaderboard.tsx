import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Flame, Zap, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { LeaderboardTable, type LeaderboardRowData } from '../../../components/ui/LeaderboardTable';
import UserAvatar from '../../../components/ui/UserAvatar';
import { studentService, type LeaderboardResponse, type StreakLeaderboardResponse } from '../../../services/student.service';
import { cn } from '../../../lib/utils';


export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'xp' | 'streak'>('xp');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse>({
    topUsers: [],
    currentUserRank: -1,
    currentUserEntry: null,
  });
  const [streakLeaderboardData, setStreakLeaderboardData] = useState<StreakLeaderboardResponse>({
    topUsers: [],
    currentUserRank: -1,
    currentUserEntry: null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'top3' | 'top10'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function loadData() {
      try {
        const [lbData, streakLbData] = await Promise.all([
          studentService.getLeaderboard(),
          studentService.getStreakLeaderboard(),
        ]);
        setLeaderboardData(lbData);
        setStreakLeaderboardData(streakLbData);
      } catch (err) {
        console.error('Failed to load leaderboard data:', err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterTier, activeTab, pageSize]);

  const xpRows: LeaderboardRowData[] = leaderboardData.topUsers.map((item) => ({
    rank: item.rank,
    fullName: item.fullName,
    username: item.username,
    value: item.xp,
  }));

  const streakRows: LeaderboardRowData[] = streakLeaderboardData.topUsers.map((item) => ({
    rank: item.rank,
    fullName: item.fullName,
    username: item.username,
    value: item.bestStreak,
    subValue: item.streakCount,
  }));

  const rawRows = activeTab === 'xp' ? xpRows : streakRows;

  const filteredRows = rawRows.filter((row) => {
    const matchesSearch =
      row.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier =
      filterTier === 'all'
        ? true
        : filterTier === 'top3'
        ? row.rank <= 3
        : filterTier === 'top10'
        ? row.rank <= 10
        : true;

    return matchesSearch && matchesTier;
  });

  const totalItems = filteredRows.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize);

  const isCurrentUserInXpTop = leaderboardData.topUsers.some(
    (u) => u.username === user?.username,
  );
  const isCurrentUserInStreakTop = streakLeaderboardData.topUsers.some(
    (u) => u.username === user?.username,
  );

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">
              Ranking Global
            </h1>
            <p className="text-slate-500 mt-1">
              Veja os estudantes que estão se destacando em XP e Ofensivas na plataforma!
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1">
            <button
              onClick={() => setActiveTab('xp')}
              className={cn(
                'flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2',
                activeTab === 'xp'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40',
              )}
            >
              <Zap className="h-4.5 w-4.5 text-indigo-500" />
              Ranking de XP
            </button>
            <button
              onClick={() => setActiveTab('streak')}
              className={cn(
                'flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2',
                activeTab === 'streak'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40',
              )}
            >
              <Flame className="h-4.5 w-4.5 text-orange-500" />
              Ranking de Ofensivas
            </button>
          </div>

          <div className="p-6">
            {/* Toolbar for Search and Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-slate-100">
              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar estudante..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-slate-800 text-sm font-medium placeholder-slate-400"
                />
              </div>

              {/* Filter buttons and Page Size */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(['all', 'top3', 'top10'] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setFilterTier(tier)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                        filterTier === tier
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      )}
                    >
                      {tier === 'all' ? 'Todos' : tier === 'top3' ? 'Top 3' : 'Top 10'}
                    </button>
                  ))}
                </div>

                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value={5}>5 por pág.</option>
                  <option value={10}>10 por pág.</option>
                  <option value={25}>25 por pág.</option>
                </select>
              </div>
            </div>

            {paginatedRows.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 font-bold text-sm">Nenhum estudante encontrado</p>
                <p className="text-slate-350 text-xs mt-1">Experimente ajustar os filtros ou a pesquisa.</p>
              </div>
            ) : (
              <>
                {activeTab === 'xp' ? (
                  <div className="space-y-4">
                    <LeaderboardTable
                      rows={paginatedRows}
                      currentUserUsername={user?.username}
                      type="xp"
                    />

                    {/* Current User position if outside Top 10 (XP) */}
                    {!isCurrentUserInXpTop && leaderboardData.currentUserEntry && leaderboardData.currentUserRank > 0 && (
                      <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 px-3">
                          Sua posição
                        </p>
                        <div className="flex items-center justify-between py-3 px-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-display text-sm text-indigo-600 bg-indigo-100 shrink-0">
                              #{leaderboardData.currentUserRank}
                            </span>
                            <UserAvatar size="xs" />
                            <div>
                              <span className="font-bold text-sm text-indigo-900 block">
                                {leaderboardData.currentUserEntry.fullName} (Você)
                              </span>
                              <span className="text-slate-400 text-xs font-normal">
                                @{leaderboardData.currentUserEntry.username}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold font-display text-sm text-indigo-600 shrink-0">
                            {leaderboardData.currentUserEntry.xp} XP
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <LeaderboardTable
                      rows={paginatedRows}
                      currentUserUsername={user?.username}
                      type="streak"
                    />

                    {/* Current User position if outside Top 10 (Streak) */}
                    {!isCurrentUserInStreakTop && streakLeaderboardData.currentUserEntry && streakLeaderboardData.currentUserRank > 0 && (
                      <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 px-3">
                          Sua posição
                        </p>
                        <div className="flex items-center justify-between py-3 px-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-display text-sm text-indigo-600 bg-indigo-100 shrink-0">
                              #{streakLeaderboardData.currentUserRank}
                            </span>
                            <UserAvatar size="xs" />
                            <div>
                              <span className="font-bold text-sm text-indigo-900 block">
                                {streakLeaderboardData.currentUserEntry.fullName} (Você)
                              </span>
                              <span className="text-slate-400 text-xs font-normal">
                                @{streakLeaderboardData.currentUserEntry.username}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold font-display text-sm text-orange-600 flex items-center justify-end gap-1">
                              <Flame className="h-4 w-4 fill-current text-orange-500" />
                              {streakLeaderboardData.currentUserEntry.bestStreak}{' '}
                              {streakLeaderboardData.currentUserEntry.bestStreak === 1 ? 'dia' : 'dias'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                              Atual: {streakLeaderboardData.currentUserEntry.streakCount}{' '}
                              {streakLeaderboardData.currentUserEntry.streakCount === 1 ? 'dia' : 'dias'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>
                    
                    <span className="text-xs font-bold text-slate-500">
                      Página {currentPage} de {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

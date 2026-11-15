'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Search, Filter, ShieldCheck } from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/ui/UIStates';

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedPackage]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const url = `/api/leaderboard?packageId=${selectedPackage}`;
      const res = await fetch(url);
      const data = await res.json();
      setRankings(data.rankings || []);
      setPackages(data.packages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = rankings.filter((r) => {
    if (!search) return true;
    return (
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.province.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">
          <Trophy className="w-3.5 h-3.5" />
          <span>Peringkat Nasional Tryout CPNS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Papan Peringkat (Leaderboard)
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Bandingkan capaian skor Anda dengan ribuan pejuang NIP dari seluruh penjuru Indonesia.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="form-select text-xs"
          >
            <option value="ALL">Semua Paket Tryout</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama peserta..."
            className="form-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Leaderboard Table Card */}
      {loading ? (
        <LoadingState message="Memuat papan peringkat..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Belum Ada Nilai Terdaftar"
          description="Jadilah peserta pertama yang menyelesaikan tryout pada paket ini!"
        />
      ) : (
        <div className="card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-base)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 text-center w-14">Rank</th>
                  <th className="py-3 px-4">Nama Peserta</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Provinsi</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">TWK</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">TIU</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">TKP</th>
                  <th className="py-3 px-4 text-center font-black">Total Skor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text-secondary)] font-medium">
                {filtered.map((item, idx) => {
                  let rankBadge = null;
                  if (item.rank === 1) {
                    rankBadge = (
                      <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center mx-auto shadow-xs">
                        1
                      </span>
                    );
                  } else if (item.rank === 2) {
                    rankBadge = (
                      <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black flex items-center justify-center mx-auto shadow-xs">
                        2
                      </span>
                    );
                  } else if (item.rank === 3) {
                    rankBadge = (
                      <span className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center mx-auto shadow-xs">
                        3
                      </span>
                    );
                  } else {
                    rankBadge = <span className="font-bold text-[var(--text-muted)]">{item.rank}</span>;
                  }

                  return (
                    <tr
                      key={item.attemptId || idx}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center">{rankBadge}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--text-primary)]">
                          {item.userName}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate max-w-xs sm:hidden">
                          {item.province}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell text-[var(--text-muted)]">
                        {item.province}
                      </td>
                      <td className="py-3.5 px-4 text-center hidden md:table-cell">
                        {item.twkScore}
                      </td>
                      <td className="py-3.5 px-4 text-center hidden md:table-cell">
                        {item.tiuScore}
                      </td>
                      <td className="py-3.5 px-4 text-center hidden md:table-cell">
                        {item.tkpScore}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-sm font-black text-[var(--text-primary)]">
                          {item.totalScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.isPassed ? (
                          <span className="badge badge-success text-[10px]">LULUS PG</span>
                        ) : (
                          <span className="badge badge-error text-[10px]">BELUM LULUS</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


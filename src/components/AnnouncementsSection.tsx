import React, { useState } from 'react';
import { Bell, Pin, Calendar, Tag, ChevronDown, ChevronUp, PlusCircle, Sparkles } from 'lucide-react';
import { AnnouncementItem } from '../types';
import { useAuth } from '../firebase/AuthContext';

interface AnnouncementsSectionProps {
  announcements: AnnouncementItem[];
  onNavigateToAdmin?: () => void;
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  announcements,
  onNavigateToAdmin,
}) => {
  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const categories = ['Alle', 'Nieuws', 'Update', 'Event', 'Onderhoud'];

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredAnnouncements = announcements.filter((item) => {
    if (selectedCategory === 'Alle') return true;
    return item.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recent';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case 'nieuws':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'update':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'event':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'onderhoud':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <section className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-purple-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-['Chakra_Petch',sans-serif]">
              NETWERK <span className="text-purple-400">MEDEDELINGEN</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Blijf op de hoogte van updates, nieuwe game toevoegingen en server status
          </p>
        </div>

        {isAdmin && onNavigateToAdmin && (
          <button
            onClick={onNavigateToAdmin}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nieuwe Mededeling</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Geen mededelingen gevonden</h3>
          <p className="text-xs text-slate-500 mt-1">
            Er zijn momenteel geen berichten in de categorie "{selectedCategory}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAnnouncements.map((announcement) => {
            const isExpanded = expandedIds.has(announcement.id);
            const isLong = announcement.content.length > 220;

            return (
              <div
                key={announcement.id}
                className={`p-5 rounded-2xl bg-slate-900/80 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  announcement.isPinned
                    ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-purple-950/20'
                    : 'border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                {/* Top Badge Row */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {announcement.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Pin className="w-3 h-3 text-amber-300" />
                          Vastgezet
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryColor(
                          announcement.category
                        )}`}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {announcement.category || 'Algemeen'}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                    {announcement.title}
                  </h3>

                  {/* Content */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {isExpanded || !isLong
                      ? announcement.content
                      : `${announcement.content.slice(0, 220)}...`}
                  </p>
                </div>

                {/* Footer of Card */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] text-slate-500">
                    Geplaatst door: <span className="text-slate-300 font-medium">{announcement.authorName || 'Beheerder'}</span>
                  </span>

                  {isLong && (
                    <button
                      onClick={() => toggleExpand(announcement.id)}
                      className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium text-xs transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <span>Minder tonen</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Lees meer</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

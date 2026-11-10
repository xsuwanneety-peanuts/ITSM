import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  ArrowRight,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { KnowledgeArticle } from '../types/itsm.ts';
import { KNOWLEDGE_ARTICLES } from '../data/seedData.ts';

interface KnowledgeBaseViewProps {
  onOpenCreateTicket: () => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  onOpenCreateTicket,
}) => {
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(KNOWLEDGE_ARTICLES[0]);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean>>({});

  const filteredArticles = KNOWLEDGE_ARTICLES.filter(
    (art) =>
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.content.toLowerCase().includes(search.toLowerCase()) ||
      art.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleFeedback = (artId: string) => {
    setFeedbackSent((prev) => ({ ...prev, [artId]: true }));
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-white font-sans">
      {/* Left List of Articles */}
      <div className="w-80 border-r border-slate-200 bg-slate-50/80 flex flex-col">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 text-sm">
            <BookOpen className="h-4 w-4 text-red-600" />
            <span>ฐานความรู้ไอที (Knowledge Base)</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาบทความช่วยเหลือ..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs focus:border-red-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {filteredArticles.map((art) => {
            const isSelected = selectedArticle?.id === art.id;
            return (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className={`rounded-xl p-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-red-50/80 border border-red-200 shadow-2xs' : 'hover:bg-slate-100/70'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                  {art.category}
                </span>
                <h4 className="font-bold text-slate-900 text-xs mt-1 leading-snug">{art.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{art.snippet}</p>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {art.views} ครั้ง
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" /> {art.helpfulCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Self-service footer */}
        <div className="border-t border-slate-200 p-3 bg-white text-xs">
          <p className="text-slate-500 text-[11px] mb-2">ไม่พบคำตอบที่คุณต้องการ?</p>
          <button
            type="button"
            onClick={onOpenCreateTicket}
            className="w-full rounded-lg bg-red-50 text-red-700 py-2 font-bold text-xs hover:bg-red-100 transition-colors cursor-pointer"
          >
            เปิดตั๋วขอความช่วยเหลือไอที &rarr;
          </button>
        </div>
      </div>

      {/* Right Reading Pane */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {selectedArticle ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                {selectedArticle.category}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-3">{selectedArticle.title}</h1>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                <span>เขียนโดย {selectedArticle.author}</span>
                <span>•</span>
                <span>อัปเดตเมื่อ {selectedArticle.updatedAt}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> อ่านแล้ว {selectedArticle.views} ครั้ง
                </span>
              </div>
            </div>

            <div className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed text-slate-700 border-t border-b border-slate-100 py-6 whitespace-pre-line">
              {selectedArticle.content}
            </div>

            {/* Helpful Question */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">บทความนี้มีประโยชน์ต่อคุณหรือไม่?</span>
              {feedbackSent[selectedArticle.id] ? (
                <span className="text-emerald-700 font-bold">ขอบคุณสำหรับข้อเสนอแนะของคุณ!</span>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFeedback(selectedArticle.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 text-slate-500" />
                    <span>มีประโยชน์</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(selectedArticle.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ThumbsDown className="h-3.5 w-3.5 text-slate-500" />
                    <span>ไม่ตรงคำถาม</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400 text-xs">
            เลือกบทความจากด้านซ้ายเพื่อเปิดอ่าน
          </div>
        )}
      </div>
    </div>
  );
};

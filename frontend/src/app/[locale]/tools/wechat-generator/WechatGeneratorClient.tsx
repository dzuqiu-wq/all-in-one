"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  MoreHorizontal,
  Mic,
  Smile,
  Plus,
  Upload,
  X,
  ChevronUp,
  ChevronDown,
  Trash2,
  Download,
  RotateCcw,
  Search,
  MessageCircle,
  Users,
  FolderOpen,
  Paperclip,
  AtSign,
  Settings2,
  LayoutGrid,
  Clock,
  HelpCircle,
  ChevronRight,
  Smartphone,
  Monitor,
} from "lucide-react";
import html2canvas from "html2canvas";
import ToolArticle from "@/components/ToolArticle";
import ShareButtons from "@/components/ShareButtons";
import { getArticle } from "@/content/articles";
import {
  type ChatMessage,
  type ViewMode,
  type MessageSender,
  type MessageType,
  DEFAULT_AVATAR_PLACEHOLDER,
  ME_AVATAR_PLACEHOLDER,
} from "@/lib/wechatTypes";
import { getWechatSample } from "@/lib/sampleData";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatSession {
  id: string;
  nickname: string;
  avatar: string;
  messages: ChatMessage[];
}

type EditorTab = "editor" | "timeline" | "faq";

function newId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function createDefaultSessions(): ChatSession[] {
  return [
    { id: newId(), nickname: "设计师小芮", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
    { id: newId(), nickname: "Alex", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
    { id: newId(), nickname: "Taylor", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
    { id: newId(), nickname: "Jordan", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
  ];
}

// ---------------------------------------------------------------------------
// Pill Toggle Button
// ---------------------------------------------------------------------------

interface PillToggleProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

function PillToggle<T extends string>({ options, value, onChange }: PillToggleProps<T>) {
  return (
    <div className="inline-flex bg-[var(--bg-elevated)] rounded-xl p-1 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
            value === opt.value
              ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile Viewer
// ---------------------------------------------------------------------------

interface MobileViewerProps {
  session: ChatSession;
}

function MobileViewer({ session }: MobileViewerProps) {
  const { nickname, avatar, messages } = session;

  return (
    <div className="max-w-[360px] w-full aspect-[9/19.5] bg-[#F3F3F3] shadow-2xl rounded-[32px] overflow-hidden border-[6px] border-slate-800 flex flex-col">
      {/* Status bar */}
      <div className="h-7 bg-black flex items-center justify-between px-4 text-white text-body-xs font-medium">
        <span className="w-12 text-left">9:41</span>
        <div className="flex items-center gap-1.5">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <rect x="0" y="8" width="2.5" height="4" rx="0.5" />
            <rect x="3.5" y="5" width="2.5" height="7" rx="0.5" />
            <rect x="7" y="2" width="2.5" height="10" rx="0.5" />
            <rect x="10.5" y="0" width="2.5" height="12" rx="0.5" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <path d="M8 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8 0l6 7.5H2L8 0z" />
          </svg>
          <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor">
            <rect x="0" y="1" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="17" y="4" width="2" height="4" rx="0.5" fill="currentColor" />
            <rect x="1.5" y="2.5" width="10" height="7" rx="1" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="bg-[#EDEDED] border-b border-[#D8D8D8] h-11 flex items-center justify-between px-3">
        <ChevronLeft className="w-5 h-5 text-[#333]" />
        <span className="text-title-sm font-medium text-[#333]">{nickname || "聊天"}</span>
        <MoreHorizontal className="w-5 h-5 text-[#333]" />
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-3 bg-[#EEEAE3] space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-[#999] text-body-xs mt-8">暂无消息</p>
        )}
        {messages.map((msg) => {
          if (msg.type === "time") {
            return (
              <div key={msg.id} className="text-center text-[#999] text-body-xs my-4">
                {msg.content}
              </div>
            );
          }
          if (msg.sender === "me") {
            return (
              <div key={msg.id} className="flex justify-end mr-2">
                <div className="relative max-w-[70%]">
                  <div className="bg-[#95EC69] text-[#191919] rounded-[4px] p-2 pr-6">
                    {msg.type === "text" && <p className="text-body-sm break-words">{msg.content}</p>}
                    {msg.type === "image" && msg.content && (
                      <img src={msg.content} alt="" className="max-w-[200px] rounded" />
                    )}
                  </div>
                  <div
                    className="absolute right-[-6px] top-[10px] w-0 h-0"
                    style={{
                      borderLeft: "6px solid #95EC69",
                      borderTop: "4px solid transparent",
                      borderBottom: "4px solid transparent",
                    }}
                  />
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className="flex justify-start ml-2">
              <img
                src={avatar || DEFAULT_AVATAR_PLACEHOLDER}
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
              />
              <div className="relative max-w-[70%] ml-2">
                <div className="bg-white text-[#191919] rounded-[4px] p-2">
                  {msg.type === "text" && <p className="text-body-sm break-words">{msg.content}</p>}
                  {msg.type === "image" && msg.content && (
                    <img src={msg.content} alt="" className="max-w-[200px] rounded" />
                  )}
                </div>
                <div
                  className="absolute left-[-6px] top-[10px] w-0 h-0"
                  style={{
                    borderRight: "6px solid white",
                    borderTop: "4px solid transparent",
                    borderBottom: "4px solid transparent",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Input bar */}
      <div className="bg-[#F7F7F7] border-t border-[#E5E5E5] h-12 flex items-center justify-around px-4">
        <Mic className="w-5 h-5 text-[#999]" />
        <Smile className="w-5 h-5 text-[#999]" />
        <Plus className="w-5 h-5 text-[#999]" />
        <div className="flex-1 mx-3 bg-white rounded-full px-4 py-2">
          <span className="text-body-xs text-[#999]">消息</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PC Viewer
// ---------------------------------------------------------------------------

interface PcViewerProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSessionSelect: (id: string) => void;
}

function PcViewer({ sessions, activeSessionId, onSessionSelect }: PcViewerProps) {
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? sessions[0];
  if (!activeSession) return null;

  const { nickname, avatar, messages } = activeSession;

  return (
    <div className="min-w-[640px] w-full bg-[#F5F5F5] border border-gray-300 shadow-2xl flex rounded-lg overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-14 bg-[#2E2E2E] flex flex-col items-center py-4 gap-4">
        <MessageCircle className="w-6 h-6 text-[#07C160]" />
        <Users className="w-6 h-6 text-[#7D7D7D]" />
        <div className="flex-1" />
        <div className="p-2">
          <Search className="w-4 h-4 text-[#7D7D7D]" />
        </div>
      </div>

      {/* Middle Queue */}
      <div className="w-52 bg-[#E6E5E5] border-r border-gray-300 flex flex-col">
        <div className="p-3 border-b border-gray-300">
          <div className="bg-white rounded-md px-3 py-1.5 flex items-center gap-2">
            <Search className="w-3 h-3 text-[#999]" />
            <span className="text-body-xs text-[#999]">搜索</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => onSessionSelect(s.id)}
                className={`px-3 py-2.5 cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-white border-l-2 border-[#07C160]"
                    : "hover:bg-[#D8D8D8] border-l-2 border-transparent"
                }`}
              >
                <p className="text-title-xs font-medium text-[#1a1a1a] truncate">{s.nickname}</p>
                <p className="text-xs text-[#999] truncate">
                  {s.messages.length > 0
                    ? s.messages[s.messages.length - 1].content.slice(0, 20) + "…"
                    : "点击开始聊天"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col bg-[#EDEDED]">
        <div className="bg-[#FAFAFA] border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#07C160] rounded-full" />
          <span className="text-title-sm font-medium text-[#1a1a1a]">{nickname || "聊天"}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-[#999] text-body-xs mt-8">暂无消息</p>
          )}
          {messages.map((msg) => {
            if (msg.type === "time") {
              return (
                <div key={msg.id} className="text-center text-[#999] text-body-xs my-4">
                  {msg.content}
                </div>
              );
            }
            if (msg.sender === "me") {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="relative max-w-[65%]">
                    <div className="bg-[#95EC69] text-[#191919] rounded-[4px] p-2 pr-7">
                      {msg.type === "text" && <p className="text-body-sm break-words">{msg.content}</p>}
                      {msg.type === "image" && msg.content && (
                        <img src={msg.content} alt="" className="max-w-[180px] rounded" />
                      )}
                    </div>
                    <div
                      className="absolute right-[-5px] top-[8px] w-0 h-0"
                      style={{
                        borderLeft: "5px solid #95EC69",
                        borderTop: "3px solid transparent",
                        borderBottom: "3px solid transparent",
                      }}
                    />
                  </div>
                </div>
              );
            }
            return (
              <div key={msg.id} className="flex justify-start">
                <img
                  src={avatar || DEFAULT_AVATAR_PLACEHOLDER}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="relative max-w-[65%] ml-2">
                  <div className="bg-white text-[#191919] rounded-[4px] p-2">
                    {msg.type === "text" && <p className="text-body-sm break-words">{msg.content}</p>}
                    {msg.type === "image" && msg.content && (
                      <img src={msg.content} alt="" className="max-w-[180px] rounded" />
                    )}
                  </div>
                  <div
                    className="absolute left-[-5px] top-[8px] w-0 h-0"
                    style={{
                      borderRight: "5px solid white",
                      borderTop: "3px solid transparent",
                      borderBottom: "3px solid transparent",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border-t border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2 text-[#999]">
            <Smile className="w-4 h-4" />
            <Paperclip className="w-4 h-4" />
            <AtSign className="w-4 h-4" />
          </div>
          <textarea
            className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-body-sm text-[#1a1a1a] focus:outline-none focus:border-[#07C160]"
            rows={3}
            placeholder="输入消息…"
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FAQ Accordion
// ---------------------------------------------------------------------------

interface FAQItem {
  q: string;
  a: string;
}

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-1">
      {items.map((item, idx) => (
        <div key={idx} className="border-b border-[var(--border-subtle)] last:border-0">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between py-4 text-left hover:text-[var(--accent-violet)] transition-colors group"
          >
            <span className="text-sm text-[var(--text-primary)] font-medium pr-4 group-hover:text-[var(--accent-violet)]">{item.q}</span>
            <ChevronRight
              className={`w-4 h-4 text-[var(--text-secondary)] transition-all duration-200 flex-shrink-0 group-hover:text-[var(--accent-violet)] ${
                openIndex === idx ? "rotate-90" : ""
              }`}
            />
          </button>
          {openIndex === idx && (
            <div className="pb-4 -mt-1">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface WechatGeneratorClientProps {
  locale: string;
}

export default function WechatGeneratorClient({ locale }: WechatGeneratorClientProps) {
  const t = useTranslations("tools.wechatGenerator");
  // Use the locale prop directly from server component for correct SSG/SSR behavior
  const isZh = locale === "zh";

  // State
  const [sessions, setSessions] = useState<ChatSession[]>(createDefaultSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>("mobile");
  const [activeTab, setActiveTab] = useState<EditorTab>("editor");

  const previewWrapperRef = useRef<HTMLDivElement>(null);

  const [sender, setSender] = useState<MessageSender>("me");
  const [msgType, setMsgType] = useState<MessageType>("text");
  const [textContent, setTextContent] = useState("");
  const [imageContent, setImageContent] = useState<string>("");
  const [timeContent, setTimeContent] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? sessions[0],
    [sessions, activeSessionId]
  );

  // Actions
  const addMessage = useCallback((msg: ChatMessage) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, msg] }
          : s
      )
    );
  }, [activeSessionId]);

  const removeMessage = useCallback((id: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: s.messages.filter((m) => m.id !== id) }
          : s
      )
    );
  }, [activeSessionId]);

  const moveMessage = useCallback((id: string, direction: "up" | "down") => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const idx = s.messages.findIndex((m) => m.id === id);
        if (idx === -1) return s;
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= s.messages.length) return s;
        const msgs = [...s.messages];
        [msgs[idx], msgs[newIdx]] = [msgs[newIdx], msgs[idx]];
        return { ...s, messages: msgs };
      })
    );
  }, [activeSessionId]);

  const updateNickname = useCallback((nickname: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, nickname } : s))
    );
  }, [activeSessionId]);

  const updateAvatar = useCallback((avatar: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, avatar } : s))
    );
    setAvatarPreview("");
  }, [activeSessionId]);

  const resetChat = useCallback(() => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [], avatar: DEFAULT_AVATAR_PLACEHOLDER }
          : s
      )
    );
    setAvatarPreview("");
    setTextContent("");
    setImageContent("");
    setTimeContent("");
  }, [activeSessionId]);

  const handleAddMessage = useCallback(() => {
    if (msgType === "text" && !textContent.trim()) return;
    if (msgType === "image" && !imageContent) return;
    if (msgType === "time" && !timeContent.trim()) return;

    const msg: ChatMessage = {
      id: newId(),
      sender,
      type: msgType,
      content:
        msgType === "text"
          ? textContent.trim()
          : msgType === "image"
            ? imageContent
            : timeContent.trim(),
    };
    addMessage(msg);
    setTextContent("");
    setImageContent("");
    setTimeContent("");
  }, [sender, msgType, textContent, imageContent, timeContent, addMessage]);

  const handleLoadSample = useCallback(() => {
    const sample = getWechatSample(locale === "zh" ? "zh" : "en");
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, nickname: sample.nickname, messages: sample.messages }
          : s
      )
    );
  }, [locale, activeSessionId]);

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setAvatarPreview(dataUrl);
    updateAvatar(dataUrl);
  }, [updateAvatar]);

  const handleResetAvatar = useCallback(() => {
    setAvatarPreview("");
    updateAvatar(DEFAULT_AVATAR_PLACEHOLDER);
  }, [updateAvatar]);

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setImageContent(dataUrl);
  }, []);

  const handleExportPng = useCallback(async () => {
    const wrapper = previewWrapperRef.current;
    if (!wrapper) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `wechat-mockup-${Date.now()}.png`;
      a.click();
    } finally {
      setIsExporting(false);
    }
  }, []);

  // i18n FAQ items
  const faqItems: FAQItem[] = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];

  if (!activeSession) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header Bar */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: Page Title */}
            <div>
              <h1 className="text-base font-semibold text-[var(--text-primary)]">{t("title")}</h1>
              <p className="text-xs text-[var(--text-secondary)]">{t("tag")}</p>
            </div>

            {/* Center: View Mode Toggle */}
            <div className="flex items-center gap-3">
              <PillToggle
                options={[
                  { value: "mobile", label: t("mobile") },
                  { value: "pc", label: t("pc") },
                ]}
                value={viewMode}
                onChange={setViewMode}
              />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                {t("sampleButton")}
              </button>
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExporting}
                className="px-3 py-1.5 text-xs font-medium bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    {t("exporting")}
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    {t("exportImage")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Panel - Session Info & Editor */}
          <div className="w-[380px] flex-shrink-0 space-y-6">
            {/* Session Selector */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-[var(--text-primary)]">{t("activeSession")}</span>
                <span className="text-xs text-[var(--text-secondary)]">{activeSession.nickname}</span>
              </div>
              {viewMode === "pc" && (
                <div className="grid grid-cols-2 gap-1.5">
                  {sessions.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveSessionId(s.id)}
                      className={`px-2 py-1.5 text-xs rounded-md transition-all truncate ${
                        s.id === activeSessionId
                          ? "bg-[var(--accent-green)] text-white shadow-sm"
                          : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                      }`}
                    >
                      {s.nickname || `${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Card */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-5 space-y-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
                <Settings2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span>{t("generalConfig")}</span>
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1.5">{t("nickname")}</label>
                <input
                  type="text"
                  value={activeSession.nickname}
                  onChange={(e) => updateNickname(e.target.value)}
                  placeholder={t("nicknamePlaceholder")}
                  className="w-full px-4 py-2.5 text-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-violet)] transition-colors"
                />
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1.5">{t("avatar")}</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-green)] text-white text-xs font-medium rounded-lg hover:bg-[#06a055] transition-colors">
                    <Upload className="w-3 h-3" />
                    {t("uploadAvatar")}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleAvatarChange}
                      className="sr-only"
                    />
                  </label>
                  {(avatarPreview || activeSession.avatar) && (
                    <button
                      type="button"
                      onClick={handleResetAvatar}
                      className="p-1.5 text-[#999] hover:text-[#1a1a1a] transition-colors"
                      title={t("resetAvatar")}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {(avatarPreview || activeSession.avatar) && (
                  <div className="mt-2 w-10 h-10 rounded-full overflow-hidden border border-[#EEE]">
                    <img
                      src={avatarPreview || activeSession.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
              <div className="flex border-b border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setActiveTab("editor")}
                  className={`flex-1 px-4 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 relative ${
                    activeTab === "editor"
                      ? "text-[var(--accent-green)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--accent-green)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <LayoutGrid className="w-3 h-3" />
                  {t("messageEditor")}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("timeline")}
                  className={`flex-1 px-4 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 relative ${
                    activeTab === "timeline"
                      ? "text-[var(--accent-green)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--accent-green)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {t("timeline")}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("faq")}
                  className={`flex-1 px-4 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 relative ${
                    activeTab === "faq"
                      ? "text-[var(--accent-green)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--accent-green)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <HelpCircle className="w-3 h-3" />
                  {t("faqTitle")}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {/* Editor Tab */}
                {activeTab === "editor" && (
                  <div className="space-y-4">
                    {/* Sender */}
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] font-medium mb-2">{t("sender")}</label>
                      <PillToggle
                        options={[
                          { value: "me", label: t("me") },
                          { value: "other", label: t("other") },
                        ]}
                        value={sender}
                        onChange={setSender}
                      />
                    </div>

                    {/* Message Type */}
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] font-medium mb-2">{t("messageType")}</label>
                      <PillToggle
                        options={[
                          { value: "text", label: t("typeText") },
                          { value: "image", label: t("typeImage") },
                          { value: "time", label: t("typeTime") },
                        ]}
                        value={msgType}
                        onChange={setMsgType}
                      />
                    </div>

                    {/* Content Input */}
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] font-medium mb-2">{t("messageContent")}</label>
                      {msgType === "text" && (
                        <textarea
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          placeholder={t("textPlaceholder")}
                          rows={3}
                          className="w-full px-4 py-3 text-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] resize-none focus:outline-none focus:border-[var(--accent-violet)] transition-colors"
                        />
                      )}
                      {msgType === "image" && (
                        <div>
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] rounded-xl hover:border-[var(--accent-violet)] hover:text-[var(--text-primary)] transition-colors">
                            <Paperclip className="w-3 h-3" />
                            {t("attachImage")}
                            <input
                              type="file"
                              accept="image/png,image/jpeg"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                          {imageContent && (
                            <div className="mt-2 flex items-center gap-2">
                              <img src={imageContent} alt="preview" className="w-12 h-12 object-cover rounded-lg border border-[#EEE]" />
                              <span className="text-xs text-[#07C160]">{t("attachedImage")}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {msgType === "time" && (
                        <input
                          type="text"
                          value={timeContent}
                          onChange={(e) => setTimeContent(e.target.value)}
                          placeholder={t("timePlaceholder")}
                          className="w-full px-4 py-3 text-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-violet)] transition-colors"
                        />
                      )}
                    </div>

                    {/* Add Button */}
                    <button
                      type="button"
                      onClick={handleAddMessage}
                      className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-medium rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      {t("add")}
                    </button>
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === "timeline" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#999]">{activeSession.messages.length} {isZh ? "条消息" : "messages"}</span>
                      <button
                        type="button"
                        onClick={resetChat}
                        className="text-xs text-[#999] hover:text-[#1a1a1a] transition-colors"
                      >
                        {t("reset")}
                      </button>
                    </div>

                    {activeSession.messages.length === 0 ? (
                      <div className="text-center py-6">
                        <MessageCircle className="w-8 h-8 text-[#DDD] mx-auto mb-2" />
                        <p className="text-xs text-[var(--text-secondary)]">{t("empty")}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {activeSession.messages.map((msg, idx) => (
                          <div
                            key={msg.id}
                            className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]"
                          >
                            <img
                              src={msg.sender === "me" ? ME_AVATAR_PLACEHOLDER : (activeSession.avatar || DEFAULT_AVATAR_PLACEHOLDER)}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[var(--text-primary)] truncate">
                                {msg.type === "time" ? `⏱ ${msg.content}` : msg.content}
                              </p>
                            </div>
                            <div className="flex gap-0.5">
                              <button
                                type="button"
                                onClick={() => moveMessage(msg.id, "up")}
                                disabled={idx === 0}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveMessage(msg.id, "down")}
                                disabled={idx === activeSession.messages.length - 1}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeMessage(msg.id)}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* FAQ Tab */}
                {activeTab === "faq" && (
                  <FAQAccordion items={faqItems} />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 flex items-start justify-center sticky top-24">
            <div
              id="wechat-preview-wrapper"
              ref={previewWrapperRef}
            >
              <div className="relative">
                {/* Decorative glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-violet)]/5 to-[var(--accent-green)]/5 rounded-3xl blur-2xl -z-10" />

                {viewMode === "mobile" ? (
                  <MobileViewer session={activeSession} />
                ) : (
                  <PcViewer
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSessionSelect={setActiveSessionId}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share & Article */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <ShareButtons
          title={{
            en: "WeChat Chat History Generator — All-in-One Toolbox",
            zh: "微信聊天记录生成器 — All-in-One Toolbox",
          }}
          eyebrow={{
            en: "Share this tool",
            zh: "分享这个工具",
          }}
          hashtags={["WeChat", "ChatMockup", "DesignTools", "AllInOneToolbox"]}
        />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pb-16">
        <ToolArticle content={getArticle("wechat-generator", locale as "en" | "zh")} />
      </div>
    </div>
  );
}
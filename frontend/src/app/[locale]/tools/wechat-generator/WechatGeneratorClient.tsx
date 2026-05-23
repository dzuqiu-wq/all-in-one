"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
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
    { id: newId(), nickname: "Friend", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
    { id: newId(), nickname: "Alex", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
    { id: newId(), nickname: "Taylor", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
    { id: newId(), nickname: "Jordan", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
  ];
}

function createEmptySession(): ChatSession {
  return { id: newId(), nickname: "", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] };
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
    <div className="inline-flex bg-[#F0F0F0] rounded-full p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 text-body-sm font-medium rounded-full transition-all ${
            value === opt.value
              ? "bg-white text-ink shadow-sm"
              : "text-muted hover:text-ink"
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
    <div className="max-w-[375px] w-full aspect-[9/19.5] bg-[#F3F3F3] shadow-2xl rounded-[32px] overflow-hidden border-[6px] border-slate-800 flex flex-col">
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
        <ChevronLeft className="w-5 h-5 text-ink" />
        <span className="text-title-sm font-medium text-ink">{nickname || "Chat"}</span>
        <MoreHorizontal className="w-5 h-5 text-ink" />
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-3 bg-[#EEEAE3] space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-muted text-body-xs mt-8">No messages yet</p>
        )}
        {messages.map((msg) => {
          if (msg.type === "time") {
            return (
              <div key={msg.id} className="text-center text-muted text-body-xs my-4">
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
        <Mic className="w-5 h-5 text-muted" />
        <Smile className="w-5 h-5 text-muted" />
        <Plus className="w-5 h-5 text-muted" />
        <div className="flex-1 mx-3 bg-white rounded-full px-4 py-2">
          <span className="text-body-xs text-muted">Message</span>
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
    <div className="min-w-[600px] w-full aspect-[4/3] bg-[#F5F5F5] border border-gray-300 shadow-xl flex rounded-md overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-16 bg-[#2E2E2E] flex flex-col items-center py-4 gap-4">
        <MessageCircle className="w-6 h-6 text-[#7D7D7D]" />
        <Users className="w-6 h-6 text-[#7D7D7D]" />
        <div className="flex-1" />
        <div className="p-2">
          <Search className="w-4 h-4 text-[#7D7D7D]" />
        </div>
      </div>

      {/* Middle Queue — Contact List */}
      <div className="w-48 bg-[#E6E5E5] border-r border-gray-300 flex flex-col">
        <div className="p-3 border-b border-gray-300">
          <div className="bg-white rounded-md px-3 py-1.5 flex items-center gap-2">
            <Search className="w-3 h-3 text-muted" />
            <span className="text-body-xs text-muted">Search</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => onSessionSelect(s.id)}
                className={`px-3 py-2 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-white border-l-2 border-[#07C160]"
                    : "hover:bg-[#D8D8D8] border-l-2 border-transparent"
                }`}
              >
                <p className="text-title-xs font-medium text-ink truncate">{s.nickname}</p>
                <p className="text-body-xs text-muted truncate">
                  {s.messages.length > 0
                    ? s.messages[s.messages.length - 1].content.slice(0, 20) + "…"
                    : "Click to chat"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F5F5F5]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#07C160] rounded-full" />
          <span className="text-title-sm font-medium text-ink">{nickname || "Chat"}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-muted text-body-xs mt-8">No messages yet</p>
          )}
          {messages.map((msg) => {
            if (msg.type === "time") {
              return (
                <div key={msg.id} className="text-center text-muted text-body-xs my-4">
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

        {/* Input area */}
        <div className="bg-white border-t border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2 text-muted">
            <Smile className="w-4 h-4" />
            <Paperclip className="w-4 h-4" />
            <AtSign className="w-4 h-4" />
          </div>
          <textarea
            className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-primary"
            rows={3}
            placeholder="Type a message…"
          />
        </div>
      </div>
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
  const resolvedLocale = useLocale();

  // Multi-session state
  const [sessions, setSessions] = useState<ChatSession[]>(createDefaultSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>("mobile");

  const previewWrapperRef = useRef<HTMLDivElement>(null);

  // Editor state
  const [sender, setSender] = useState<MessageSender>("me");
  const [msgType, setMsgType] = useState<MessageType>("text");
  const [textContent, setTextContent] = useState("");
  const [imageContent, setImageContent] = useState<string>("");
  const [timeContent, setTimeContent] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Avatar local state
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Derive active session
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? sessions[0],
    [sessions, activeSessionId]
  );

  // Actions that operate on active session
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

  // i18n with fallback for sampleButton
  const sampleBtnText = t("sampleButton", { defaultValue: resolvedLocale === "zh" ? "一键载入示例" : "Try with Sample File" });

  if (!activeSession) return null;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-6 py-section">
        {/* Page Header */}
        <div className="mb-8">
          <div className="caption-upper text-muted mb-4">{t("tag")}</div>
          <h1 className="text-display-lg font-serif text-ink mb-4">{t("title")}</h1>
          <p className="text-title-md text-body max-w-2xl leading-relaxed">{t("description")}</p>
        </div>

        {/* Workspace Split: Left Controls | Right Preview */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column — Control Panel (col-span-12 lg:col-span-5) */}
          <div className="col-span-12 lg:col-span-5 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)] pr-2">

            {/* Card 1: View Mode + Active Session Profile */}
            <div className="surface-card rounded-xl p-lg space-y-5">
              <h2 className="text-title-sm font-medium text-ink">{t("generalConfig")}</h2>

              {/* View Mode Toggle */}
              <div>
                <label className="caption-upper text-muted-soft block mb-2">{t("viewMode")}</label>
                <PillToggle
                  options={[
                    { value: "mobile", label: t("mobile") },
                    { value: "pc", label: t("pc") },
                  ]}
                  value={viewMode}
                  onChange={setViewMode}
                />
              </div>

              {/* Session Selector (PC mode only) */}
              {viewMode === "pc" && (
                <div>
                  <label className="caption-upper text-muted-soft block mb-2">{t("activeSession")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {sessions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveSessionId(s.id)}
                        className={`px-3 py-2 rounded-md text-body-sm font-medium transition-all ${
                          s.id === activeSessionId
                            ? "bg-[#07C160] text-white"
                            : "bg-canvas border border-hairline text-ink hover:border-primary"
                        }`}
                      >
                        {s.nickname}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nickname + Avatar Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nickname */}
                <div>
                  <label className="caption-upper text-muted-soft block mb-2">{t("nickname")}</label>
                  <input
                    type="text"
                    value={activeSession.nickname}
                    onChange={(e) => updateNickname(e.target.value)}
                    placeholder={t("nicknamePlaceholder")}
                    className="w-full px-3 py-2 surface-card border border-hairline rounded-md text-body-sm text-ink focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Avatar */}
                <div>
                  <label className="caption-upper text-muted-soft block mb-2">{t("avatar")}</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors">
                      <Upload className="w-4 h-4" />
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
                        className="p-2 text-muted hover:text-ink transition-colors"
                        title={t("resetAvatar")}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {(avatarPreview || activeSession.avatar) && (
                    <div className="mt-3 w-12 h-12 rounded-full overflow-hidden border border-hairline">
                      <img
                        src={avatarPreview || activeSession.avatar}
                        alt="avatar preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted">{t("avatarHint")}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Message Editor */}
            <div className="surface-card rounded-xl p-lg space-y-5">
              <h2 className="text-title-sm font-medium text-ink">{t("messageEditor")}</h2>

              {/* Sender Toggle */}
              <div>
                <label className="caption-upper text-muted-soft block mb-2">{t("sender")}</label>
                <PillToggle
                  options={[
                    { value: "me", label: t("me") },
                    { value: "other", label: t("other") },
                  ]}
                  value={sender}
                  onChange={setSender}
                />
              </div>

              {/* Message Type Toggle */}
              <div>
                <label className="caption-upper text-muted-soft block mb-2">{t("messageType")}</label>
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
                <label className="caption-upper text-muted-soft block mb-2">{t("messageContent")}</label>
                {msgType === "text" && (
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder={t("textPlaceholder")}
                    rows={3}
                    className="w-full px-3 py-2 surface-card border border-hairline rounded-md text-body-sm text-ink resize-none focus:border-primary focus:outline-none"
                  />
                )}
                {msgType === "image" && (
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-canvas border border-hairline text-body-sm text-ink rounded-md hover:border-primary transition-colors">
                      <Paperclip className="w-4 h-4" />
                      {t("attachImage")}
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    {imageContent && (
                      <div className="mt-3">
                        <img src={imageContent} alt="preview" className="w-24 h-24 object-cover rounded border border-hairline" />
                        <p className="mt-1 text-xs text-muted">{t("attachedImage")}</p>
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
                    className="w-full px-3 py-2 surface-card border border-hairline rounded-md text-body-sm text-ink focus:border-primary focus:outline-none"
                  />
                )}
              </div>

              {/* Coral Add Button */}
              <button
                type="button"
                onClick={handleAddMessage}
                className="w-full py-2.5 bg-[#FA9D8B] text-white text-body-sm font-medium rounded-md hover:bg-[#e8857a] transition-colors"
              >
                {t("add")}
              </button>

              {/* Sample Button */}
              <button
                type="button"
                onClick={handleLoadSample}
                className="w-full py-2.5 bg-surface-cream-strong text-primary text-body-sm font-medium rounded-md border border-primary/30 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                {sampleBtnText}
              </button>
            </div>

            {/* Card 3: Timeline */}
            <div className="surface-card rounded-xl p-lg space-y-4">
              <h2 className="text-title-sm font-medium text-ink">{t("timeline")}</h2>

              {activeSession.messages.length === 0 ? (
                <p className="text-body-sm text-muted text-center py-4">{t("empty")}</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeSession.messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className="flex items-center gap-2 p-2 bg-canvas rounded-md border border-hairline"
                    >
                      <img
                        src={msg.sender === "me" ? ME_AVATAR_PLACEHOLDER : (activeSession.avatar || DEFAULT_AVATAR_PLACEHOLDER)}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-xs text-ink truncate">
                          {msg.type === "time" ? `⏱ ${msg.content}` : msg.content}
                        </p>
                        <p className="text-xs text-muted capitalize">{msg.type}</p>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#EDEDED] rounded text-xs text-muted capitalize">
                        {msg.sender}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveMessage(msg.id, "up")}
                          disabled={idx === 0}
                          className="p-1 text-muted hover:text-ink transition-colors disabled:opacity-30"
                          title={t("moveUp")}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMessage(msg.id, "down")}
                          disabled={idx === activeSession.messages.length - 1}
                          className="p-1 text-muted hover:text-ink transition-colors disabled:opacity-30"
                          title={t("moveDown")}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMessage(msg.id)}
                          className="p-1 text-muted hover:text-error transition-colors"
                          title={t("removeRow")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Export & Reset */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleExportPng}
                  disabled={isExporting}
                  className="flex-1 py-2 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      {t("exporting")}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      {t("exportImage")}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetChat}
                  className="px-3 py-2 text-muted hover:text-ink transition-colors"
                  title={t("reset")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column — Live Preview (col-span-12 lg:col-span-7) */}
          <div className="col-span-12 lg:col-span-7 flex items-start justify-center">
            <div id="wechat-preview-wrapper" ref={previewWrapperRef}>
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

        {/* Share Buttons */}
        <div className="mt-12">
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
      </div>

      {/* Long-form Article */}
      <div className="max-w-7xl mx-auto px-6 pb-section">
        <ToolArticle content={getArticle("wechat-generator", resolvedLocale as "en" | "zh")} />
      </div>
    </div>
  );
}
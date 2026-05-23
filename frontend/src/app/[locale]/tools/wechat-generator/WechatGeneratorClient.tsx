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
  HelpCircle,
  ChevronRight,
  PanelLeft,
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
    { id: newId(), nickname: "小王", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
    { id: newId(), nickname: "Alex", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
    { id: newId(), nickname: "Taylor", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
    { id: newId(), nickname: "Jordan", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] },
  ];
}

function createEmptySession(): ChatSession {
  return { id: newId(), nickname: "", avatar: DEFAULT_AVATAR_PLACEHOLDER, messages: [] };
}

// ---------------------------------------------------------------------------
// Pill Toggle Button — Premium Segmented Control
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
          className={`px-4 py-1.5 text-body-sm font-medium rounded-full transition-all duration-200 ${
            value === opt.value
              ? "bg-[#1a1a2e] text-white shadow-sm"
              : "text-[#666] hover:text-[#1a1a2e]"
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

      {/* Middle Queue — Contact List */}
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

      {/* Right Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#EDEDED]">
        {/* Header */}
        <div className="bg-[#FAFAFA] border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#07C160] rounded-full" />
          <span className="text-title-sm font-medium text-[#1a1a1a]">{nickname || "聊天"}</span>
        </div>

        {/* Messages */}
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

        {/* Input area */}
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
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="border border-hairline rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between p-4 text-left bg-canvas hover:bg-surface-card transition-colors"
          >
            <span className="text-body-sm font-medium text-ink">{item.q}</span>
            <ChevronRight
              className={`w-4 h-4 text-muted transition-transform duration-200 ${
                openIndex === idx ? "rotate-90" : ""
              }`}
            />
          </button>
          {openIndex === idx && (
            <div className="px-4 pb-4 pt-2 bg-white">
              <p className="text-body-sm text-body leading-relaxed">{item.a}</p>
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
  const resolvedLocale = useLocale();
  const isZh = resolvedLocale === "zh";

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

  // i18n-aware sample button text
  const sampleBtnText = isZh ? "一键载入示例" : "Try with Sample File";

  // FAQ items in both languages
  const faqItems: FAQItem[] = isZh
    ? [
        { q: "我在这里放的内容会被上传吗？", a: "不会。每一张头像、每一张附图、每一条消息都只停留在你这个浏览器标签页里。图片附件通过 FileReader 读为 Base64 data URI，保存在 React state 中，直到你关闭页面；整条工具链不调任何后端。PNG 导出由 html2canvas 在本地完成，产物经 Blob URL 直接下载。" },
        { q: "能用它伪造聊天用于法律或诈骗用途吗？", a: "不可以，我们强烈反对。这款生成器只面向设计稿、技术分享、产品评审、编辑配图等正当用途。伪造聊天截图用于欺骗、诈骗或骚扰，在多数司法管辖区都是违法行为；并且字体字距与表情渲染等视觉细节，在司法取证软件下也能被识别为伪造。请用它讲故事，不要用它欺骗别人。" },
        { q: "大尺寸导出时头像看起来有点糊？", a: "html2canvas 会以 2 倍设备像素比对预览 DOM 做光栅化，但如果上传的头像本身是小尺寸位图，被放大后在 Retina 屏上自然会发软。想要锐利导出，请上传至少 256×256 像素的头像，或者直接使用 SVG。Mockup 本身的气泡、图标、状态栏都是矢量或纯 CSS，不受影响。" },
      ]
    : [
        { q: "Is anything I drop in here uploaded to a server?", a: "No. Every avatar, attached image, and message line stays inside the current browser tab. Image attachments are read via FileReader into a Base64 data URI and kept in React state until you close the tab — no part of the toolchain calls out to any backend. The PNG export is rendered locally via html2canvas; the resulting blob is downloaded directly from a Blob URL." },
        { q: "Can I use this to fake a chat for legal evidence?", a: "No, and we strongly advise against it. The generator is intended for design mockups, conference talks, editorial illustrations, internal product reviews, and similar legitimate use cases. Fabricating chat screenshots to deceive, defraud, or harass is illegal in most jurisdictions — and visual cues such as font kerning and emoji rendering also make crude forgeries detectable by forensic tooling. Use it for storytelling, not for misrepresentation." },
        { q: "Why does the avatar look slightly blurry when exported at large sizes?", a: "html2canvas rasterises the preview DOM at 2× device pixel ratio, but raster avatars uploaded at small sizes will upscale and may look soft on retina displays. For sharp exports, upload an avatar at least 256×256 px, or supply an SVG. The mockup itself stays crisp regardless because the chrome elements (bubbles, icons, status bar) are vector or pure CSS." },
      ];

  if (!activeSession) return null;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-6 py-section">
        {/* Page Header */}
        <div className="mb-10">
          <div className="caption-upper text-muted mb-4 tracking-wider">{t("tag")}</div>
          <h1 className="text-display-lg font-serif text-ink mb-4">{t("title")}</h1>
          <p className="text-title-md text-body max-w-2xl leading-relaxed">{t("description")}</p>
        </div>

        {/* Workspace Split: Left Controls | Right Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column — Control Dashboard (lg:col-span-5) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 lg:h-fit space-y-5 overflow-y-auto max-h-[calc(100vh-180px)] pr-2">

            {/* Card 1: View Mode + Active Session Profile */}
            <div className="bg-white rounded-2xl border border-hairline p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-hairline-soft">
                <PanelLeft className="w-4 h-4 text-primary" />
                <h2 className="text-title-sm font-medium text-ink">{t("generalConfig")}</h2>
              </div>

              {/* View Mode Toggle */}
              <div>
                <label className="caption-upper text-muted-soft block mb-2.5 text-xs tracking-wider">{t("viewMode")}</label>
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
                  <label className="caption-upper text-muted-soft block mb-2.5 text-xs tracking-wider">{t("activeSession")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {sessions.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveSessionId(s.id)}
                        className={`px-3 py-2.5 rounded-lg text-body-sm font-medium transition-all duration-200 ${
                          s.id === activeSessionId
                            ? "bg-[#07C160] text-white shadow-sm"
                            : "bg-[#f5f5f5] border border-hairline text-ink hover:border-[#07C160]/50"
                        }`}
                      >
                        <span className="truncate block">{s.nickname || `${isZh ? "会话" : "Chat"} ${idx + 1}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nickname + Avatar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nickname */}
                <div>
                  <label className="caption-upper text-muted-soft block mb-2.5 text-xs tracking-wider">{t("nickname")}</label>
                  <input
                    type="text"
                    value={activeSession.nickname}
                    onChange={(e) => updateNickname(e.target.value)}
                    placeholder={t("nicknamePlaceholder")}
                    className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-hairline rounded-lg text-body-sm text-ink placeholder:text-[#999] focus:border-[#07C160] focus:outline-none transition-colors"
                  />
                </div>

                {/* Avatar */}
                <div>
                  <label className="caption-upper text-muted-soft block mb-2.5 text-xs tracking-wider">{t("avatar")}</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-[#07C160] text-white text-body-sm font-medium rounded-lg hover:bg-[#06a055] transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t("uploadAvatar")}</span>
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
                        className="p-2 text-[#999] hover:text-[#1a1a1a] transition-colors"
                        title={t("resetAvatar")}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {(avatarPreview || activeSession.avatar) && (
                    <div className="mt-3 w-14 h-14 rounded-full overflow-hidden border-2 border-[#eee]">
                      <img
                        src={avatarPreview || activeSession.avatar}
                        alt="avatar preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="mt-2 text-xs text-[#999]">{t("avatarHint")}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Message Editor */}
            <div className="bg-white rounded-2xl border border-hairline p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-hairline-soft">
                <MessageCircle className="w-4 h-4 text-primary" />
                <h2 className="text-title-sm font-medium text-ink">{t("messageEditor")}</h2>
              </div>

              {/* Sender Toggle */}
              <div>
                <label className="caption-upper text-muted-soft block mb-2.5 text-xs tracking-wider">{t("sender")}</label>
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
                <label className="caption-upper text-muted-soft block mb-2.5 text-xs tracking-wider">{t("messageType")}</label>
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
                <label className="caption-upper text-muted-soft block mb-2.5 text-xs tracking-wider">{t("messageContent")}</label>
                {msgType === "text" && (
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder={t("textPlaceholder")}
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-hairline rounded-lg text-body-sm text-ink placeholder:text-[#999] resize-none focus:border-[#07C160] focus:outline-none transition-colors"
                  />
                )}
                {msgType === "image" && (
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2.5 bg-[#fafafa] border border-hairline text-body-sm text-ink rounded-lg hover:border-[#07C160] transition-colors">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{t("attachImage")}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    {imageContent && (
                      <div className="mt-3">
                        <img src={imageContent} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-hairline" />
                        <p className="mt-1.5 text-xs text-[#07C160] font-medium">{t("attachedImage")}</p>
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
                    className="w-full px-3.5 py-2.5 bg-[#fafafa] border border-hairline rounded-lg text-body-sm text-ink placeholder:text-[#999] focus:border-[#07C160] focus:outline-none transition-colors"
                  />
                )}
              </div>

              {/* Coral Add Button */}
              <button
                type="button"
                onClick={handleAddMessage}
                className="w-full py-3 bg-[#FA9D8B] text-white text-body-sm font-medium rounded-lg hover:bg-[#e8857a] active:scale-[0.98] transition-all duration-200 shadow-sm"
              >
                {t("add")}
              </button>

              {/* Sample Button */}
              <button
                type="button"
                onClick={handleLoadSample}
                className="w-full py-3 bg-[#fef9f3] text-[#b8783a] text-body-sm font-medium rounded-lg border border-[#e8c9a8] hover:bg-[#fdf3e7] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                {sampleBtnText}
              </button>
            </div>

            {/* Card 3: Timeline */}
            <div className="bg-white rounded-2xl border border-hairline p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-hairline-soft">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <h2 className="text-title-sm font-medium text-ink">{t("timeline")}</h2>
                </div>
                <span className="text-xs text-[#999] bg-[#f5f5f5] px-2 py-1 rounded-full">
                  {activeSession.messages.length} {isZh ? "条" : "items"}
                </span>
              </div>

              {activeSession.messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-10 h-10 text-[#ddd] mx-auto mb-3" />
                  <p className="text-body-sm text-[#999]">{t("empty")}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeSession.messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className="flex items-center gap-2.5 p-2.5 bg-[#fafafa] rounded-lg border border-[#eee] hover:border-[#ddd] transition-colors"
                    >
                      <img
                        src={msg.sender === "me" ? ME_AVATAR_PLACEHOLDER : (activeSession.avatar || DEFAULT_AVATAR_PLACEHOLDER)}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-xs text-[#1a1a1a] truncate">
                          {msg.type === "time" ? `⏱ ${msg.content}` : msg.content}
                        </p>
                        <p className="text-[10px] text-[#999] capitalize">{msg.type}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        msg.sender === "me" ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#fff3e0] text-[#ef6c00]"
                      }`}>
                        {isZh ? (msg.sender === "me" ? "我" : "对方") : msg.sender}
                      </span>
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveMessage(msg.id, "up")}
                          disabled={idx === 0}
                          className="p-1 text-[#999] hover:text-[#1a1a1a] transition-colors disabled:opacity-30"
                          title={t("moveUp")}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMessage(msg.id, "down")}
                          disabled={idx === activeSession.messages.length - 1}
                          className="p-1 text-[#999] hover:text-[#1a1a1a] transition-colors disabled:opacity-30"
                          title={t("moveDown")}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMessage(msg.id)}
                          className="p-1 text-[#999] hover:text-[#e53935] transition-colors"
                          title={t("removeRow")}
                        >
                          <Trash2 className="w-3 h-3" />
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
                  className="flex-1 py-2.5 bg-[#07C160] text-white text-body-sm font-medium rounded-lg hover:bg-[#06a055] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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
                  className="px-3 py-2.5 text-[#999] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] rounded-lg transition-colors"
                  title={t("reset")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl border border-hairline p-6 space-y-4">
              <div className="flex items-center gap-2 pb-4 border-b border-hairline-soft">
                <HelpCircle className="w-4 h-4 text-primary" />
                <h2 className="text-title-sm font-medium text-ink">{t("faqTitle")}</h2>
              </div>
              <FAQAccordion items={faqItems} />
            </div>
          </div>

          {/* Right Column — Live Preview (lg:col-span-7) */}
          <div className="lg:col-span-7 flex items-start justify-center">
            <div
              id="wechat-preview-wrapper"
              ref={previewWrapperRef}
              className="w-full flex justify-center"
            >
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
        <div className="mt-12 pt-8 border-t border-hairline">
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
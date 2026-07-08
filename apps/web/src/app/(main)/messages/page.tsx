"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, Search, Phone, Video, Info, Loader2, Plus, X } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { useApiClient } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatUser { id: string; username: string; avatarUrl: string | null; }
interface Message { id: string; conversationId: string; senderId: string; content: string; createdAt: string; sender: ChatUser; }
interface Conversation {
  id: string;
  participants: { user: ChatUser }[];
  messages: Message[];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ username, avatarUrl, size = 40, online = false }: { username: string; avatarUrl?: string | null; size?: number; online?: boolean }) {
  const initials = username.slice(0, 2).toUpperCase();
  const colors = ["from-blue-500 to-violet-600", "from-orange-500 to-red-600", "from-emerald-500 to-teal-600", "from-pink-500 to-rose-600"];
  const color = colors[username.charCodeAt(0) % colors.length];
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {avatarUrl
        ? <img src={avatarUrl} alt={username} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
        : <div style={{ width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 700, color: "white" }} className={`bg-gradient-to-br ${color}`}>{initials}</div>
      }
      {online && <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#10B981", border: "2px solid var(--surface)" }} />}
    </div>
  );
}

// ─── New Conversation Modal ────────────────────────────────────────────────────
function NewConversationModal({ onClose, onStart }: { onClose: () => void; onStart: (userId: string) => void }) {
  const authApi = useApiClient();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (q.trim().length < 1) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await authApi.get(`/users/search?q=${q}&limit=8`);
        if (res.data?.success) setResults(res.data.data || []);
      } catch { /* ignore */ } finally { setSearching(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24, width: "min(440px, 92vw)", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>New Conversation</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            id="new-conv-search"
            autoFocus
            type="text"
            placeholder="Search users to message..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 36px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", fontSize: 13, outline: "none", color: "var(--primary)" }}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {searching ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
              <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
            </div>
          ) : results.length === 0 && q.length > 0 ? (
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, padding: 24 }}>No users found</p>
          ) : (
            results.map((user) => (
              <button key={user.id} onClick={() => onStart(user.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--radius)", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", transition: "background 150ms" }}
                className="hover:bg-surface-elevated">
                <Avatar username={user.username} avatarUrl={user.avatarUrl} size={36} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{user.username}</p>
                  {user.profile?.headline && <p style={{ fontSize: 12, color: "var(--muted)" }}>{user.profile.headline}</p>}
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useUser();
  const { socket, onlineUsers } = useSocket();
  const authApi = useApiClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [showNewConv, setShowNewConv] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Fetch conversations ───────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const r = await authApi.get("/messages/conversations");
      setConversations(r.data.data || []);
      if (!activeConvId && r.data.data?.length > 0) setActiveConvId(r.data.data[0].id);
    } catch { /* ignore */ } finally {
      setLoadingConvs(false);
    }
  }, [activeConvId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadConversations(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Load messages for active conversation ─────────────────────────────────
  useEffect(() => {
    if (!activeConvId) return;
    setLoadingMsgs(true);
    setMessages([]);
    authApi.get(`/messages/conversations/${activeConvId}/messages`)
      .then((r) => setMessages(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
    authApi.put(`/messages/conversations/${activeConvId}/read`).catch(() => {});
  }, [activeConvId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Socket: join/leave room + listen for messages ────────────────────────
  useEffect(() => {
    if (!socket || !activeConvId) return;
    socket.emit("conversation:join", activeConvId);

    const handleNewMessage = (msg: Message) => {
      if (msg.conversationId === activeConvId) {
        setMessages((prev) => [...prev, msg]);
      }
      setConversations((prev) => prev.map((c) => c.id === msg.conversationId ? { ...c, messages: [msg] } : c));
    };
    const handleTypingStart = ({ clerkId }: { clerkId: string }) => {
      setTypingUsers((prev) => new Set([...prev, clerkId]));
    };
    const handleTypingStop = ({ clerkId }: { clerkId: string }) => {
      setTypingUsers((prev) => { const n = new Set(prev); n.delete(clerkId); return n; });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.emit("conversation:leave", activeConvId);
      socket.off("message:new", handleNewMessage);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, activeConvId]);

  // ─── Auto scroll ──────────────────────────────────────────────────────────
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ─── Send message ─────────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConvId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const res = await authApi.post(`/messages/conversations/${activeConvId}/messages`, { content: text });
      const msg: Message = res.data.data;
      setMessages((prev) => [...prev, msg]);
      socket?.emit("message:send", { conversationId: activeConvId, message: msg });
    } catch { setInput(text); } finally { setSending(false); }
  };

  // ─── Typing indicator ─────────────────────────────────────────────────────
  const handleInputChange = (val: string) => {
    setInput(val);
    if (!socket || !activeConvId || !user) return;
    socket.emit("typing:start", { conversationId: activeConvId, clerkId: user.id });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId: activeConvId, clerkId: user.id });
    }, 2000);
  };

  // ─── Start new conversation ───────────────────────────────────────────────
  const handleStartConversation = async (participantId: string) => {
    setShowNewConv(false);
    try {
      const res = await authApi.post("/messages/conversations", { participantId });
      if (res.data?.success) {
        const conv = res.data.data;
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === conv.id);
          if (exists) return prev;
          return [conv, ...prev];
        });
        setActiveConvId(conv.id);
      }
    } catch (err) { console.error(err); }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getOtherParticipant = useCallback((conv: Conversation) =>
    conv.participants.find((p) => p.user.id !== user?.id)?.user || conv.participants[0]?.user,
    [user]);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const otherUser = activeConv ? getOtherParticipant(activeConv) : null;

  const filteredConvs = conversations.filter((c) => {
    const other = getOtherParticipant(c);
    return other?.username?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ paddingTop: 24, height: "calc(100vh - 88px)", display: "flex", flexDirection: "column" }}>
      <AnimatePresence>
        {showNewConv && (
          <NewConversationModal
            onClose={() => setShowNewConv(false)}
            onStart={handleStartConversation}
          />
        )}
      </AnimatePresence>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", flex: 1 }} className="messages-grid-layout">

        {/* ── Chat List Sidebar ─────────────────────────────────────────── */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Messages</h2>
              <button
                id="new-conversation-btn"
                onClick={() => setShowNewConv(true)}
                title="New conversation"
                style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <input id="message-search" type="text" placeholder="Search chats..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", padding: "8px 12px 8px 34px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", fontSize: 13, outline: "none" }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingConvs ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                <Loader2 size={22} className="animate-spin" style={{ color: "var(--accent)" }} />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                <p style={{ marginBottom: 8 }}>No conversations yet</p>
                <button onClick={() => setShowNewConv(true)} style={{ color: "var(--accent)", fontSize: 13, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  + Start a new chat
                </button>
              </div>
            ) : filteredConvs.map((conv) => {
              const other = getOtherParticipant(conv);
              const lastMsg = conv.messages?.[0];
              const isOnline = other ? onlineUsers.has(other.id) : false;
              return (
                <div key={conv.id} id={`chat-item-${conv.id}`} onClick={() => setActiveConvId(conv.id)}
                  style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", background: activeConvId === conv.id ? "var(--surface-elevated)" : "transparent", transition: "background 150ms" }}
                  className="hover:bg-surface-elevated">
                  <Avatar username={other?.username || "?"} avatarUrl={other?.avatarUrl} online={isOnline} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{other?.username || "Unknown"}</span>
                      {lastMsg && <span style={{ fontSize: 10, color: "var(--muted)" }}>{formatRelativeTime(new Date(lastMsg.createdAt))}</span>}
                    </div>
                    {lastMsg && <p style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{lastMsg.content}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Chat Window ───────────────────────────────────────────────── */}
        {activeConv && otherUser ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Header */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar username={otherUser.username} avatarUrl={otherUser.avatarUrl} online={onlineUsers.has(otherUser.id)} size={36} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{otherUser.username}</p>
                  <p style={{ fontSize: 11, color: onlineUsers.has(otherUser.id) ? "#10B981" : "var(--muted)" }}>
                    {onlineUsers.has(otherUser.id) ? "● Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[Phone, Video, Info].map((Icon, i) => (
                  <button key={i} style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: "transparent", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} className="hover:bg-surface-elevated">
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {loadingMsgs ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                  <Loader2 size={22} className="animate-spin" style={{ color: "var(--accent)" }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--muted)", gap: 8 }}>
                  <Avatar username={otherUser.username} avatarUrl={otherUser.avatarUrl} size={56} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--secondary)" }}>{otherUser.username}</p>
                  <p style={{ fontSize: 13 }}>Send a message to start the conversation!</p>
                </div>
              ) : messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: 8 }}>
                    {!isMe && <Avatar username={msg.sender.username} avatarUrl={msg.sender.avatarUrl} size={28} />}
                    <div style={{ maxWidth: "70%" }}>
                      <div style={{ background: isMe ? "var(--accent)" : "var(--surface-elevated)", color: isMe ? "white" : "var(--primary)", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 14px", fontSize: 13, lineHeight: 1.5 }}>
                        {msg.content}
                      </div>
                      <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              <AnimatePresence>
                {typingUsers.size > 0 && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ background: "var(--surface-elevated)", borderRadius: "14px 14px 14px 4px", padding: "10px 14px", display: "flex", gap: 4 }}>
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                          style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--muted)", display: "block" }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
              <input
                id="message-input"
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                style={{ flex: 1, background: "var(--background)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", padding: "10px 16px", fontSize: 13, outline: "none", color: "var(--primary)" }}
              />
              <button type="submit" id="send-message-btn" disabled={!input.trim() || sending}
                style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: input.trim() ? "var(--accent)" : "var(--border)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed", flexShrink: 0, transition: "all 150ms" }}>
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)", gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--surface-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={28} style={{ color: "var(--accent)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--secondary)", marginBottom: 6 }}>Your Messages</p>
              <p style={{ fontSize: 13, marginBottom: 16 }}>Send private messages to other developers</p>
              <button onClick={() => setShowNewConv(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "var(--accent)", color: "white", border: "none", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={15} />
                New Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .messages-grid-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

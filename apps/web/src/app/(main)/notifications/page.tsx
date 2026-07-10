"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, UserPlus, MessageSquare, Star, Award, Trash2, Check, Bell, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { useApiClient } from "@/lib/api";

const iconMap: Record<string, any> = {
  LIKE: { icon: Heart, color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  FOLLOW: { icon: UserPlus, color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  FOLLOW_REQUEST: { icon: UserPlus, color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  COMMENT: { icon: MessageSquare, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
project_appreciation: { icon: Star, color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  ACHIEVEMENT: { icon: Award, color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
};

export default function NotificationsPage() {
  const authApi = useApiClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processedRequests, setProcessedRequests] = useState<Record<string, 'ACCEPTED' | 'DECLINED'>>({});
  const [followRequests, setFollowRequests] = useState<any[]>([]);

  const fetchFollowRequests = async () => {
    try {
      const res = await authApi.get("/users/me/follow-requests");
      if (res.data?.success) {
        setFollowRequests(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await authApi.get("/notifications");
      if (res.data?.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchFollowRequests();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAcceptFollowRequest = async (userId: string) => {
    try {
      await authApi.put(`/users/${userId}/follow/accept`);
      setFollowRequests((prev) => prev.filter((r) => r.id !== userId));
      setNotifications((prev) =>
        prev.map((n) =>
          n.fromUserId === userId && n.type === 'FOLLOW_REQUEST'
            ? { ...n, readAt: new Date(), message: "accepted follow request" }
            : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineFollowRequest = async (userId: string) => {
    try {
      await authApi.delete(`/users/${userId}/follow/decline`);
      setFollowRequests((prev) => prev.filter((r) => r.id !== userId));
      setNotifications((prev) =>
        prev.filter((n) => !(n.fromUserId === userId && n.type === 'FOLLOW_REQUEST'))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
    try {
      await authApi.put("/notifications/read-all");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await authApi.delete(`/notifications/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (notif: any) => {
    setProcessedRequests((prev) => ({ ...prev, [notif.id]: 'ACCEPTED' }));
    try {
      await authApi.put(`/users/${notif.fromUserId}/follow/accept`);
      // Update local state to show accepted and mark read
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, readAt: new Date(), message: "accepted follow request" } : n))
      );
      // Remove from top pending requests list if it exists
      setFollowRequests((prev) => prev.filter((r) => r.id !== notif.fromUserId));
    } catch (err) {
      console.error(err);
      setProcessedRequests((prev) => {
        const copy = { ...prev };
        delete copy[notif.id];
        return copy;
      });
    }
  };

  const handleDeclineRequest = async (notif: any) => {
    setProcessedRequests((prev) => ({ ...prev, [notif.id]: 'DECLINED' }));
    try {
      await authApi.delete(`/users/${notif.fromUserId}/follow/decline`);
      // Remove from list
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      // Remove from top pending requests list if it exists
      setFollowRequests((prev) => prev.filter((r) => r.id !== notif.fromUserId));
    } catch (err) {
      console.error(err);
      setProcessedRequests((prev) => {
        const copy = { ...prev };
        delete copy[notif.id];
        return copy;
      });
    }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Notifications</h1>
          <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 4 }}>
            You have <strong style={{ color: "var(--accent)" }}>{unreadCount}</strong> unread notifications
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            id="mark-all-read-btn"
            onClick={markAllRead}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "var(--secondary)" }}
          >
            <Check size={14} />
            Mark all read
          </button>
        )}
      </motion.div>

      {/* Pending Follow Requests section */}
      {!loading && followRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "18px 20px",
            marginBottom: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--primary)",
            }}
          >
            <UserPlus size={16} style={{ color: "var(--accent)" }} />
            Follow Requests ({followRequests.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {followRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  paddingBottom: 10,
                  borderBottom: "1px solid var(--border)",
                }}
                className="last:border-0 last:pb-0"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "var(--border)",
                      flexShrink: 0,
                    }}
                  >
                    {req.avatarUrl ? (
                      <img
                        src={req.avatarUrl}
                        alt={req.username}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {req.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{req.username}</p>
                    <p style={{ fontSize: 11.5, color: "var(--secondary)" }}>@{req.username}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleAcceptFollowRequest(req.id)}
                    style={{
                      padding: "6px 14px",
                      background: "var(--accent)",
                      color: "white",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "opacity 150ms",
                    }}
                    className="hover:opacity-90"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineFollowRequest(req.id)}
                    style={{
                      padding: "6px 14px",
                      background: "var(--surface-elevated, var(--border))",
                      color: "var(--primary)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "opacity 150ms",
                    }}
                    className="hover:opacity-90"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notifications List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
            <Bell size={32} style={{ color: "var(--muted)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 600 }}>All caught up!</p>
            <p style={{ fontSize: 13, color: "var(--secondary)", marginTop: 4 }}>No notifications found.</p>
          </div>
        ) : (
          notifications.map((notif, i) => {
            const iconData = iconMap[notif.type] || iconMap[notif.type?.toUpperCase()] || { icon: Bell, color: "var(--muted)", bg: "var(--surface-elevated)" };
            const Icon = iconData.icon;
            const status = processedRequests[notif.id];

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "16px 20px", background: notif.readAt ? "var(--surface)" : "var(--accent-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", position: "relative", transition: "background 150ms" }}
              >
                {/* Icon box */}
                <div style={{ width: 38, height: 38, borderRadius: 10, background: iconData.bg, display: "flex", alignItems: "center", flexShrink: 0, justifyContent: "center" }}>
                  <Icon size={16} style={{ color: iconData.color }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                    {notif.fromUser ? (
                      <>
                        <strong style={{ fontWeight: 600 }}>{notif.fromUser.username}</strong>{" "}
                        <span style={{ color: "var(--secondary)" }}>@{notif.fromUser.username}</span>{" "}
                      </>
                    ) : null}
                    {status === 'ACCEPTED' ? 'accepted follow request' : notif.message}
                  </p>
                  
                  {notif.type === 'FOLLOW_REQUEST' && !notif.readAt && !status && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => handleAcceptRequest(notif)}
                        style={{ padding: "6px 14px", borderRadius: "var(--radius-md)", background: "var(--accent)", border: "none", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "opacity 150ms" }}
                        className="hover:opacity-90"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(notif)}
                        style={{ padding: "6px 14px", borderRadius: "var(--radius-md)", background: "var(--border)", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "opacity 150ms" }}
                        className="hover:opacity-90"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {status && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: status === 'ACCEPTED' ? 'var(--accent)' : 'var(--muted)', marginTop: 8, display: "block" }}>
                      {status === 'ACCEPTED' ? '✓ Accepted' : 'Declined'}
                    </span>
                  )}

                  <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, display: "block" }}>
                    {formatRelativeTime(new Date(notif.createdAt))}
                  </span>
                </div>

                {/* Actions */}
                <button
                  id={`delete-notif-${notif.id}`}
                  onClick={() => deleteNotification(notif.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 6, alignSelf: "center", transition: "color 150ms" }}
                  className="hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

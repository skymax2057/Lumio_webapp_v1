"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, MoreVertical, Trash2, Edit3, Reply, X, Check, Sparkles } from "lucide-react";
import { GlowEffect } from "./glow-effect";
import { PremiumLikeButton } from "./premium-like-button";

export interface Comment {
  id: string;
  content: string;
  userId: string;
  user: {
    name: string | null;
    image: string | null;
  };
  parentId: string | null;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  isEdited: boolean;
  createdAt: string | Date;
  replies?: Comment[];
}

interface CommentsSectionProps {
  imageId: string;
  initialComments?: Comment[];
  currentUserId?: string;
  onAddComment?: (content: string, parentId?: string) => Promise<void>;
  onLikeComment?: (commentId: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
}

export function CommentsSection({
  imageId,
  initialComments = [],
  currentUserId,
  onAddComment,
  onLikeComment,
  onDeleteComment,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newComment]);

  // Group comments by parent (top-level comments with their replies)
  const groupedComments = comments.filter(c => c.parentId === null);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment?.(newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment?.(replyContent.trim(), parentId);
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to add reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likesCount: comment.isLikedByCurrentUser ? comment.likesCount - 1 : comment.likesCount + 1,
          isLikedByCurrentUser: !comment.isLikedByCurrentUser,
        };
      }
      // Also update if this comment is a reply
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                likesCount: reply.isLikedByCurrentUser ? reply.likesCount - 1 : reply.likesCount + 1,
                isLikedByCurrentUser: !reply.isLikedByCurrentUser,
              };
            }
            return reply;
          }),
        };
      }
      return comment;
    }));

    await onLikeComment?.(commentId);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) return;

    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));
    await onDeleteComment?.(commentId);
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Commentaires ({comments.length})
        </h3>
      </div>

      {/* Add comment input */}
      {currentUserId && (
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <GlowEffect variant="aurora">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                rows={1}
                className="w-full px-4 py-3 rounded-xl glass-premium border border-violet-500/30 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm bg-violet-500/5 text-foreground placeholder:text-muted-foreground/60"
                disabled={isSubmitting}
              />
            </div>
          </GlowEffect>
          <GlowEffect variant="multi-layer">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-3 rounded-xl glass-premium border border-violet-500/30 text-violet-400 font-medium text-sm flex items-center gap-2 hover:bg-violet-500/20 hover:border-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Envoyer
            </button>
          </GlowEffect>
        </form>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {groupedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onLike={handleLikeComment}
              onDelete={handleDeleteComment}
              onReply={(parentId) => setReplyingTo(parentId)}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={handleSubmitReply}
              formatDate={formatDate}
              isSubmitting={isSubmitting}
            />
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Soyez le premier à commenter cette œuvre ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentId: string) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (parentId: string) => void;
  formatDate: (date: string | Date) => string;
  isSubmitting: boolean;
}

function CommentItem({
  comment,
  currentUserId,
  onLike,
  onDelete,
  onReply,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  formatDate,
  isSubmitting,
}: CommentItemProps) {
  const [showActions, setShowActions] = useState(false);
  const isOwner = currentUserId === comment.userId;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <img
          src={comment.user.image || "/default-avatar.png"}
          alt={comment.user.name || "Utilisateur"}
          className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">
              {comment.user.name || "Anonyme"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-muted-foreground italic">(modifié)</span>
            )}
          </div>

          {/* Text */}
          <p className="mt-1 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <PremiumLikeButton
              initialLiked={comment.isLikedByCurrentUser}
              initialCount={comment.likesCount}
              onLikeChange={() => onLike(comment.id)}
              variant="aurora"
              size="sm"
              showCount={true}
            />

            <GlowEffect variant="aurora">
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-all hover:scale-105 px-2 py-1 rounded-full hover:bg-violet-500/10"
              >
                <Reply className="w-3.5 h-3.5" />
                Répondre
              </button>
            </GlowEffect>

            {isOwner && (
              <div className="relative">
                <GlowEffect variant="multi-layer">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-1 rounded-full text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-all hover:scale-110"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </GlowEffect>

                {showActions && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowActions(false)}
                    />
                    <GlowEffect variant="inner">
                      <div className="absolute left-0 top-full mt-1 glass-premium border border-violet-500/30 rounded-xl shadow-glow-gold z-20 overflow-hidden">
                        <button
                          onClick={() => {
                            setShowActions(false);
                            // TODO: Implement edit
                          }}
                          className="w-full px-3 py-2 text-sm text-foreground hover:bg-violet-500/10 flex items-center gap-2 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-violet-400" />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            setShowActions(false);
                            onDelete(comment.id);
                          }}
                          className="w-full px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Supprimer
                        </button>
                      </div>
                    </GlowEffect>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Reply input */}
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex gap-2"
            >
              <GlowEffect variant="aurora">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Votre réponse..."
                  className="flex-1 px-3 py-2 rounded-lg glass-premium border border-violet-500/30 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 bg-violet-500/5 text-foreground placeholder:text-muted-foreground/60"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSubmitReply(comment.id);
                    }
                    if (e.key === "Escape") {
                      setReplyContent("");
                    }
                  }}
                />
              </GlowEffect>
              <GlowEffect variant="multi-layer">
                <button
                  onClick={() => onSubmitReply(comment.id)}
                  disabled={!replyContent.trim() || isSubmitting}
                  className="px-3 py-2 rounded-lg glass-premium border border-violet-500/30 text-violet-400 text-sm font-medium disabled:opacity-50 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all hover:scale-105"
                >
                  <Check className="w-4 h-4" />
                </button>
              </GlowEffect>
              <GlowEffect variant="aurora">
                <button
                  onClick={() => {
                    setReplyContent("");
                  }}
                  className="px-3 py-2 rounded-lg glass-premium border border-violet-500/30 text-muted-foreground text-sm hover:bg-violet-500/10 transition-all hover:scale-105"
                >
                  <X className="w-4 h-4" />
                </button>
              </GlowEffect>
            </motion.div>
          )}

          {/* Replies */}
          {hasReplies && (
            <div className="mt-4 ml-4 pl-4 border-l-2 border-border space-y-4">
              {comment.replies!.map((reply) => (
                <CommentReply
                  key={reply.id}
                  reply={reply}
                  currentUserId={currentUserId}
                  onLike={onLike}
                  onDelete={onDelete}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface CommentReplyProps {
  reply: Comment;
  currentUserId?: string;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  formatDate: (date: string | Date) => string;
}

function CommentReply({
  reply,
  currentUserId,
  onLike,
  onDelete,
  formatDate,
}: CommentReplyProps) {
  const [showActions, setShowActions] = useState(false);
  const isOwner = currentUserId === reply.userId;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group"
    >
      <div className="flex gap-2">
        <img
          src={reply.user.image || "/default-avatar.png"}
          alt={reply.user.name || "Utilisateur"}
          className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">
              {reply.user.name || "Anonyme"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(reply.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {reply.content}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <PremiumLikeButton
              initialLiked={reply.isLikedByCurrentUser}
              initialCount={reply.likesCount}
              onLikeChange={() => onLike(reply.id)}
              variant="aurora"
              size="sm"
              showCount={true}
            />
            {isOwner && (
              <GlowEffect variant="multi-layer">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 rounded-full text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-all hover:scale-110"
                >
                  <MoreVertical className="w-3 h-3" />
                </button>
              </GlowEffect>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
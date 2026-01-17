import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import fetchData from "../apiClient";
import { 
  ThumbsUp, 
  MessageCircle, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  CornerDownRight, 
  Send,
  X 
} from "lucide-react";

// Utility: Time Formatter
const timeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

const CommentItem = ({
  comment,
  userData,
  onDelete,
  onUpdate,
  onReply,
  showReplay = true,
  depth = 0 // Track nesting level
}) => {
  const navigate = useNavigate();
  
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReply, setIsReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Optimistic UI for Likes
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [isLiked, setIsLiked] = useState(comment.isLiked);

  useEffect(() => {
    setLikeCount(comment.likes);
    setIsLiked(comment.isLiked);
  }, [comment.likes, comment.isLiked]);

  // Handle Likes
  const handleLikeClick = async (e) => {
    e?.stopPropagation();
    if (!userData) return alert("Please login to like comments.");

    const previousLiked = isLiked;
    const previousCount = likeCount;
    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;

    setIsLiked(newLiked);
    setLikeCount(newCount);

    try {
      await fetchData(
        "POST",
        `http://localhost:5000/api/v1/Videos/comment/Likes/${comment._id}`,
        { type: "comment" }
      );
    } catch (error) {
      console.error("Like failed", error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  // Data Extraction
  const replies = comment.replies || comment.replays || [];
  const repliesCount = comment.repliesCount || replies.length;

  const isOwner = userData && (
    (comment.owner?._id && String(comment.owner._id) === String(userData._id)) ||
    (typeof comment.owner === "string" && comment.owner === String(userData._id))
  );

  const ownerName = comment.owner?.username || (isOwner ? userData?.username : "Unknown User");
  const ownerId = comment.owner?._id || (isOwner ? userData?._id : "");
  // Improved Avatar Placeholder
  const ownerAvatar = comment.owner?.avatar || `https://ui-avatars.com/api/?name=${ownerName}&background=random&color=fff`;

  const handleSaveEdit = () => {
    if (editContent.trim() !== comment.content) {
      onUpdate(comment._id, editContent);
    }
    setIsEditing(false);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    onReply("comment", replyContent, comment._id);
    setReplyContent("");
    setIsReply(false);
    setShowReplies(true);
  };

  return (
    <div className={`flex gap-4 w-full animate-in fade-in duration-300 ${depth > 0 ? "mt-4" : "mb-6"}`}>
      
      {/* 1. Left Column: Avatar */}
      <div className="shrink-0">
        <Link to={`/account/channel/${ownerName}`}>
          <img 
            src={ownerAvatar} 
            alt={ownerName} 
            className="w-10 h-10 rounded-full object-cover border border-gray-800 hover:ring-2 hover:ring-blue-500 transition-all" 
          />
        </Link>
      </div>

      {/* 2. Right Column: Content */}
      <div className="flex-1 min-w-0">
        
        {/* Header: Name & Time */}
        <div className="flex items-center justify-between group/header relative">
          <div className="flex items-center gap-2 mb-1">
            <Link 
              to={`/account/channel/${ownerName}`} 
              className={`text-sm font-semibold hover:text-blue-400 transition ${isOwner ? 'text-blue-400' : 'text-white'}`}
            >
              @{ownerName}
            </Link>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-500 text-xs hover:text-gray-400 cursor-default">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Context Menu (Only for owner) */}
          {isOwner && !isEditing && (
            <div className="relative">
              <button 
                onClick={() => setShowActions(!showActions)}
                className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 opacity-0 group-hover/header:opacity-100 transition-opacity"
              >
                <MoreVertical size={16} />
              </button>
              
              {showActions && (
                <div 
                  className="absolute right-0 top-6 bg-[#2a2a2a] border border-gray-700 shadow-xl rounded-lg py-1 w-24 z-10 overflow-hidden"
                  onMouseLeave={() => setShowActions(false)}
                >
                  <button 
                    onClick={() => { setIsEditing(true); setShowActions(false); }} 
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button 
                    onClick={() => { onDelete(comment._id); setShowActions(false); }} 
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body: Comment Text or Edit Input */}
        {isEditing ? (
          <div className="mt-1 mb-3 bg-[#1f1f1f] p-3 rounded-xl border border-gray-700 focus-within:border-blue-500 transition-colors">
            <input 
              type="text" 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)} 
              className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
              autoFocus 
            />
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-700">
              <button 
                onClick={() => setIsEditing(false)} 
                className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit} 
                className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 font-medium transition shadow-lg shadow-blue-900/20"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}

        {/* Footer: Action Buttons */}
        <div className="flex items-center gap-4 mt-2">
          {/* Like Button */}
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-full transition-colors group ${
              isLiked ? "text-blue-500" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            }`}
          >
            <ThumbsUp size={14} className={`transition-transform ${isLiked ? "fill-current scale-110" : "group-hover:-rotate-12"}`} />
            <span className="text-xs font-medium">{likeCount > 0 ? likeCount : ""}</span>
          </button>

          {/* Reply Button */}
          {showReplay && (
            <button
              onClick={() => setIsReply(!isReply)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
                isReply ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <span className="text-xs font-medium">Reply</span>
            </button>
          )}
        </div>

        {/* Reply Input Form */}
        {isReply && (
          <div className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
             <img src={userData?.avatar} className="w-6 h-6 rounded-full mt-1 opacity-50" alt="" />
             <form onSubmit={handleReplySubmit} className="flex-1">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={`Reply to @${ownerName}...`}
                    value={replyContent} 
                    onChange={(e) => setReplyContent(e.target.value)} 
                    className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 py-1 text-sm text-white outline-none transition-colors"
                    autoFocus 
                  />
                  <div className="flex justify-end gap-2 mt-2">
                     <button type="button" onClick={() => setIsReply(false)} className="text-xs text-gray-500 hover:text-white">Cancel</button>
                     <button 
                       type="submit" 
                       disabled={!replyContent.trim()} 
                       className="text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded-full transition"
                     >
                       Reply
                     </button>
                  </div>
                </div>
             </form>
          </div>
        )}

        {/* Nested Replies Section */}
        {replies.length > 0 && (
          <div className="mt-2">
            {!showReplies ? (
              <button 
                onClick={() => setShowReplies(true)} 
                className="flex items-center gap-2 text-blue-400 hover:bg-blue-500/10 px-3 py-1.5 rounded-full text-xs font-medium transition"
              >
                <CornerDownRight size={14} />
                {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
              </button>
            ) : (
              // Thread Line Container
              <div className="relative">
                {/* Visual Thread Line */}
                <div className="absolute left-[-28px] top-0 bottom-4 w-0.5 bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => setShowReplies(false)}></div>
                
                <div className="mt-3 space-y-4">
                   {replies.map((reply) => (
                    <CommentItem 
                      key={reply._id} 
                      comment={reply} 
                      userData={userData} 
                      onDelete={onDelete} 
                      onUpdate={onUpdate} 
                      onReply={onReply} 
                      showReplay={true}
                      depth={depth + 1}
                    />
                  ))}
                </div>
                
                {/* Hide Replies Button */}
                <button 
                    onClick={() => setShowReplies(false)}
                    className="mt-2 text-xs text-gray-500 hover:text-blue-400 font-medium flex items-center gap-1"
                >
                    <X size={12} /> Hide replies
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CommentItem;
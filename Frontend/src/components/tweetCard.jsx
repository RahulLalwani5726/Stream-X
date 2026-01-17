import React, { useState, useEffect } from "react";
import CommentItem from "./comment_Item";
import fetchData from "../apiClient";
import { Link } from "react-router";
import { 
    Heart, 
    MessageCircle, 
    Repeat2, 
    Share2, 
    Trash2, 
    Send, 
    MoreHorizontal,
    Loader2
} from "lucide-react";

// --- Helper Utility ---
const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
};

// --- Sub-Component: Tweet Comments Section ---
// Now accepts `onCommentChange` prop to notify parent
const TweetCommentsSection = ({ tweetId, userData, onCommentChange }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            try {
                const res = await fetchData("GET", `https://stream-x.onrender.com/api/v1/Videos/comment/${tweetId}`);
                if (res?.Data) setComments(res.Data);
            } catch (e) {
                console.error("Fetch comments error", e);
            } finally {
                setIsLoading(false);
            }
        };
        if (tweetId) fetchComments();
    }, [tweetId]);

    const handleAddComment = async (type, content, targetId) => {
        if (!userData) return alert("Please login first.");
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);

        try {
            // Optimistic Update
            if (type === "tweet") {
                const tempComment = {
                    _id: `temp-${Date.now()}`,
                    content: content,
                    owner: userData,
                    createdAt: new Date().toISOString(),
                    likes: 0,
                    isLiked: false,
                    replies: []
                };
                setComments([tempComment, ...comments]);
                setNewComment("");
                
                // FIX: Update parent count immediately
                onCommentChange(1); 
            }

            await fetchData("POST", `https://stream-x.onrender.com/api/v1/tweets/comment/create/${targetId}`, { content, type });
            
            // Sync with Server (Optional, keeps IDs correct)
            const res = await fetchData("GET", `https://stream-x.onrender.com/api/v1/tweets/comment/${tweetId}`);
            if (res?.Data) setComments(res.Data);

        } catch (e) {
            console.error(e);
            alert("Failed to post comment");
            // Revert count on error
            onCommentChange(-1);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        
        const previousComments = [...comments];
        
        // Optimistic Update
        setComments(prev => prev.filter(c => c._id !== commentId));
        // FIX: Update parent count immediately
        onCommentChange(-1);

        try {
            await fetchData("DELETE", `https://stream-x.onrender.com/api/v1/tweets/comment/delete/${commentId}`);
        } catch (e) {
            // Revert on error
            setComments(previousComments);
            onCommentChange(1);
        }
    };

    const handleUpdateComment = async (commentId, newContent) => {
        setComments(prev => prev.map(c => c._id === commentId ? { ...c, content: newContent } : c));
        try {
            await fetchData("PATCH", `https://stream-x.onrender.com/api/v1/tweets/comment/edit/${commentId}`, { content: newContent });
        } catch (e) { console.error(e); }
    };

    return (
        <div className="mt-2 pt-4 border-t border-gray-800 animate-in fade-in slide-in-from-top-2">
            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleAddComment("tweet", newComment, tweetId); }} className="flex gap-4 mb-6">
                <img
                    src={userData?.avatar || "https://placehold.co/50x50/2a2a2a/FFF?text=?"}
                    className="w-9 h-9 rounded-full object-cover border border-gray-700"
                    alt="User"
                />
                <div className="flex-1 relative">
                    <input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 outline-none text-[15px] py-2 pr-10 text-white placeholder-gray-500 transition-all"
                        placeholder="Post your reply..."
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-500 disabled:text-gray-600 hover:bg-blue-500/10 p-1.5 rounded-full transition"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </form>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="space-y-0 relative">
                    {comments.map(comment => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            userData={userData}
                            onDelete={handleDeleteComment}
                            onUpdate={handleUpdateComment}
                            onReply={handleAddComment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main TweetCard Component ---
const TweetCard = ({ tweet, currentUser, onLike, onDelete }) => {
    const [showComments, setShowComments] = useState(false);
    
    // --- State for Likes ---
    const [likeCount, setLikeCount] = useState(Number(tweet.likes || tweet.likesCount || 0));
    const [isLiked, setIsLiked] = useState(tweet.isLiked || false);

    // --- FIX: State for Comments ---
    // Initialize safely from prop
    const [commentCount, setCommentCount] = useState(
        Number(tweet.commentCount || (tweet.commentsList ? tweet.commentsList.length : 0))
    );

    // Sync Props -> State (When feed refreshes)
    useEffect(() => {
        setLikeCount(Number(tweet.likes || tweet.likesCount || 0));
        setIsLiked(tweet.isLiked || false);
        setCommentCount(Number(tweet.commentCount || (tweet.commentsList ? tweet.commentsList.length : 0)));
    }, [tweet]);

    // Handler passed down to child to update count
    const handleCommentChange = (delta) => {
        setCommentCount(prev => Math.max(0, prev + delta));
    };

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        if (!currentUser) return;

        const newIsLiked = !isLiked;
        const newCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

        setIsLiked(newIsLiked);
        setLikeCount(newCount);

        try {
            await onLike(tweet._id, "tweet");
        } catch (error) {
            setIsLiked(!newIsLiked);
            setLikeCount(likeCount);
        }
    };

    const isOwner = currentUser && (
        (tweet.owner[0]?._id && String(tweet.owner[0]._id) === String(currentUser._id)) ||
        (typeof tweet.owner[0] === 'string' && tweet.owner[0] === String(currentUser._id))
    );
    
    let ownerName = tweet.owner[0]?.fullName || tweet.owner[0]?.username || tweet.owner?.fullName || tweet.owner?.username  || "Unknown" ;
    let ownerHandle = tweet.owner[0]?.username|| tweet.owner?.username || "unknown";
    let avatar = tweet.owner[0]?.avatar || tweet.owner.avatar || `https://ui-avatars.com/api/?name=${ownerName}&background=random`;

    return (
        <div className=" rounded-2xl bg-black hover:bg-[#080808] border-b border-gray-800 p-4 transition-colors duration-200 cursor-pointer">
            <div className="flex gap-4">
            <Link to = {`/account/channel/${tweet.owner[0]?.username}`}>
                <div className="shrink-0">
                    <img src={avatar} alt={ownerHandle} className="w-10 h-10 rounded-full object-cover hover:opacity-90 transition" />
                </div>
            </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="font-bold text-white text-[15px] truncate hover:underline">{ownerName}</span>
                            <span className="text-gray-500 text-[14px] truncate">@{ownerHandle}</span>
                            <span className="text-gray-500 text-[14px] shrink-0">· {timeAgo(tweet.createdAt)}</span>
                        </div>
                        
                        {isOwner && (
                            <div className="group relative">
                                <button className="text-gray-500 hover:text-blue-400 p-1 rounded-full hover:bg-blue-500/10 transition">
                                    <MoreHorizontal size={18} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(tweet._id); }}
                                    className="absolute right-0 top-6 bg-black border border-gray-800 text-red-500 text-xs px-3 py-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition flex items-center gap-2 z-10"
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="text-[#e7e9ea] text-[15px] leading-normal whitespace-pre-wrap mb-3 break-words">
                        {tweet.content}
                    </p>

                    {tweet.image && (
                        <div className="mb-3 rounded-2xl overflow-hidden border border-gray-800 mt-2">
                            <img src={tweet.image} alt="Tweet media" className="w-full h-auto object-cover max-h-[500px]" loading="lazy" />
                        </div>
                    )}

                    <div className="flex items-center justify-between max-w-md mt-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                            className={`flex items-center gap-1 group transition ${showComments ? "text-blue-400" : "text-gray-500 hover:text-blue-400"}`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition">
                                <MessageCircle size={18} className={showComments ? "fill-current" : ""} />
                            </div>
                            {/* FIX: Using state variable here */}
                            <span className="text-xs">{commentCount > 0 ? commentCount : ""}</span>
                        </button>

                        <button className="flex items-center gap-1 group text-gray-500 hover:text-green-500 transition">
                            <div className="p-2 rounded-full group-hover:bg-green-500/10 transition">
                                <Repeat2 size={18} />
                            </div>
                        </button>

                        <button
                            onClick={handleLikeClick}
                            className={`flex items-center gap-1 group transition ${isLiked ? "text-pink-600" : "text-gray-500 hover:text-pink-600"}`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition">
                                <Heart size={18} className={isLiked ? "fill-current" : ""} />
                            </div>
                            <span className={`text-xs transition ${isLiked && "font-bold"}`}>
                                {likeCount > 0 ? likeCount : ""}
                            </span>
                        </button>

                         <button className="flex items-center gap-1 group text-gray-500 hover:text-blue-400 transition">
                            <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition">
                                <Share2 size={18} />
                            </div>
                        </button>
                    </div>

                    {showComments && (
                        <div onClick={(e) => e.stopPropagation()} className="cursor-default">
                            {/* FIX: Passing the updater function down */}
                            <TweetCommentsSection 
                                tweetId={tweet._id} 
                                userData={currentUser} 
                                onCommentChange={handleCommentChange} 
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TweetCard;
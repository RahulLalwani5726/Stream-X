import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import fetchData from "../../apiClient.js";
import CommentItem from "../../components/comment_Item.jsx";
import PlaylistModal from "../../components/PlaylistModal.jsx";
import { 
    ThumbsUp, Bell, ListPlus, Share2, 
    MoreHorizontal, Send, User, ChevronDown, Check
} from "lucide-react";

// --- Helper Utilities ---
const formatDuration = (seconds) => {
    if (!seconds) return "00:00";
    const totalSeconds = Math.round(seconds);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    return Math.floor(seconds / 60) + " minutes ago";
};

// --- Sub-Components ---

const RelatedVideoCard = ({ video }) => {
    const thumbnail = video.thumbnail || `https://placehold.co/400x225/111/475569?text=${encodeURIComponent(video.title)}`;

    return (
        <Link to={`/Videos/watch/${video._id}`} className="flex gap-2 cursor-pointer hover:bg-[#272727] p-2 rounded-xl transition group w-full">
            <div className="relative w-40 aspect-video shrink-0 overflow-hidden rounded-lg bg-[#1a1a1a]">
                <img
                    src={thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded text-white font-medium">
                    {formatDuration(video.duration)}
                </span>
            </div>
            <div className="flex flex-col min-w-0 py-1">
                <h4 className="text-white font-semibold text-sm line-clamp-2 leading-tight group-hover:text-blue-400 transition mb-1">
                    {video.title}
                </h4>
                <p className="text-xs text-gray-400 hover:text-white transition">
                    {video.owner?.username || "Channel"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                    {video.views || 0} views • {timeAgo(video.createdAt)}
                </p>
            </div>
        </Link>
    );
};

// --- Comments Section Container ---
const CommentsSection = ({ videoId, userData }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetchData("GET", `http://localhost:5000/api/v1/Videos/comment/${videoId}`, { type: "video" });
                if (res?.Data) setComments(res.Data);
            } catch (e) { console.log("No comments found", e); }
        };
        if (videoId) fetchComments();
    }, [videoId]);

    const handleAddComment = async (type, content, id) => {
        if (!userData) { navigate("/auth"); return; }
        if (!content || !content.trim()) return;

        try {
            if (type === "video") {
                const tempComment = {
                    _id: Date.now(),
                    content: content,
                    owner: userData,
                    createdAt: new Date().toISOString(),
                    likes: 0,
                    replays: [],
                };
                setComments([tempComment, ...comments]);
                setNewComment("");
                setIsFocused(false);
            }

            await fetchData("POST", `http://localhost:5000/api/v1/Videos/comment/create/${id}`, { content: content, type });
            // Ideally refetch here to get real ID
        } catch (e) {
            console.error("Comment failed", e);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await fetchData("DELETE", `http://localhost:5000/api/v1/Videos/comment/delete/${commentId}`);
            setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (e) { console.error(e); }
    };

    const handleUpdateComment = async (commentId, newContent) => {
        try {
            await fetchData("PATCH", `http://localhost:5000/api/v1/Videos/comment/edit/${commentId}`, { content: newContent });
            setComments(prev => prev.map(c => c._id === commentId ? { ...c, content: newContent } : c));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="mt-6 pt-4 border-t border-gray-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                {comments.length} <span className="text-gray-400 font-normal text-lg">Comments</span>
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddComment("video", newComment, videoId); }} className="flex gap-4 mb-8">
                <img
                    src={userData?.avatar || "https://placehold.co/50x50/2a2a2a/FFF?text=?"}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                    alt="User"
                />
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onFocus={() => { if(!userData) navigate("/auth"); setIsFocused(true); }}
                        className="w-full bg-transparent border-b border-gray-700 focus:border-white outline-none pb-2 text-sm text-white placeholder-gray-500 transition-colors"
                    />
                    
                    {isFocused && (
                        <div className="flex justify-end gap-3 mt-3 animate-in fade-in slide-in-from-top-1">
                            <button
                                type="button"
                                onClick={() => { setNewComment(""); setIsFocused(false); }}
                                className="text-sm font-medium text-white hover:bg-[#272727] px-4 py-2 rounded-full transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className={`text-sm font-medium px-4 py-2 rounded-full transition flex items-center gap-2 ${
                                    newComment.trim()
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-[#272727] text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                <Send size={14} /> Comment
                            </button>
                        </div>
                    )}
                </div>
            </form>

            <div className="space-y-6">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        userData={userData}
                        onDelete={handleDeleteComment}
                        onUpdate={handleUpdateComment}
                        onReply={handleAddComment}
                        showReplay={true}
                    />
                ))}
            </div>
        </div>
    );
};

// --- 4. Main WatchPage Component ---
const WatchPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    // Data State
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribedCount, setSubscribedCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                setIsLoading(true);
                const vRes = await fetchData("GET", `http://localhost:5000/api/v1/Videos/watch/${videoId}`);
                await fetchData("GET", `http://localhost:5000/api/v1/users/update-watch-history/${videoId}`);
                
                if (vRes?.Data) {
                    setVideo(vRes.Data);
                    setLikeCount(vRes.Data.likes || 0);
                    setIsLiked(vRes.Data.isLiked);
                    setIsSubscribed(vRes.Data.owner.isSubscribe);
                    setSubscribedCount(vRes.Data.owner.subcribersCount);
                }

                const relatedRes = await fetchData("GET", "http://localhost:5000/api/v1/Videos");
                if (relatedRes?.Data) {
                    setRelatedVideos(relatedRes.Data.filter((v) => v._id !== videoId));
                }
            } catch (e) {
                console.error("Page Load Error:", e);
            } finally {
                setIsLoading(false);
            }
        };
        if (videoId) loadPageData();
    }, [videoId]);

    const owner = video?.owner?.[0] || video?.owner || {};
    const ownerAvatar = owner.avatar || `https://ui-avatars.com/api/?name=${owner.username}&background=random`;

    const handleSubscribe = async () => {
        if (!userData) return navigate("/auth");
        const previousSubState = isSubscribed;
        const previousCntState = subscribedCount;
        setSubscribedCount((!previousSubState) ? previousCntState + 1 : previousCntState - 1);
        setIsSubscribed(!previousSubState);
        try {
            await fetchData("POST", `http://localhost:5000/api/v1/users/subscribe/${owner.username}`);
        } catch (e) { 
            setIsSubscribed(previousSubState);
            setSubscribedCount(previousCntState);
        }
    };

    const handleLike = async () => {
        if (!userData) return navigate("/auth");
        const previousState = isLiked;
        const previousCount = likeCount;
        setIsLiked(!isLiked);
        setLikeCount((prev) => (!isLiked ? prev + 1 : prev - 1));

        try {
            await fetchData("POST", `http://localhost:5000/api/v1/Videos/Likes/${video._id}`, { type: 'video' });
        } catch (e) {
            setIsLiked(previousState);
            setLikeCount(previousCount);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#0f0f0f] flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    if (!video) return (
        <div className="min-h-screen bg-[#0f0f0f] flex flex-col justify-center items-center text-white gap-4">
            <h2 className="text-xl font-medium">Video not found</h2>
            <button onClick={() => navigate("/")} className="text-blue-400 hover:text-blue-300">Back to Home</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans relative">
            
            {showPlaylistModal && (
                <PlaylistModal
                    onClose={() => setShowPlaylistModal(false)}
                    videoId={video._id}
                    userData={userData}
                />
            )}

            <div className="container mx-auto px-4 lg:px-6 xl:px-12 py-6 max-w-[1800px]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* --- LEFT COLUMN (Video Player & Info) --- */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        
                        {/* 1. Player Container */}
                        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative border border-gray-800/50 group">
                            <video
                                src={video.src}
                                poster={video.thumbnail}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        {/* 2. Video Title */}
                        <h1 className="text-xl md:text-2xl font-bold mt-4 mb-2 text-gray-100">{video.title}</h1>

                        {/* 3. Action Bar (Channel & Buttons) */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
                            
                            {/* Channel Info */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Link to={`/account/channel/${owner.username}`} className="shrink-0">
                                    <img src={ownerAvatar} alt={owner.username} className="w-10 h-10 rounded-full object-cover" />
                                </Link>
                                <div className="flex flex-col">
                                    <Link to={`/account/channel/${owner.username}`} className="font-bold text-base hover:text-gray-300 truncate max-w-[150px]">
                                        {owner.username}
                                    </Link>
                                    <span className="text-xs text-gray-400">{subscribedCount || 0} subscribers</span>
                                </div>
                                <button
                                    onClick={handleSubscribe}
                                    className={`ml-4 px-5 py-2 rounded-full font-medium text-sm transition-all ${
                                        isSubscribed
                                            ? "bg-[#272727] text-white hover:bg-[#3f3f3f] flex items-center gap-2"
                                            : "bg-white text-black hover:bg-gray-200"
                                    }`}
                                >
                                    {isSubscribed ? <><Bell size={16}/> Subscribed</> : "Subscribe"}
                                </button>
                            </div>

                            {/* Interaction Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                                <button
                                    onClick={handleLike}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#272727] hover:bg-[#3f3f3f] transition text-sm font-medium"
                                >
                                    <ThumbsUp size={18} className={isLiked ? "fill-white text-white" : "text-white"} />
                                    <span className="border-r border-gray-600 pr-2 mr-1">{likeCount}</span>
                                </button>
                                
                                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#272727] hover:bg-[#3f3f3f] transition text-sm font-medium">
                                    <Share2 size={18} /> Share
                                </button>

                                <button
                                    onClick={() => userData ? setShowPlaylistModal(true) : navigate("/auth")}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#272727] hover:bg-[#3f3f3f] transition text-sm font-medium"
                                >
                                    <ListPlus size={18} /> Save
                                </button>

                                <button className="p-2 rounded-full bg-[#272727] hover:bg-[#3f3f3f] transition">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>

                        {/* 4. Description Box */}
                        <div 
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="bg-[#272727] hover:bg-[#3f3f3f] rounded-xl p-3 cursor-pointer transition"
                        >
                            <div className="text-sm font-bold mb-2 flex gap-2">
                                <span>{video.views} views</span>
                                <span>{new Date(video.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                            </div>
                            <div className={`text-sm text-gray-200 whitespace-pre-wrap leading-relaxed ${!isDescriptionExpanded && 'line-clamp-2'}`}>
                                {video.discription || "No description provided."}
                            </div>
                            <button className="text-sm font-bold mt-1 text-gray-400">
                                {isDescriptionExpanded ? "Show less" : "...more"}
                            </button>
                        </div>

                        {/* 5. Comments */}
                        <CommentsSection videoId={videoId} userData={userData} />
                    </div>

                    {/* --- RIGHT COLUMN (Related Videos) --- */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-4">
                            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                                <button className="bg-white text-black px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap">All</button>
                                <button className="bg-[#272727] hover:bg-[#3f3f3f] text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition">From {owner.username}</button>
                            </div>
                            <div className="space-y-2">
                                {relatedVideos.length > 0 ? (
                                    relatedVideos.map(vid => <RelatedVideoCard key={vid._id} video={vid} />)
                                ) : (
                                    <p className="text-gray-500 text-sm text-center py-4">No related videos found.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default WatchPage;
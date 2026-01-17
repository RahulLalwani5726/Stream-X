import React from 'react';
import { Link } from "react-router";
import { Play, CheckCircle2, MoreVertical } from "lucide-react";

// --- Utility: Format Duration ---
const formatDuration = (seconds) => {
    if (!seconds) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    return h > 0 
        ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` 
        : `${m}:${s.toString().padStart(2, '0')}`;
};

// --- Utility: Time Ago ---
const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;
    return `${Math.floor(months / 12)} years ago`;
};

const VideoCard = ({ video }) => {
    
    // 1. Robust Owner Extraction

    
    let owner = {};
    if (Array.isArray(video.owner) && video.owner.length > 0) {
        owner = video.owner[0]; // Take first item if array
    } else if (typeof video.owner === 'object' && video.owner !== null) {
        owner = video.owner; // Use directly if object
    }

    const ownerId = owner._id;
    const ownerName = owner.username || "Unknown Channel";
    const ownerAvatar = owner.avatar;

    // 2. Thumbnail Handling
    const placeholderThumbnail = `https://placehold.co/400x225/1a1a1a/475569?text=${encodeURIComponent(video.title || 'Video')}`;
    const finalSrc = video.thumbnail || placeholderThumbnail; 
    
    // 3. Routing
    const watchPath = `/videos/watch/${video._id}`; 
    // Link to channel page using the owner's username or ID
    const channelPath = owner.username ? `/account/channel/${owner.username}` : "#";

    return (
        <div className="flex flex-col gap-3 group cursor-pointer w-full">
            
            {/* --- Thumbnail Section --- */}
            <Link to={watchPath} className="relative aspect-video rounded-xl overflow-hidden bg-[#1a1a1a] border border-gray-800/50 hover:border-gray-600 transition-all duration-300 shadow-sm hover:shadow-xl group/thumb">
                <img 
                    src={finalSrc} 
                    alt={video.title} 
                    className="w-full h-full object-cover transform group-hover/thumb:scale-105 transition-transform duration-500 ease-out"
                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderThumbnail; }}
                />
                
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
                    {formatDuration(video.duration)}
                </div>

                {/* Hover Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-black/60 text-white p-3 rounded-full backdrop-blur-sm transform scale-75 group-hover/thumb:scale-100 transition-transform duration-300">
                        <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                </div>
            </Link>
            
            {/* --- Meta Data Section --- */}
            <div className="flex gap-3 px-0.5 items-start">
                
                {/* Avatar */}
                <Link 
                    to={channelPath} 
                    className="shrink-0 mt-0.5" 
                    title={ownerName}
                    onClick={(e) => !ownerId && e.preventDefault()}
                >
                    <img 
                        src={ownerAvatar || `https://ui-avatars.com/api/?name=${ownerName}&background=random`} 
                        alt={ownerName} 
                        className="w-9 h-9 rounded-full object-cover border border-transparent hover:border-gray-500 transition-colors" 
                    />
                </Link>
                
                {/* Text Info */}
                <div className="flex flex-col flex-1 min-w-0">
                    {/* Title */}
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="text-white font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors" title={video.title}>
                            <Link to={watchPath}>
                                {video.title || 'Untitled Video'}
                            </Link>
                        </h4>
                        
                        <button className="text-transparent group-hover:text-gray-400 hover:text-white transition-colors -mr-2">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                    
                    {/* Channel Name */}
                    <Link 
                        to={channelPath} 
                        className="text-gray-400 text-[13px] mt-1 hover:text-white truncate flex items-center gap-1 w-fit transition-colors"
                        onClick={(e) => !ownerId && e.preventDefault()}
                    >
                        {ownerName} 
                        {/* Add check icon logic here if needed */}
                    </Link>
                    
                    {/* Views & Time */}
                    <div className="text-gray-500 text-[13px] flex items-center mt-0.5">
                        <span>{video.viewsCount || video.views || 0} views</span>
                        <span className="mx-1.5 text-gray-600">•</span>
                        <span>{timeAgo(video.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
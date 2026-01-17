import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import fetchData from "../../apiClient";
import { useSelector } from "react-redux";
import { 
    Play, Trash2, Share2, Lock, Globe, Calendar, Clock, 
    Loader2, X, PlusCircle, Search, CheckCircle2 
} from "lucide-react";

// --- 1. Add Video Modal Component ---
const AddVideoModal = ({ isOpen, onClose, playlistId, existingVideoIds, onVideoAdded }) => {
    const [videos, setVideos] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [addingId, setAddingId] = useState(null);

    useEffect(() => {
        if (isOpen) fetchVideos();
    }, [isOpen]);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            // Fetch all videos to choose from (Adjust endpoint if you only want user's videos)
            const res = await fetchData("GET", "http://localhost:5000/api/v1/Videos"); 
            if (res?.Data) {
                setVideos(res.Data); // Assuming Data is an array of videos
            }
        } catch (error) {
            console.error("Failed to load videos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (video) => {
        setAddingId(video._id);
        try {
            // API Call to add video
            await fetchData("PATCH", `http://localhost:5000/api/v1/playlist/add/${playlistId}/${video._id}`);
            onVideoAdded(video); // Update parent state
        } catch (error) {
            console.error("Add failed", error);
            alert("Failed to add video");
        } finally {
            setAddingId(null);
        }
    };

    // Filter: Exclude videos already in playlist & match search
    const filteredVideos = videos.filter(v => 
        !existingVideoIds.includes(v._id) && 
        v.title.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Add Videos</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search videos..." 
                            className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
                    ) : filteredVideos.length > 0 ? (
                        filteredVideos.map(video => (
                            <div key={video._id} className="flex items-center gap-3 p-2 hover:bg-[#252525] rounded-lg transition group">
                                <img src={video.thumbnail} alt="" className="w-24 aspect-video object-cover rounded bg-gray-800" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white truncate">{video.title}</h4>
                                    <p className="text-xs text-gray-500">{video.owner?.username || "Unknown"}</p>
                                </div>
                                <button 
                                    onClick={() => handleAdd(video)}
                                    disabled={addingId === video._id}
                                    className="p-2 bg-[#333] hover:bg-blue-600 text-white rounded-full transition"
                                >
                                    {addingId === video._id ? <Loader2 size={18} className="animate-spin"/> : <PlusCircle size={18} />}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-10">No videos found to add.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- 2. Playlist Video Row Component ---
const PlaylistVideoRow = ({ video, index, isOwner, onRemove }) => {
    // Robust owner handling
    let ownerName = "Unknown Channel";
    if (video.owner) {
        if (typeof video.owner === 'object') {
            // Check if it's an array (from lookup) or object
            const ownerObj = Array.isArray(video.owner) ? video.owner[0] : video.owner;
            ownerName = ownerObj?.username || ownerName;
        }
    }

    return (
        <div className="group flex gap-4 p-3 rounded-xl hover:bg-[#2a2a2a] transition-colors cursor-pointer border border-transparent hover:border-gray-700">
            <div className="flex items-center justify-center w-6 text-gray-500 font-medium text-sm">
                <span className="group-hover:hidden">{index + 1}</span>
                <Play size={14} className="hidden group-hover:block text-white fill-white" />
            </div>

            <Link to={`/videos/watch/${video._id}`} className="relative w-40 aspect-video shrink-0 rounded-lg overflow-hidden bg-gray-800">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    {Math.floor(video.duration / 60)}:{(Math.floor(video.duration % 60)).toString().padStart(2, '0')}
                </span>
            </Link>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-white font-bold text-sm line-clamp-2 leading-tight mb-1">
                    <Link to={`/videos/watch/${video._id}`} className="hover:text-blue-400 transition">{video.title}</Link>
                </h4>
                <p className="text-gray-400 text-xs hover:text-white transition cursor-pointer">{ownerName}</p>
            </div>

            {isOwner && (
                <div className="flex items-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(video._id); }}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition opacity-0 group-hover:opacity-100"
                        title="Remove from playlist"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

// --- 3. Main Page Component ---
const PlaylistView = () => {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth.userData);

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false); // Modal State

    // Fetch Playlist
    useEffect(() => {
        const getPlaylist = async () => {
            try {
                setLoading(true);
                const res = await fetchData("GET", `http://localhost:5000/api/v1/playlist/view/${playlistId}`);
                if (res?.Data) {
 
                    setPlaylist(res.Data);
                } else {
                    throw new Error("Playlist not found");
                }
            } catch (e) {
                console.error(e);
                setError(e.message || "Failed to load playlist");
            } finally {
                setLoading(false);
            }
        };
        if (playlistId) getPlaylist();
    }, [playlistId]);

    // Actions
    const handleDeletePlaylist = async () => {
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;
        try {
            await fetchData("DELETE", `http://localhost:5000/api/v1/playlist/delete/${playlistId}`);
            navigate("/playlist");
        } catch (e) {
            alert("Failed to delete playlist");
        }
    };

    const handleRemoveVideo = async (videoId) => {
        const originalVideos = [...playlist.videos];
        setPlaylist(prev => ({ ...prev, videos: prev.videos.filter(v => v._id !== videoId) }));

        try {
            await fetchData("PATCH", `http://localhost:5000/api/v1/playlist/remove/${playlistId}/${videoId}`);
        } catch (e) {
            console.error("Remove failed", e);
            setPlaylist(prev => ({ ...prev, videos: originalVideos }));
            alert("Could not remove video.");
        }
    };

    const handleVideoAdded = (newVideo) => {

        // Optimistically add video to list
        setPlaylist(prev => ({
            ...prev,
            videos: [...prev.videos, newVideo]
        }));
    };

    const handlePlayAll = () => {
        if (playlist?.videos?.length > 0) navigate(`/videos/watch/${playlist.videos[0]._id}`);
    };

    if (loading) return <div className="min-h-screen bg-[#121212] flex justify-center items-center text-white"><Loader2 className="animate-spin" size={40} /></div>;
    if (error || !playlist) return <div className="min-h-screen bg-[#121212] flex flex-col justify-center items-center text-white gap-4"><h2 className="text-2xl font-bold">Playlist Not Found</h2><button onClick={() => navigate(-1)} className="text-blue-500 hover:underline">Go Back</button></div>;

    // Check Ownership
    const ownerId = typeof playlist.owner === 'object' ? playlist.owner._id : playlist.owner;
    const isOwner = currentUser?._id === ownerId;
    
    // Stats
    const coverImage = playlist.videos?.[0]?.thumbnail || "https://placehold.co/600x400/1a1a1a/475569?text=Empty+Playlist";
    const totalDuration = playlist.videos.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const formatTotalTime = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m} mins`;
    };

    // Owner Name Robust check
    const ownerName = playlist.ownerData?.username || (typeof playlist.owner === 'object' ? playlist.owner.username : "Unknown User");

    return (
        <div className="min-h-screen bg-[#121212] text-white font-sans p-4 md:p-8">
            
            {/* Modal */}
            <AddVideoModal 
                isOpen={showAddModal} 
                onClose={() => setShowAddModal(false)}
                playlistId={playlistId}
                existingVideoIds={playlist.videos.map(v => v._id)}
                onVideoAdded={handleVideoAdded}
            />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- Left Column: Info --- */}
                <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-24 bg-gradient-to-b from-[#222] to-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-2xl">
                        
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg mb-6 group cursor-pointer" onClick={handlePlayAll}>
                            <img src={coverImage} alt={playlist.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                            {playlist.videos.length > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition">
                                    <span className="text-white bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 font-bold transform group-hover:scale-105 transition">
                                        <Play size={20} fill="currentColor" /> Play All
                                    </span>
                                </div>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">{playlist.name}</h1>
                        
                        <div className="flex flex-col gap-1 text-sm text-gray-400 mb-4">
                            <span className="font-semibold text-white">{ownerName}</span>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-300">{playlist.videos.length} videos</span>
                                {playlist.isPrivate ? <span className="flex items-center gap-1 text-xs"><Lock size={12}/> Private</span> : <span className="flex items-center gap-1 text-xs"><Globe size={12}/> Public</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs opacity-70">
                                <span className="flex items-center gap-1"><Calendar size={12}/> Updated {new Date(playlist.updatedAt).toLocaleDateString()}</span>
                                {totalDuration > 0 && <span className="flex items-center gap-1"><Clock size={12}/> {formatTotalTime(totalDuration)}</span>}
                            </div>
                        </div>

                        {playlist.discription && <p className="text-gray-400 text-sm mb-6 border-t border-gray-700 pt-4 leading-relaxed">{playlist.discription}</p>}

                        {/* Owner Actions */}
                        {isOwner && (
                            <button 
                                onClick={() => setShowAddModal(true)}
                                className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-full flex items-center justify-center gap-2 transition"
                            >
                                <PlusCircle size={18} /> Add Videos
                            </button>
                        )}

                        <div className="flex gap-3">
                            <button 
                                onClick={handlePlayAll}
                                disabled={playlist.videos.length === 0}
                                className="flex-1 bg-white text-black hover:bg-gray-200 font-bold py-2.5 rounded-full flex items-center justify-center gap-2 transition disabled:opacity-50"
                            >
                                <Play size={18} fill="currentColor" /> Play All
                            </button>
                            {isOwner && (
                                <button onClick={handleDeletePlaylist} className="p-2.5 bg-[#333] hover:bg-red-900/50 hover:text-red-400 rounded-full text-white transition">
                                    <Trash2 size={20} />
                                </button>
                            )}
                            <button 
                                onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }}
                                className="p-2.5 bg-[#333] hover:bg-[#444] rounded-full text-white transition"
                            >
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Videos --- */}
                <div className="lg:col-span-2">
                    {playlist.videos.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {playlist.videos.map((video, index) => (
                                <PlaylistVideoRow key={video._id} video={video} index={index} isOwner={isOwner} onRemove={handleRemoveVideo} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                            <p className="text-lg font-medium">This playlist is empty</p>
                            {isOwner && <button onClick={() => setShowAddModal(true)} className="text-blue-500 hover:underline mt-2">Add videos now</button>}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PlaylistView;
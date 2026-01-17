import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import fetchData from "../apiClient.js";
import VideoCard from "../components/videoCard.jsx";
import TweetCard from "../components/tweetCard.jsx";
import { 
    Home, PlayCircle, Hash, TrendingUp, Music, 
    Monitor, Camera, Newspaper, AlertCircle, Loader2 
} from "lucide-react";

// --- 1. Skeletons & Utilities ---
const VideoSkeleton = () => (
    <div className="flex flex-col gap-3 animate-pulse">
        <div className="aspect-video bg-[#2a2a2a] rounded-xl w-full" />
        <div className="flex gap-3 px-1">
            <div className="w-9 h-9 bg-[#2a2a2a] rounded-full shrink-0" />
            <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-[#2a2a2a] rounded w-4/5" />
                <div className="h-3 bg-[#2a2a2a] rounded w-1/2" />
            </div>
        </div>
    </div>
);

// --- 2. Main Component ---
const HomePage = () => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [tweets, setTweets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Auth State
    const currentUser = useSelector((state) => state.auth.userData);
    
    // Filtering State
    const [activeCategory, setActiveCategory] = useState("All");
    const categories = [
        { name: "All", icon: <Home size={16}/> },
        { name: "Gaming", icon: <PlayCircle size={16}/> },
        { name: "Music", icon: <Music size={16}/> },
        { name: "Tech", icon: <Monitor size={16}/> },
        { name: "Vlog", icon: <Camera size={16}/> },
        { name: "News", icon: <Newspaper size={16}/> }
    ];

    // Data Fetching
    useEffect(() => {
        const getAllContent = async () => {
            try {
                setIsLoading(true);
                const [videoRes, tweetRes] = await Promise.allSettled([
                    fetchData("GET", "https://stream-x.onrender.com/api/v1/Videos"),
                    fetchData("GET", "https://stream-x.onrender.com/api/v1/tweets")
                ]);

                if (videoRes.status === "fulfilled" && videoRes.value.Data) {
                    setVideos(videoRes.value.Data);
                }
                if (tweetRes.status === "fulfilled" && tweetRes.value.Data) {
                    setTweets(tweetRes.value.Data);
                }
            } catch (e) {
                console.error("Load Error:", e);
                setError("Failed to load feed.");
            } finally {
                setIsLoading(false);
            }
        };
        getAllContent();
    }, []);

    // Client-Side Filter
    const filteredVideos = activeCategory === "All" 
        ? videos 
        : videos.filter(v => 
            (v.title && v.title.toLowerCase().includes(activeCategory.toLowerCase())) || 
            (v.description && v.description.toLowerCase().includes(activeCategory.toLowerCase()))
          );

    // Optimized Handlers
    const handleLikeTweet = async (tweetId, type) => {
        if (!currentUser) return navigate("/auth");

        const previousTweets = [...tweets];
        setTweets(prev => prev.map(t => {
            if (t._id === tweetId) {
                const newIsLiked = !t.isLiked;
                return { 
                    ...t, 
                    isLiked: newIsLiked, 
                    likes: newIsLiked ? (t.likes || 0) + 1 : Math.max(0, (t.likes || 1) - 1),
                    likesCount: newIsLiked ? (t.likesCount || 0) + 1 : Math.max(0, (t.likesCount || 1) - 1)
                };
            }
            return t;
        }));

        try {
            await fetchData("POST", `https://stream-x.onrender.com/api/v1/Videos/Likes/${tweetId}`, { type });
        } catch(e) {
            setTweets(previousTweets);
        }
    };

    const handleDeleteTweet = async (tweetId) => {
        if (!window.confirm("Delete this tweet?")) return;
        const previousTweets = [...tweets];
        setTweets(prev => prev.filter(t => t._id !== tweetId));

        try {
            await fetchData("DELETE", `https://stream-x.onrender.com/api/v1/tweets/delete/${tweetId}`);
        } catch (e) {
            setTweets(previousTweets);
            alert("Failed to delete tweet.");
        }
    };

    // Error State
    if (error && videos.length === 0) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#121212] text-white">
                <div className="text-center p-8 bg-[#1e1e1e] rounded-2xl border border-red-500/20 shadow-2xl max-w-sm">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Connection Failed</h2>
                    <p className="text-gray-400 mb-6 text-sm">We couldn't load the feed. Please check your internet connection.</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full text-sm font-bold transition">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white font-sans">
            <div className="container mx-auto px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6 pb-20">
                
                {/* --- Left Column: Video Feed (3/4 Width) --- */}
                <div className="lg:col-span-3">
                    
                    {/* Header & Filters */}
                    <div className="sticky top-[64px] z-20 bg-[#121212]/95 backdrop-blur-md pb-4 pt-2 border-b border-gray-800 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <div className="p-2 bg-red-600 rounded-lg"><PlayCircle size={20} fill="white" className="text-white"/></div>
                                <span>Explore</span>
                            </h2>
                            
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat.name}
                                        onClick={() => setActiveCategory(cat.name)}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap border ${
                                            activeCategory === cat.name 
                                            ? "bg-white text-black border-white" 
                                            : "bg-[#222] text-gray-300 border-gray-700 hover:bg-[#333] hover:text-white"
                                        }`}
                                    >
                                        {cat.icon}
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Video Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => <VideoSkeleton key={i} />)}
                        </div>
                    ) : filteredVideos.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-xl">
                            <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Home size={32} className="text-gray-600 opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No videos found</h3>
                            <p className="text-gray-500 text-sm">Try selecting a different category.</p>
                            {activeCategory !== 'All' && (
                                <button onClick={() => setActiveCategory("All")} className="mt-4 text-blue-400 hover:text-blue-300 font-medium hover:underline text-sm">Clear Filters</button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-8 gap-x-6">
                            {filteredVideos.map((video) => (
                                <VideoCard key={video._id} video={video} />
                            ))}
                        </div>
                    )}
                </div>

                {/* --- Right Column: Tweets Feed (1/4 Width) --- */}
                <div className="lg:col-span-1 hidden lg:block relative">
                    <div className="sticky top-[88px] h-[calc(100vh-100px)] flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-800">
                            <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                                <Hash size={20} className="text-blue-500" /> Community
                            </h2>
                            <Link to="/tweets" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                                View All <TrendingUp size={12}/>
                            </Link>
                        </div>
                        
                        {/* Scrollable Container */}
                        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden shadow-lg flex-1 overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="p-6 text-center space-y-4">
                                    <div className="h-20 bg-[#252525] rounded-lg animate-pulse" />
                                    <div className="h-20 bg-[#252525] rounded-lg animate-pulse" />
                                    <div className="h-20 bg-[#252525] rounded-lg animate-pulse" />
                                </div>
                            ) : tweets.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
                                    <div className="w-12 h-12 bg-[#252525] rounded-full flex items-center justify-center mb-3">
                                        <Hash size={24} className="opacity-50" />
                                    </div>
                                    <p className="text-sm">No community posts yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-800">
                                    {tweets.map((tweet) => (
                                        <TweetCard 
                                            key={tweet._id} 
                                            tweet={tweet} 
                                            currentUser={currentUser} 
                                            onLike={handleLikeTweet} 
                                            onDelete={handleDeleteTweet} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Footer Links */}
                        <div className="mt-4 text-[11px] text-gray-500 text-center px-2">
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-2">
                                <span className="hover:text-gray-300 cursor-pointer transition">Privacy</span>
                                <span className="hover:text-gray-300 cursor-pointer transition">Terms</span>
                                <span className="hover:text-gray-300 cursor-pointer transition">Advertising</span>
                                <span className="hover:text-gray-300 cursor-pointer transition">Cookies</span>
                            </div>
                            <p>© 2025 StreamX Inc.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomePage;
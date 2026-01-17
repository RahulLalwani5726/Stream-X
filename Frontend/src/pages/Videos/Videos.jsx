import React, { useEffect, useState, useMemo } from "react";
import fetchData from "../../apiClient";
import VideoCard from "../../components/videoCard.jsx";
import { 
    Search, Filter, Play, Clock, TrendingUp, 
    AlertCircle, Film, X 
} from "lucide-react";

// --- 1. Skeleton Loader ---
const VideoSkeleton = () => (
    <div className="flex flex-col gap-3 animate-pulse">
        <div className="aspect-video bg-[#2a2a2a] rounded-xl w-full border border-gray-800" />
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
const VideosPage = () => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Search & Sort State
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest"); 

    // 1. Fetch Data
    useEffect(() => {
        const getVideos = async () => {
            try {
                setIsLoading(true);
                const response = await fetchData("GET", "https://stream-x.onrender.com/api/v1/Videos");
                if (response && response.Data) {
                    console.log(response);
                    console.log(response);
                    
                    setVideos(response.Data);
                } else {
                    setVideos([]);
                }
            } catch (e) {
                console.error("Fetch Error:", e);
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };
        getVideos();
    }, []);

    // 2. Filter & Sort Logic (Optimized with useMemo)
    const processedVideos = useMemo(() => {
        let result = [...videos];

        // Search Filter
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(v => 
                (v.title && v.title.toLowerCase().includes(lowerQuery)) ||
                (v.discription && v.discription.toLowerCase().includes(lowerQuery)) 
            );
        }

        // Sort Logic
        switch (sortBy) {
            case "newest":
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "oldest":
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "popular":
                result.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            default:
                break;
        }

        return result;
    }, [videos, searchQuery, sortBy]);

    // 3. Error State
    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#121212] text-white">
                <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Failed to load content</h2>
                    <p className="text-gray-400 mb-6 text-sm">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full text-sm font-bold transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white font-sans">
            
            {/* Header / Filter Bar */}
            <div className="sticky top-[64px] z-30 bg-[#121212]/90 backdrop-blur-md border-b border-gray-800">
                <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    {/* Title */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <div className="p-2 bg-red-600 rounded-lg">
                            <Play size={20} fill="white" className="text-white"/>
                        </div>
                        <h1 className="text-xl font-bold text-white hidden sm:block">Explore</h1>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative group w-full sm:w-80">
                            <input 
                                type="text" 
                                placeholder="Search videos..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#222] border border-gray-700 rounded-full py-2 pl-11 pr-10 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
                            />
                            <Search className="absolute left-4 top-2.5 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                            
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <div className="absolute left-3 top-2.5 pointer-events-none">
                                {sortBy === 'newest' && <Clock size={16} className="text-blue-400"/>}
                                {sortBy === 'popular' && <TrendingUp size={16} className="text-orange-400"/>}
                                {sortBy === 'oldest' && <Clock size={16} className="text-gray-400"/>}
                            </div>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full sm:w-auto appearance-none bg-[#222] border border-gray-700 rounded-full py-2 pl-10 pr-8 text-sm text-white focus:border-blue-500 outline-none cursor-pointer hover:bg-[#333] transition"
                            >
                                <option value="newest">Newest First</option>
                                <option value="popular">Most Popular</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                            <Filter size={14} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Grid */}
            <div className="container mx-auto p-4 sm:p-6 pb-20">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-8 gap-x-4">
                        {[...Array(10)].map((_, i) => <VideoSkeleton key={i} />)}
                    </div>
                ) : processedVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-[#222] rounded-full flex items-center justify-center mb-6">
                            <Film size={40} className="text-gray-600 opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No videos found</h3>
                        <p className="text-gray-500 max-w-sm">
                            We couldn't find any videos matching "{searchQuery}". Try adjusting your filters.
                        </p>
                        <button 
                            onClick={() => { setSearchQuery(""); setSortBy("newest"); }}
                            className="mt-6 text-blue-400 hover:text-blue-300 font-medium hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-8 gap-x-4">
                        {processedVideos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideosPage;
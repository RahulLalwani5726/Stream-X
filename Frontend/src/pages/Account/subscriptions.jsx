import React, { useState, useEffect, useMemo } from "react";
import fetchData from "../../apiClient.js"; 
import { Link } from "react-router";
import { 
    Users, UserCheck, UserPlus, Search, 
    Filter, Bell, MoreVertical, Loader2 
} from "lucide-react";

// --- 1. User Card Component (Remains the same) ---
const UserCard = ({ user, type }) => {
    const [isSubscribed, setIsSubscribed] = useState(
        type === 'subscribed' ? true : (user.isSubscribed || false)
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleSubscribe = async () => {
        setIsLoading(true);
        const previousState = isSubscribed;
        setIsSubscribed(!isSubscribed);
        
        try {
            await fetchData("POST", `https://stream-x.onrender.com/api/v1/users/subscribe/${user.username}`);
        } catch (e) {
            setIsSubscribed(previousState);
            console.error("Subscription failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 flex flex-col items-center text-center hover:border-gray-700 transition-all duration-300 group shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <Link to={`/account/channel/${user.username}`} className="relative mb-3 z-10">
                <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                    alt={user.username} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-[#121212] shadow-md group-hover:scale-105 transition-transform"
                />
            </Link>

            <div className="z-10 w-full mb-4">
                <Link to={`/account/channel/${user.username}`}>
                    <h3 className="text-white font-bold text-lg truncate hover:underline decoration-blue-500 underline-offset-4 cursor-pointer">{user.fullname}</h3>
                </Link>
                <p className="text-gray-500 text-sm">@{user.username}</p>
                {/* Display subscriber count if available */}
                {user.subscribersCount !== undefined && (
                    <p className="text-xs text-gray-600 mt-1">{user.subscribersCount} subscribers</p>
                )}
            </div>

            <button 
                onClick={handleToggleSubscribe}
                disabled={isLoading}
                className={`w-full py-2 rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 z-10 ${
                    isSubscribed 
                    ? "bg-[#2a2a2a] text-gray-400 hover:text-red-400 hover:bg-red-500/10" 
                    : "bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/5"
                }`}
            >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : isSubscribed ? <><UserCheck size={16} /> Subscribed</> : <><UserPlus size={16} /> Subscribe</>}
            </button>
        </div>
    );
};

// --- 2. Main Page Component ---
const SubscribersPage = () => {
    const [activeTab, setActiveTab] = useState("subscribers");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useMemo(() => {
        const getData = async () => {
            setLoading(true);
            try {
                const endpoint = activeTab === "subscribers" 
                    ? "https://stream-x.onrender.com/api/v1/users/subscribers/list" 
                    : "https://stream-x.onrender.com/api/v1/users/subscription/list"; 

                const response = await fetchData("GET", endpoint);
                
                if (response && response.Data) {
                    // --- FIX FOR DATA STRUCTURE ---
                    const processedUsers = response.Data.map(item => {
                        // 1. Identify where the user object is hidden
                        // Based on your log, it's in 'subcriber' (typo) or potentially 'channel' or 'users'
                        let userDetails = null;

                        if (Array.isArray(item.subcriber) && item.subcriber.length > 0) {
                            userDetails = item.subcriber[0];
                        } else if (Array.isArray(item.channel) && item.channel.length > 0) {
                            userDetails = item.channel[0];
                        } else if (Array.isArray(item.users) && item.users.length > 0) {
                            userDetails = item.users[0];
                        }

                        // 2. If no user details found (like index 0 in your log), return null
                        if (!userDetails) return null;

                        // 3. Flatten the object
                        return {
                            _id: userDetails._id,
                            username: userDetails.username || "Unknown",
                            fullname: userDetails.fullname || userDetails.username || "Unknown User",
                            avatar: userDetails.avatar,
                            isSubscribed: userDetails.isSubscribed,
                            subscribersCount: userDetails.subcriberCount, // Handling backend typo
                            subscriptionId: item._id
                        };
                    }).filter(item => item !== null); // Filter out the nulls

                    setUsers(processedUsers);
                } else {
                    setUsers([]);
                }
            } catch (e) {
                console.error("Fetch Error:", e);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, [activeTab]);

    const filteredUsers = users.filter(u => 
        (u.fullname?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
        (u.username?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#121212] text-white font-sans pb-20">
            <div className="sticky top-[64px] z-30 bg-[#121212]/95 backdrop-blur-md border-b border-gray-800">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex bg-[#1e1e1e] p-1 rounded-full border border-gray-700">
                            <button 
                                onClick={() => setActiveTab("subscribers")}
                                className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "subscribers" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                            >
                                <Users size={16} /> My Subscribers
                            </button>
                            <button 
                                onClick={() => setActiveTab("subscribed")}
                                className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "subscribed" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                            >
                                <UserCheck size={16} /> Subscribed
                            </button>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                            <input 
                                type="text" 
                                placeholder={`Search ${activeTab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none transition"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 text-gray-400 text-sm font-medium">
                    {activeTab === 'subscribers' ? `People following you (${filteredUsers.length})` : `Channels you follow (${filteredUsers.length})`}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-[#1a1a1a] rounded-xl h-64 animate-pulse border border-gray-800"></div>
                        ))}
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredUsers.map(user => (
                            <UserCard key={user._id} user={user} type={activeTab} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                        <div className="w-24 h-24 bg-[#1e1e1e] rounded-full flex items-center justify-center mb-4 border border-gray-800">
                            {activeTab === 'subscribers' ? <Users size={48} className="opacity-20" /> : <UserPlus size={48} className="opacity-20" />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-300 mb-1">
                            {activeTab === 'subscribers' ? "No subscribers yet" : "No subscriptions"}
                        </h3>
                        <p className="text-sm max-w-xs text-center">
                            {activeTab === 'subscribers' ? "Publish more content to grow your audience!" : "Start watching videos and subscribing to channels you like."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscribersPage;
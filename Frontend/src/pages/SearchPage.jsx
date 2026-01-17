import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import fetchData from "../apiClient.js";
import VideoCard from "../components/videoCard.jsx";
import TweetCard from "../components/tweetCard.jsx";
import {
  Search,
  Users as UsersIcon,
  Video as VideoIcon,
  List,
  FileText,
  Loader2,
  Filter,
  UserPlus,
  Check,
  Lock,
  Bell,
} from "lucide-react";

const SEARCH_ENDPOINT_BASE = "http://localhost:5000/api/v1/public/search";

// ==========================================
// 1. SAFE DATA NORMALIZERS
// ==========================================

const safeNumber = (val) => {
  const num = parseInt(val, 10);
  return isNaN(num) ? 0 : num;
};

const Users = (users) => {
  if (!Array.isArray(users)) return [];
  return users.map((user) => ({
    ...user,
    subscribersCount: safeNumber(
      user.subscribersCount ?? user.SubscriberCount ?? user.subcribersCount
    ),
    isSubscribed: Boolean(user.isSubscribed ?? user.isSubcribed ?? false),
    avatar: user.avatar || "https://ui-avatars.com/api/?name=User",
  }));
};

const Videos = (videos) => {
  if (!Array.isArray(videos)) return [];
  return videos.map((video) => ({
    ...video,
    views: safeNumber(video.views),
    owner: Array.isArray(video.owner) ? video.owner[0] : video.owner,
  }));
};

const Playlists = (playlists) => {
  if (!Array.isArray(playlists)) return [];
  return playlists.map((pl) => ({
    ...pl,
    description: pl.description || pl.discription || "",
    isPrivate: pl.isPrivate ?? pl.isprivate ?? false,
    totalVideos: safeNumber(pl.totalVideos || pl.videos?.length),
    thumbnail:
      pl.thumbnail ||
      pl.videos?.[0]?.thumbnail ||
      `https://placehold.co/400x225/252525/475569?text=${encodeURIComponent(
        pl.name
      )}`,
  }));
};

const Tweets = (tweets) => {
  if (!Array.isArray(tweets)) return [];
  return tweets.map((tweet) => ({
    ...tweet,
    likesCount: safeNumber(tweet.likesCount ?? tweet.likes),
    isLiked: Boolean(tweet.isLiked ?? false),
    owner: Array.isArray(tweet.owner) ? tweet.owner[0] : tweet.owner,
  }));
};

// ==========================================
// 2. UI COMPONENTS
// ==========================================

const TabButton = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all border-b-2 ${
      active
        ? "border-blue-500 text-blue-400 bg-white/5"
        : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
    }`}
  >
    {Icon && <Icon size={16} />}
    {label}
  </button>
);

const UserSearchCard = ({ user, onSubscribe }) => {
  const navigate = useNavigate();

  const handleSubscribeClick = (e) => {
    e.stopPropagation();
    // Pass the WHOLE user object, not just ID
    onSubscribe(user);
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-center gap-4 bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 hover:border-gray-600 transition group cursor-pointer"
      onClick={() => navigate(`/channel/${user.username}`)}
    >
      <img
        src={user.avatar}
        alt={user.username}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition"
      />
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
          {user.fullname}
        </h3>
        <p className="text-gray-400 text-sm">@{user.username}</p>
        <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 text-gray-500 text-xs">
          <span>{user.subscribersCount} subscribers</span>
        </div>
      </div>
      <button
        onClick={handleSubscribeClick}
        className={`px-6 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 shadow-lg ${
          user.isSubscribed
            ? "bg-[#2a2a2a] text-white border border-gray-700 hover:bg-[#333]"
            : "bg-white text-black hover:bg-gray-200"
        }`}
      >
        {user.isSubscribed ? <Bell size={16} /> : <UserPlus size={16} />}
        {user.isSubscribed ? "Subscribed" : "Subscribe"}
      </button>
    </div>
  );
};

const PlaylistSearchCard = ({ playlist }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/playlist/view/${playlist._id}`)}
      className="group cursor-pointer bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition"
    >
      <div className="relative aspect-video">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
          <span className="text-xl font-bold">{playlist.totalVideos}</span>
          <List size={20} className="mt-1 opacity-70" />
        </div>
        <img
          src={playlist.thumbnail}
          alt={playlist.name}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
        />
        {playlist.isPrivate && (
          <div className="absolute top-2 left-2 bg-black/80 p-1.5 rounded-full text-white/70 backdrop-blur-md border border-white/10">
            <Lock size={12} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-sm truncate group-hover:text-blue-400 transition">
          {playlist.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          by {playlist.owner?.username || "Unknown"}
        </p>
        <p className="text-[10px] text-gray-600 mt-3 uppercase font-bold tracking-wider">
          View Full Playlist
        </p>
      </div>
    </div>
  );
};

const EmptyState = ({ type, query }) => (
  <div className="flex flex-col items-center justify-center py-24 text-gray-500">
    <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
      <Search size={32} className="opacity-20 text-white" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">No {type} found</h3>
    <p className="text-sm text-gray-400 max-w-md text-center">
      We couldn't find any {type.toLowerCase()} matching "
      <span className="text-white font-medium">{query}</span>".
    </p>
  </div>
);

// ==========================================
// 3. MAIN PAGE LOGIC
// ==========================================

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.userData);
  const query = searchParams.get("query") || "";

  const [activeTab, setActiveTab] = useState("videos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [results, setResults] = useState({
    videos: [],
    users: [],
    tweets: [],
    playlists: [],
  });

  useEffect(() => {
    if (!query) return;

    const performSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchData(
          "GET",
          `${SEARCH_ENDPOINT_BASE}?query=${query}`
        );

        if (response?.Data) {
          const data = response.Data;
          setResults({
            videos: Videos(data.videos),
            users: Users(data.user),
            tweets: Tweets(data.tweetSearch),
            playlists: Playlists(data.playlist),
          });
        }
      } catch (err) {
        console.error("Search failed:", err);
        setError("Failed to fetch search results.");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(performSearch, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  // --- ACTIONS ---

  // Updated: Accepts the whole user object
  const handleSubscribe = async (targetUser) => {
    if (!currentUser) return navigate("/auth");

    console.log("Subscribing to:", targetUser.username);

    // 1. Optimistic Update (Uses ID for accuracy)
    setResults((prev) => {
      const updatedUsers = prev.users.map((user) => {
        if (String(user._id) === String(targetUser._id)) {
          const newStatus = !user.isSubscribed;
          const newCount = newStatus
            ? user.subscribersCount + 1
            : Math.max(0, user.subscribersCount - 1);

          return {
            ...user,
            isSubscribed: newStatus,
            isSubcribed: newStatus,
            subscribersCount: newCount,
            SubscriberCount: newCount,
            subcribersCount: newCount,
          };
        }
        return user;
      });
      return { ...prev, users: updatedUsers };
    });

    // 2. API Call (Uses USERNAME as requested)
    try {
      await fetchData(
        "POST",
        `http://localhost:5000/api/v1/users/subscribe/${targetUser.username}`
      );
    } catch (e) {
      console.error("Subscribe API failed", e);
    }
  };

  const handleLikeTweet = async (tweetId) => {
    if (!currentUser) return navigate("/auth");

    setResults((prev) => {
      const updatedTweets = prev.tweets.map((tweet) => {
        if (String(tweet._id) === String(tweetId)) {
          const newStatus = !tweet.isLiked;
          const newCount = newStatus
            ? tweet.likesCount + 1
            : Math.max(0, tweet.likesCount - 1);

          return {
            ...tweet,
            isLiked: newStatus,
            likesCount: newCount,
            likes: newCount,
          };
        }
        return tweet;
      });
      return { ...prev, tweets: updatedTweets };
    });

    try {
      await fetchData(
        "POST",
        `http://localhost:5000/api/v1/tweets/Likes/${tweetId}`,
        { type: "tweet" }
      );
    } catch (e) {
      console.error("Like API failed", e);
    }
  };

  // --- RENDER ---
  const renderContent = () => {
    if (loading)
      return (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-400">Searching...</p>
        </div>
      );
    if (error)
      return (
        <div className="text-center py-20 text-red-400">
          <p>{error}</p>
        </div>
      );

    if (activeTab === "videos") {
      if (results.videos.length === 0)
        return <EmptyState type="Videos" query={query} />;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      );
    }

    if (activeTab === "channels") {
      if (results.users.length === 0)
        return <EmptyState type="Channels" query={query} />;
      return (
        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {results.users.map((user) => (
            <UserSearchCard
              key={user._id}
              user={user}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      );
    }

    if (activeTab === "playlists") {
      if (results.playlists.length === 0)
        return <EmptyState type="Playlists" query={query} />;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.playlists.map((playlist) => (
            <PlaylistSearchCard key={playlist._id} playlist={playlist} />
          ))}
        </div>
      );
    }

    if (activeTab === "tweets") {
      if (results.tweets.length === 0)
        return <EmptyState type="Tweets" query={query} />;
      return (
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {results.tweets.map((tweet) => (
            <TweetCard
              key={tweet._id}
              tweet={tweet}
              currentUser={currentUser}
              onLike={() => handleLikeTweet(tweet._id)}
              onDelete={() => {}}
            />
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-3 text-gray-400 mb-6">
          <Filter size={20} className="text-blue-500" />
          <h1 className="text-xl">
            Search Results for:{" "}
            <span className="text-white font-bold">"{query}"</span>
          </h1>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-gray-800 pb-1">
          <TabButton
            active={activeTab === "videos"}
            label={`Videos (${results.videos.length})`}
            icon={VideoIcon}
            onClick={() => setActiveTab("videos")}
          />
          <TabButton
            active={activeTab === "channels"}
            label={`Channels (${results.users.length})`}
            icon={UsersIcon}
            onClick={() => setActiveTab("channels")}
          />
          <TabButton
            active={activeTab === "playlists"}
            label={`Playlists (${results.playlists.length})`}
            icon={List}
            onClick={() => setActiveTab("playlists")}
          />
          <TabButton
            active={activeTab === "tweets"}
            label={`Tweets (${results.tweets.length})`}
            icon={FileText}
            onClick={() => setActiveTab("tweets")}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto min-h-[50vh]">{renderContent()}</div>
    </div>
  );
};

export default SearchPage;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import fetchData from "../../apiClient.js";
import { useSelector } from "react-redux";
import VideoCard from "../../components/videoCard.jsx";
import TweetCard from "../../components/tweetCard.jsx";
import {
  Video,
  FileText,
  List,
  Bell,
  UserPlus,
  Image as ImageIcon,
  Loader2,
  Lock,
} from "lucide-react";

// --- Data Formatters ---

const formatChannelData = (data) => {
  if (!data) return null;
  return {
    ...data,
    coverImage: data.coverImage || data.coverimage,
    subscribersCount: data.subscribersCount ?? data.subcribersCount ?? 0,
    subscribedToCount:
      data.subscribedToCount ??
      data.channelsSubscribedToCount ??
      data.subcribedToCount ??
      0,
    isSubscribed: data.isSubscribed ?? data.isSubcribed ?? false,
  };
};

const formatContentData = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    owner: Array.isArray(item.owner) ? item.owner[0] : item.owner,
    isLiked: item.isLiked ?? item.isLikes ?? false,
    likesCount: item.likesCount ?? item.likeCount ?? 0,
  }));
};

const formatPlaylistData = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    description: item.description || item.discription || "",
    isPrivate: item.isPrivate ?? item.isprivate ?? false,
    videos: Array.isArray(item.videos) ? item.videos : [],
  }));
};

// --- UI Components ---

const TabButton = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 border-b-2 ${
      active
        ? "border-blue-500 text-blue-400 bg-white/5"
        : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
    }`}
  >
    {Icon && <Icon size={18} />}
    {label}
  </button>
);

const EmptyState = ({ message, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl bg-[#1a1a1a]/30">
    <div className="w-16 h-16 bg-[#252525] rounded-full flex items-center justify-center mb-4">
      <Icon size={24} className="opacity-50" />
    </div>
    <p className="text-lg font-medium text-gray-400">{message}</p>
  </div>
);

const PlaylistCard = ({ playlist }) => {
  const thumbnail =
    playlist.thumbnail ||
    (playlist.videos?.length > 0 ? playlist.videos[0].thumbnail : null) ||
    `https://placehold.co/400x225/252525/475569?text=${encodeURIComponent(
      playlist.name
    )}`;

  const videoCount = playlist.totalVideos || playlist.videos?.length || 0;

  return (
    <Link to = {`/playlist/view/${playlist._id}`}>
      <div className="group cursor-pointer">
        <div className="relative aspect-video bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 group-hover:border-gray-600 transition mb-3">
          <img
            src={thumbnail}
            alt={playlist.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
          />

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
            <span className="text-xl font-bold">{videoCount}</span>
            <List size={20} className="mt-1 opacity-70" />
          </div>

          {playlist.isPrivate && (
            <div
              className="absolute top-2 left-2 bg-black/80 p-1.5 rounded-full text-white/70 backdrop-blur-md border border-white/10"
              title="Private Playlist"
            >
              <Lock size={12} />
            </div>
          )}
        </div>

        <h3 className="text-white font-bold text-sm truncate group-hover:text-blue-400 transition">
          {playlist.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2.5em]">
          {playlist.description || "No description provided."}
        </p>
        <p className="text-[10px] text-gray-600 mt-2 font-bold uppercase tracking-wider">
          View Full Playlist
        </p>
      </div>
    </Link>
  );
};

// --- Main Page ---

const ChannelPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.userData);

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const [activeTab, setActiveTab] = useState("videos");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChannel = async () => {
      try {
        setIsLoading(true);

        const profileRes = await fetchData(
          "GET",
          `https://stream-x.onrender.com/api/v1/users/channel/${username}`
        );
        if (!profileRes?.Data) throw new Error("Channel not found");

        const cleanProfile = formatChannelData(profileRes.Data);
        setChannel(cleanProfile);

        const [vidRes, twtRes, plRes] = await Promise.allSettled([
          fetchData(
            "GET",
            `https://stream-x.onrender.com/api/v1/Videos/get-channel-videos/${cleanProfile._id}`
          ),
          fetchData(
            "GET",
            `https://stream-x.onrender.com/api/v1/tweets/get-channel-tweets/${cleanProfile._id}`
          ),
          fetchData(
            "GET",
            `https://stream-x.onrender.com/api/v1/playlist/user/${cleanProfile._id}`
          ),
        ]);

        if (vidRes.status === "fulfilled" && vidRes.value?.Data) {
          setVideos(formatContentData(vidRes.value.Data));
        }

        if (twtRes.status === "fulfilled" && twtRes.value?.Data) {
          setTweets(formatContentData(twtRes.value.Data));
        }

        if (plRes.status === "fulfilled" && plRes.value?.Data) {
          const rawList = plRes.value.Data.playlists || plRes.value.Data;
          const formattedList = formatPlaylistData(rawList);

          // LOGIC: If Owner -> Show All. If Visitor -> Show Only Public.
          if (currentUser?._id === cleanProfile._id) {
            setPlaylists(formattedList);
          } else {
            setPlaylists(formattedList.filter((pl) => !pl.isPrivate));
          }
        }
      } catch (err) {
        console.error("Channel Load Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Reload when username changes (navigation)
    if (username) loadChannel();
  }, [username, currentUser?._id]); // Added currentUser._id dependency for correct filtering

  const handleSubscribe = async () => {
    if (!currentUser) return navigate("/auth");
    if (isSubscribing) return;

    setIsSubscribing(true);
    const oldState = { ...channel };

    setChannel((prev) => ({
      ...prev,
      isSubscribed: !prev.isSubscribed,
      subscribersCount: !prev.isSubscribed
        ? prev.subscribersCount + 1
        : prev.subscribersCount - 1,
    }));

    try {
      await fetchData(
        "POST",
        `https://stream-x.onrender.com/api/v1/users/subscribe/${channel.username}`
      );
    } catch (e) {
      setChannel(oldState);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleLikeTweet = async (tweetId) => {
    if (!currentUser) return navigate("/auth");

    setTweets((prev) =>
      prev.map((t) => {
        if (t._id !== tweetId) return t;
        const isLiked = !t.isLiked;
        return {
          ...t,
          isLiked,
          likesCount: isLiked ? t.likesCount + 1 : t.likesCount - 1,
        };
      })
    );

    try {
      await fetchData(
        "POST",
        `https://stream-x.onrender.com/api/v1/tweets/Likes/${tweetId}`,
        { type: "tweet" }
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#121212] flex justify-center items-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  if (error || !channel)
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col justify-center items-center text-white gap-4">
        <h1 className="text-2xl font-bold">Channel Not Found</h1>
        <button
          onClick={() => navigate("/")}
          className="text-blue-400 hover:underline"
        >
          Go Home
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans pb-20">
      {/* Cover */}
      <div className="relative w-full h-40 md:h-60 bg-gradient-to-r from-gray-800 to-gray-900">
        {channel.coverImage ? (
          <img
            src={channel.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <ImageIcon size={48} className="opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-50"></div>
      </div>

      {/* Profile Info */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 pb-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-10 mb-6">
            <div className="relative shrink-0">
              <img
                src={channel.avatar}
                alt={channel.username}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#1a1a1a] object-cover bg-[#2a2a2a]"
              />
            </div>

            <div className="flex-1 text-center md:text-left mb-2">
              <h1 className="text-3xl font-bold text-white mb-1">
                {channel.fullname}
              </h1>
              <p className="text-gray-400 font-medium">@{channel.username}</p>
              <div className="flex gap-4 mt-3 text-sm text-gray-500 justify-center md:justify-start">
                <span>
                  <strong className="text-white">
                    {channel.subscribersCount}
                  </strong>{" "}
                  subscribers
                </span>
                <span>•</span>
                <span>
                  <strong className="text-white">
                    {channel.subscribedToCount}
                  </strong>{" "}
                  subscribed
                </span>
              </div>
            </div>

            <div className="mb-4 md:mb-2">
              {currentUser?._id === channel._id ? (
                <button
                  onClick={() => navigate("/account")}
                  className="px-6 py-2.5 bg-[#2a2a2a] hover:bg-[#333] border border-gray-700 rounded-full font-bold flex items-center gap-2 transition"
                >
                  <Video size={18} /> Manage Channel
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className={`px-8 py-2.5 rounded-full font-bold flex items-center gap-2 transition shadow-lg ${
                    channel.isSubscribed
                      ? "bg-[#2a2a2a] text-white border border-gray-700"
                      : "bg-white text-black hover:bg-gray-200"
                  }`}
                >
                  {isSubscribing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : channel.isSubscribed ? (
                    <>
                      <Bell size={18} /> Subscribed
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} /> Subscribe
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto border-t border-gray-800 pt-1">
            <TabButton
              active={activeTab === "videos"}
              label="Videos"
              icon={Video}
              onClick={() => setActiveTab("videos")}
            />
            <TabButton
              active={activeTab === "tweets"}
              label="Tweets"
              icon={FileText}
              onClick={() => setActiveTab("tweets")}
            />
            <TabButton
              active={activeTab === "playlists"}
              label="Playlists"
              icon={List}
              onClick={() => setActiveTab("playlists")}
            />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {activeTab === "videos" &&
          (videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState message="No videos yet." icon={Video} />
          ))}

        {activeTab === "tweets" && (
          <div className="max-w-2xl mx-auto">
            {tweets.length > 0 ? (
              <div className="space-y-4">
                {tweets.map((tweet) => (
                  <TweetCard
                    key={tweet._id}
                    tweet={tweet}
                    currentUser={currentUser}
                    onLike={() => handleLikeTweet(tweet._id)}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No tweets yet." icon={FileText} />
            )}
          </div>
        )}

        {activeTab === "playlists" &&
          (playlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist._id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <EmptyState message="No public playlists." icon={List} />
          ))}
      </div>
    </div>
  );
};

export default ChannelPage;

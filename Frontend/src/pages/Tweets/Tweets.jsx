import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import fetchData from "../../apiClient.js";
import TweetCard from "../../components/tweetCard.jsx";
import {
  Image as ImageIcon,
  Smile,
  BarChart2,
  Calendar,
  MapPin,
  X,
  Loader2,
  PenLine,
} from "lucide-react";

// --- 1. Skeleton Loader Component ---
const TweetSkeleton = () => (
  <div className="p-4 border-b border-gray-800 animate-pulse flex gap-4">
    <div className="w-12 h-12 bg-gray-800 rounded-full shrink-0"></div>
    <div className="flex-1 space-y-3">
      <div className="flex gap-2">
        <div className="h-4 bg-gray-800 w-1/4 rounded"></div>
        <div className="h-4 bg-gray-800 w-1/6 rounded"></div>
      </div>
      <div className="h-4 bg-gray-800 w-full rounded"></div>
      <div className="h-4 bg-gray-800 w-3/4 rounded"></div>
      <div className="h-64 bg-gray-800 w-full rounded-xl mt-2"></div>
      <div className="flex justify-between pt-2">
        <div className="h-4 bg-gray-800 w-8 rounded"></div>
        <div className="h-4 bg-gray-800 w-8 rounded"></div>
        <div className="h-4 bg-gray-800 w-8 rounded"></div>
        <div className="h-4 bg-gray-800 w-8 rounded"></div>
      </div>
    </div>
  </div>
);

// --- 2. Create Tweet Input Component ---
const CreateTweetInput = ({ onPost, currentUser }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setIsPosting(true);
    const success = await onPost(content, image);

    if (success) {
      setContent("");
      setImage(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setIsPosting(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="border-b border-gray-800 px-4 py-4 bg-black/20 backdrop-blur-sm">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          <img
            src={
              currentUser?.avatar ||
              "https://placehold.co/100x100/3B82F6/ffffff?text=?"
            }
            alt="User"
            className="w-11 h-11 rounded-full object-cover border border-gray-700 hover:opacity-90 transition cursor-pointer"
          />
        </div>

        {/* Input Area */}
        <form className="flex-1" onSubmit={handleSubmit}>
          <textarea
            className="w-full bg-transparent text-white text-xl placeholder-gray-500 outline-none resize-none min-h-[60px] py-2"
            placeholder="What is happening?!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPosting}
          />

          {/* Image Preview */}
          {preview && (
            <div className="relative mt-2 mb-4 group">
              <img
                src={preview}
                alt="Preview"
                className="rounded-2xl max-h-[300px] w-auto object-cover border border-gray-700 shadow-lg"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 left-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Tools & Submit */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800/50">
            <div className="flex gap-1 text-blue-500">
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageSelect}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-blue-500/10 transition-colors"
                title="Media"
              >
                <ImageIcon size={20} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-blue-500/10 transition-colors"
                title="Poll"
              >
                <BarChart2 size={20} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-blue-500/10 transition-colors"
                title="Emoji"
              >
                <Smile size={20} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-blue-500/10 transition-colors hidden sm:block"
                title="Schedule"
              >
                <Calendar size={20} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-blue-500/10 transition-colors hidden sm:block"
                title="Location"
              >
                <MapPin size={20} />
              </button>
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && !image) || isPosting}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all transform active:scale-95 flex items-center gap-2 ${
                (!content.trim() && !image) || isPosting
                  ? "bg-blue-500/50 text-white/50 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              }`}
            >
              {isPosting && <Loader2 size={16} className="animate-spin" />}
              {isPosting ? "Posting" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 3. Main Page Component ---
const TweetsPage = () => {
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useSelector((state) => state.auth.userData);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        await getTweets();
      } catch (e) {
        console.error("Initialization Error:", e);
        setError(e.message || "Failed to load tweets");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const getTweets = async () => {
    try {
      const response = await fetchData(
        "GET",
        "http://localhost:5000/api/v1/tweets"
      );
      if (response && (response.Data || response.data)) {
        setTweets(response.Data || response.data);
      } else {
        setTweets([]);
      }
    } catch (e) {
      console.error("Fetch Error:", e);
      throw e;
    }
  };

  const handlePostTweet = async (content, imageFile) => {
    if (!currentUser) {
      navigate("/auth");
      return false;
    }

    try {
      const formData = new FormData();
      formData.append("content", content);

      // Only append if the file exists; no need to branch the API call itself
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // DEBUG: Correct way to log FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Ensure fetchData does NOT set 'Content-Type': 'application/json' for this call
      await fetchData(
        "POST",
        "http://localhost:5000/api/v1/tweets/create",
        formData,
       
      );

      await getTweets();
      return true;
    } catch (e) {
      console.error("Post failed", e);
      alert("Failed to post tweet.");
      return false;
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    if (!window.confirm("Delete this post?")) return;

    const previousTweets = [...tweets];
    setTweets((prev) => prev.filter((t) => t._id !== tweetId));

    try {
      await fetchData(
        "DELETE",
        `http://localhost:5000/api/v1/tweets/delete/${tweetId}`
      );
    } catch (e) {
      console.error("Delete failed", e);
      setTweets(previousTweets);
      alert("Failed to delete tweet.");
    }
  };

  // --- FIXED LIKE HANDLER ---
  const handleLikeTweet = async (tweetId, type) => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    const previousTweets = [...tweets];

    setTweets((prev) =>
      prev.map((t) => {
        if (t._id === tweetId) {
          const newIsLiked = !t.isLiked;

          // ROBUST CALCULATION:
          // 1. Get the current value (prioritize modified 'likes', fallback to 'likesCount')
          // 2. Ensure it is a Number to avoid string concatenation errors (e.g. "1"+1 = "11")
          const existingCount = t.likes !== undefined ? t.likes : t.likesCount;
          const currentCount = Number(existingCount || 0);

          const newCount = newIsLiked
            ? currentCount + 1
            : Math.max(0, currentCount - 1);

          return {
            ...t,
            isLiked: newIsLiked,
            // Update BOTH fields so child components always get the fresh number
            likes: newCount,
            likesCount: newCount,
          };
        }
        return t;
      })
    );

    try {
      await fetchData(
        "POST",
        `http://localhost:5000/api/v1/Videos/Likes/${tweetId}`,
        { type }
      );
    } catch (e) {
      console.error("Like failed", e);
      setTweets(previousTweets);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-red-500">
            Connection Failed
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex justify-center">
      {/* Feed Container */}
      <div className="w-full max-w-2xl border-x border-gray-800 min-h-screen">
        {/* Sticky Header */}
        <div
          className="sticky top-0 bg-black/80 backdrop-blur-md z-20 border-b border-gray-800 px-4 py-3 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <h2 className="text-xl font-bold">Home</h2>
        </div>

        {/* Input Section */}
        {currentUser && (
          <CreateTweetInput
            onPost={handlePostTweet}
            currentUser={currentUser}
          />
        )}

        {/* Feed List */}
        <div>
          {isLoading ? (
            <>
              <TweetSkeleton />
              <TweetSkeleton />
              <TweetSkeleton />
            </>
          ) : tweets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                <PenLine size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No posts yet
              </h3>
              <p className="max-w-xs text-center">
                When you post photos or text, they will show up here.
              </p>
            </div>
          ) : (
            tweets.map((tweet) => (
              <TweetCard
                key={tweet._id}
                tweet={tweet}
                currentUser={currentUser}
                onLike={handleLikeTweet}
                onDelete={handleDeleteTweet}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetsPage;

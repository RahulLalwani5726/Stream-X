import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import fetchData from "../../apiClient";
import { useSelector } from "react-redux";
import {
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Share2,
  Lock,
  Globe,
  X,
  Check,
  PlayCircle,
  Loader2,
} from "lucide-react";

// --- 1. Utility Components ---

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <div
      className={`fixed bottom-5 right-5 ${
        bgColors[type] || "bg-gray-800"
      } text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce-in z-50`}
    >
      <span>
        {type === "success" ? (
          <Check size={18} />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-white" />
        )}
      </span>
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 hover:text-gray-200">
        <X size={16} />
      </button>
    </div>
  );
};

const PlaylistSkeleton = () => (
  <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 animate-pulse">
    <div className="aspect-video bg-gray-800" />
    <div className="p-4 space-y-3">
      <div className="h-6 bg-gray-800 rounded w-3/4" />
      <div className="h-4 bg-gray-800 rounded w-full" />
      <div className="h-4 bg-gray-800 rounded w-1/2" />
    </div>
  </div>
);

// --- 2. Playlist Card Component ---
const PlaylistCard = ({
  playlist,
  currentUser,
  onEdit,
  onDelete,
  onShare,
  onClick,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Ownership Check: Handle populated object vs string ID
  const ownerId =
    typeof playlist.owner === "object" ? playlist.owner._id : playlist.owner;
  const isOwner = currentUser && ownerId === currentUser._id;

  // Get thumbnail
  const firstVideoThumbnail = playlist.videos?.[0]?.thumbnail;
  const thumbnailSrc =
    firstVideoThumbnail ||
    `https://placehold.co/400x225/111/475569?text=${encodeURIComponent(
      playlist.name
    )}`;

  // Owner Info Fallback
  const ownerName =
    playlist.ownerData?.username ||
    (typeof playlist.owner === "object" ? playlist.owner.username : "Unknown");
  const ownerAvatar =
    playlist.ownerData?.avatar ||
    (typeof playlist.owner === "object" ? playlist.owner.avatar : null);

  return (
    <div
      className="group relative bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick(playlist._id)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={thumbnailSrc}
          alt={playlist.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white font-bold text-lg flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <PlayCircle className="fill-current" /> Play All
          </span>
        </div>

        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1 border border-gray-700">
          <span>📑</span>
          <span>{playlist.videos?.length || 0} videos</span>
        </div>

        {/* Visibility Badge */}
        {playlist.isprivate && (
          <div
            className="absolute top-2 left-2 bg-black/60 p-1.5 rounded-full text-gray-300"
            title="Private"
          >
            <Lock size={12} />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 relative">
        <div className="flex justify-between items-start">
          <h3 className="text-white font-bold text-lg truncate pr-2 flex-1 group-hover:text-blue-400 transition">
            {playlist.name}
          </h3>

          {/* Menu Trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition"
          >
            <MoreVertical size={18} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-2 top-10 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-xl z-20 w-32 py-1 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {isOwner && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(playlist);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(playlist._id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 text-left"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(playlist._id);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left"
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-400 text-sm mt-1 line-clamp-2 min-h-[2.5em]">
          {playlist.discription || "No description provided."}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 pt-3">
          <div className="flex items-center gap-2">
            {ownerAvatar && (
              <img
                src={ownerAvatar}
                alt={ownerName}
                className="w-5 h-5 rounded-full object-cover border border-gray-700"
              />
            )}
            <span className="text-gray-300 font-medium hover:underline cursor-pointer">
              {ownerName}
            </span>
          </div>
          <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

// --- 3. Playlist Form Modal (Create & Edit) ---
const PlaylistFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    discription: "",
    isprivate: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || "",
        discription: initialData.discription || "",
        isprivate: initialData.isprivate || false,
      });
    } else {
      setFormData({ name: "", discription: "", isprivate: false });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {initialData ? (
              <Edit2 size={20} className="text-blue-500" />
            ) : (
              <Plus size={20} className="text-blue-500" />
            )}
            {initialData ? "Edit Playlist" : "Create New Playlist"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-gray-800 p-1 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              placeholder="e.g., Coding Tutorials"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <textarea
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-24 transition"
              placeholder="What's this collection about?"
              value={formData.discription}
              onChange={(e) =>
                setFormData({ ...formData, discription: e.target.value })
              }
            />
          </div>

          <div className="flex items-center justify-between bg-[#0f0f0f] p-3 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
              {formData.isprivate ? (
                <Lock className="text-red-400" size={20} />
              ) : (
                <Globe className="text-green-400" size={20} />
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {formData.isprivate ? "Private" : "Public"}
                </p>
                <p className="text-xs text-gray-500">
                  {formData.isprivate
                    ? "Only you can see this"
                    : "Anyone can see this"}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.isprivate}
                onChange={(e) =>
                  setFormData({ ...formData, isprivate: e.target.checked })
                }
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg transition flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialData ? "Save Changes" : "Create Playlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const PlaylistPage = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "create",
    data: null,
  });
  const [toast, setToast] = useState(null);

  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    setCurrentUser(userData);
    fetchPlaylists();
  }, [userData]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      const response = await fetchData(
        "GET",
        "https://stream-x.onrender.com/api/v1/playlist"
      );

      // Robust check for different response structures
      console.log(response);

      if (response && response.Data) {
        if (Array.isArray(response.Data)) {
          // Case 1: Data is [{ playlists: [...] }] (Aggregation)
          if (response.Data.length > 0 && response.Data[0].playlists) {
            setPlaylists(response.Data[0].playlists);
          }
          // Case 2: Data is [playlist1, playlist2] (Direct Array)
          else {
            setPlaylists(response.Data);
          }
        }
        // Case 3: Data is { playlists: [...] } (Object Wrapper)
        else if (response.Data.playlists) {
          setPlaylists(response.Data.playlists);
        } else {
          setPlaylists([]);
        }
      } else {
        setPlaylists([]);
      }
    } catch (e) {
      console.error("Fetch Playlist Error:", e);
      if (e.message !== "UNAUTHORIZED") {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    try {
      if (modalConfig.type === "create") {
        await fetchData(
          "POST",
          "https://stream-x.onrender.com/api/v1/playlist/create",
          data
        );
        showToast("Playlist created successfully!");
      } else {
        await fetchData(
          "PATCH",
          `https://stream-x.onrender.com/api/v1/playlist/edit/${modalConfig.data._id}`,
          data
        );
        showToast("Playlist updated successfully!");
      }
      await fetchPlaylists();
    } catch (e) {
      console.error("Operation failed", e);
      showToast("Something went wrong.", "error");
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    try {
      await fetchData(
        "DELETE",
        `https://stream-x.onrender.com/api/v1/playlist/delete/${id}`
      );
      setPlaylists((prev) => prev.filter((p) => p._id !== id));
      showToast("Playlist deleted.", "success");
    } catch (e) {
      console.error("Delete failed", e);
      showToast("Failed to delete.", "error");
    }
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/playlist/${id}`;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard!", "info");
  };

  // --- Filtering Logic ---
  const filteredPlaylists = useMemo(() => {
    return playlists.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Check ownership securely (handle string IDs vs objects)
      const ownerId = typeof p.owner === "object" ? p.owner._id : p.owner;
      const matchesOwner =
        filterMode === "mine"
          ? currentUser && ownerId === currentUser._id
          : true;

      return matchesSearch && matchesOwner;
    });
  }, [playlists, searchQuery, filterMode, currentUser]);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans pb-10">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <PlaylistFormModal
        isOpen={modalConfig.isOpen}
        onClose={() =>
          setModalConfig({ isOpen: false, type: "create", data: null })
        }
        onSubmit={handleFormSubmit}
        initialData={modalConfig.data}
      />

      {/* Header Area */}
      <div className="sticky top-0 bg-[#121212]/80 backdrop-blur-md z-30 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-blue-500">📑</span> Library
              </h1>
            </div>

            {/* Search & Actions Bar */}
            <div className="flex flex-1 md:justify-end items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64 group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search playlists..."
                  className="w-full bg-[#1e1e1e] border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {currentUser ? (
                <button
                  onClick={() =>
                    setModalConfig({ isOpen: true, type: "create", data: null })
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-bold shadow-lg transition flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={20} />{" "}
                  <span className="hidden sm:inline">New Playlist</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/auth")}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full font-bold border border-gray-600 transition"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          {currentUser && (
            <div className="flex gap-4 mt-4 text-sm border-b border-gray-800">
              <button
                onClick={() => setFilterMode("all")}
                className={`pb-2 border-b-2 transition ${
                  filterMode === "all"
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                All Playlists
              </button>
              <button
                onClick={() => setFilterMode("mine")}
                className={`pb-2 border-b-2 transition ${
                  filterMode === "mine"
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                My Playlists
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto p-4 sm:p-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl text-center mb-6">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={fetchPlaylists}
              className="text-sm underline text-gray-300 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <PlaylistSkeleton key={n} />
            ))}
          </div>
        ) : filteredPlaylists.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-[#1e1e1e] rounded-full flex items-center justify-center mb-6 border border-gray-800">
              <Search size={40} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Playlists Found
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "Create your first collection to get started!"}
            </p>
            {!searchQuery && currentUser && (
              <button
                onClick={() =>
                  setModalConfig({ isOpen: true, type: "create", data: null })
                }
                className="mt-6 text-blue-400 hover:text-blue-300 font-medium hover:underline"
              >
                Create one now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlaylists.map((playlist) =>
              currentUser._id == playlist.ownerData._id ||
              !playlist.isprivate ? (
                <PlaylistCard
                  key={playlist._id}
                  playlist={playlist}
                  currentUser={currentUser}
                  onEdit={(data) =>
                    setModalConfig({ isOpen: true, type: "edit", data })
                  }
                  onDelete={handleDeletePlaylist}
                  onShare={handleShare}
                  onClick={(id) => navigate(`/playlist/view/${id}`)}
                />
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;

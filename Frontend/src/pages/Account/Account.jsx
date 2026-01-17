import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import fetchData from "../../apiClient.js";
import { useSelector, useDispatch } from "react-redux";
import { Login } from "../../store/feature/auth.js";
import {
  Eye,
  ThumbsUp,
  Users,
  Video,
  Edit2,
  Trash2,
  Plus,
  Settings,
  Image as ImageIcon,
  X,
  Upload,
  FileText,
  List,
  Lock,
  Globe,
  Camera,
  History,
  LogOut,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// --- Helper Functions ---
function subscribersFormate(num) {
  if (!num) return "0";
  if (num < 1000) return num.toString();
  if (num >= 1000 && num < 1000000) return (num / 1000).toFixed(1) + " k";
  if (num >= 1000000 && num < 1000000000)
    return (num / 1000000).toFixed(1) + " M";
  return (num / 1000000000).toFixed(1) + " B";
}

// ==========================================
// 1. UI COMPONENTS
// ==========================================

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

const StatsCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-[#1e1e1e] p-5 rounded-xl border border-gray-800 flex items-center gap-5 shadow-lg hover:border-gray-700 transition-colors group cursor-default">
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border transition-transform group-hover:scale-110 ${color}`}
    >
      <Icon size={24} />
    </div>
    <div>
      <h4 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">
        {label}
      </h4>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const ModalOverlay = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-[#1e1e1e] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-700 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  </div>
);

// ==========================================
// 2. MODALS (Upload, Edit, Settings)
// ==========================================

const UploadModal = ({ type, onClose, onUpload }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublish, setIsPublish] = useState(true);
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", title);

    if (type === "video") {
      formData.append("discription", description);
      if (file) formData.append("video", file);
      if (thumbnail) formData.append("thumbnail", thumbnail);
    } else {
      if (file) formData.append("tweetImage", file);
    }

    formData.append("isPublish", isPublish);

    await onUpload(formData, type);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <ModalOverlay
      title={`Upload ${type === "video" ? "Video" : "Post"}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            {type === "video" ? "Title *" : "Content *"}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
            required
            disabled={isSubmitting}
            placeholder={
              type === "video" ? "Video Title" : "What's on your mind?"
            }
          />
        </div>

        {type === "video" && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white h-28 resize-none focus:border-blue-500 outline-none transition"
              disabled={isSubmitting}
            />
          </div>
        )}

        <div className="space-y-4 pt-2">
          {type === "video" && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 bg-[#121212] cursor-pointer hover:bg-[#252525] transition">
              <input
                type="checkbox"
                checked={isPublish}
                onChange={(e) => setIsPublish(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-gray-200">
                Publicly Visible
              </span>
            </label>
          )}

          <div
            className={`grid ${
              type === "video" ? "grid-cols-2" : "grid-cols-1"
            } gap-4`}
          >
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                {type === "video" ? "Video File *" : "Image (Optional)"}
              </label>
              <label
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-[#121212] hover:bg-[#252525] transition ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {type === "video" ? (
                    <Video className="w-8 h-8 mb-2 text-gray-400" />
                  ) : (
                    <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                  )}
                  <p className="text-xs text-gray-500 text-center px-2 truncate w-full">
                    {file
                      ? file.name
                      : type === "video"
                      ? "Select Video"
                      : "Select Image"}
                  </p>
                </div>
                <input
                  type="file"
                  accept={type === "video" ? "video/*" : "image/*"}
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  required={type === "video"}
                  disabled={isSubmitting}
                />
              </label>
            </div>

            {type === "video" && (
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Thumbnail
                </label>
                <label
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-[#121212] hover:bg-[#252525] transition ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500 text-center px-2 truncate w-full">
                      {thumbnail ? thumbnail.name : "Select Image"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}{" "}
            {isSubmitting ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

// --- SMART EDIT MODAL (Handles Video, Tweet, & Playlist) ---
const EditModal = ({ item, type, onClose, onUpdate }) => {
  // 1. STATE INITIALIZATION
  const getInitialTitle = () => {
    if (type === "playlist") return item.name;
    if (type === "tweet") return item.content;
    return item.title;
  };

  const getInitialDesc = () => {
    return item.description || item.discription || "";
  };

  const getInitialPublicStatus = () => {
    if (type === "video") return item.isPublish;
    if (type === "playlist") {
      const priv = item.isPrivate ?? item.isprivate ?? false;
      return !priv; // Public is the opposite of Private
    }
    return true;
  };

  const [title, setTitle] = useState(getInitialTitle());
  const [description, setDescription] = useState(getInitialDesc());
  const [isPublic, setIsPublic] = useState(getInitialPublicStatus());
  const [thumbnail, setThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. SUBMIT HANDLER (Fixes the undefined error)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    let payload;

    if (type === "video") {
      // Use FormData for files
      const formData = new FormData();
      formData.append("title", title);
      formData.append("discription", description);
      formData.append("isPublish", isPublic);
      if (thumbnail) formData.append("thumbnail", thumbnail);
      payload = formData;
    } else if (type === "tweet") {
      // Use JSON for text only
      payload = { content: title };
    } else if (type === "playlist") {
      // Use JSON for text only (Backend expects JSON)
      payload = {
        name: title,
        discription: description,
        isprivate: !isPublic, // Convert Public -> Private boolean
      };
    }

    await onUpdate(item._id, payload, type);
    setIsSubmitting(false);
    onClose();
  };

  const getLabel = () => {
    if (type === "playlist") return "Playlist Name";
    if (type === "tweet") return "Tweet Content";
    return "Video Title";
  };

  return (
    <ModalOverlay
      title={`Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title / Name / Content Field */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            {getLabel()}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
            autoFocus
          />
        </div>

        {/* Description Field (Video & Playlist) */}
        {(type === "video" || type === "playlist") && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white h-28 resize-none focus:border-blue-500 outline-none transition"
              placeholder="Tell viewers about this..."
            />
          </div>
        )}

        {/* Visibility Toggle (Video & Playlist) */}
        {(type === "video" || type === "playlist") && (
          <div
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition select-none ${
              !isPublic
                ? "bg-red-500/10 border-red-500/30"
                : "bg-green-500/10 border-green-500/30"
            }`}
            onClick={() => !isSubmitting && setIsPublic(!isPublic)}
          >
            <div className="flex items-center gap-3">
              {!isPublic ? (
                <Lock className="text-red-400" size={20} />
              ) : (
                <Globe className="text-green-400" size={20} />
              )}
              <div>
                <p
                  className={`text-sm font-bold ${
                    !isPublic ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {!isPublic ? "Private" : "Public"}
                </p>
                <p className="text-xs text-gray-400">
                  {!isPublic
                    ? "Only you can see this."
                    : "Anyone can view this."}
                </p>
              </div>
            </div>

            <div
              className={`w-10 h-5 rounded-full relative transition-colors ${
                !isPublic ? "bg-red-500" : "bg-green-500"
              }`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                  !isPublic ? "left-6" : "left-1"
                }`}
              />
            </div>
          </div>
        )}

        {/* Video Thumbnail Update */}
        {type === "video" && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Update Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              disabled={isSubmitting}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#333] file:text-white hover:file:bg-[#444] cursor-pointer border border-gray-700 rounded-lg bg-[#121212]"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-lg shadow-green-900/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}{" "}
            Update
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

const SettingsModal = ({ user, onClose, onSave }) => {
  const [activeSettingTab, setActiveSettingTab] = useState("profile");
  const [formData, setFormData] = useState({
    fullname: user.fullname || "",
    email: user.email || "",
    oldPassword: "",
    newPassword: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatarFile: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveWrapper = async () => {
    if (isSaving) return;
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This action is irreversible!")) return;
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await fetchData(
        "DELETE",
        "http://localhost:5000/api/v1/users/delete-account"
      );
      localStorage.clear();
      window.location.href = "/auth";
    } catch (error) {
      alert("Failed to delete account.");
    }
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col md:flex-row h-[500px] animate-in zoom-in-95">
        <div className="w-full md:w-1/3 bg-[#161616] border-b md:border-b-0 md:border-r border-gray-700 p-6 flex flex-col gap-2">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Settings size={20} /> Settings
          </h3>
          <button
            onClick={() => setActiveSettingTab("profile")}
            className={`p-3 text-left rounded-lg text-sm font-semibold transition flex items-center gap-3 ${
              activeSettingTab === "profile"
                ? "bg-blue-600/10 text-blue-400"
                : "text-gray-400 hover:bg-[#252525] hover:text-white"
            }`}
          >
            <Users size={18} /> Profile
          </button>
          <button
            onClick={() => setActiveSettingTab("password")}
            className={`p-3 text-left rounded-lg text-sm font-semibold transition flex items-center gap-3 ${
              activeSettingTab === "password"
                ? "bg-blue-600/10 text-blue-400"
                : "text-gray-400 hover:bg-[#252525] hover:text-white"
            }`}
          >
            <Lock size={18} /> Security
          </button>
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-3 text-left rounded-lg text-sm font-semibold text-gray-500 hover:text-white hover:bg-[#252525] transition mt-auto disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <div className="w-full md:w-2/3 p-8 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {activeSettingTab === "profile" && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full border-4 border-[#252525] object-cover"
                    />
                    <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg hover:bg-blue-500 cursor-pointer transition transform hover:scale-110">
                      <Camera size={16} />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        disabled={isSaving}
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">
                      {user.username}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      Update your personal details
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}
            {activeSettingTab === "password" && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h4 className="text-white font-bold text-lg mb-4">
                  Change Password
                </h4>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Old Password
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    placeholder="••••••••"
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="••••••••"
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="pt-6 border-t border-gray-700 flex justify-between items-center">
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-400 text-sm font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <AlertTriangle size={16} />
              )}{" "}
              Delete Account
            </button>
            <button
              onClick={handleSaveWrapper}
              disabled={isSaving}
              className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save
              Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. ROW COMPONENTS
// ==========================================

const VideoManagerRow = ({ video, onDelete, onEdit }) => (
  <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#1a1a1a] p-4 border-b border-gray-800 hover:bg-[#202020] transition-all gap-4">
    <div className="flex gap-4 w-full sm:w-auto overflow-hidden">
      <div className="relative w-40 aspect-video shrink-0 rounded-lg overflow-hidden border border-gray-700 group-hover:border-gray-500 transition">
        <img
          src={
            video.thumbnail ||
            `https://placehold.co/400x225/111/475569?text=${encodeURIComponent(
              video.title
            )}`
          }
          alt={video.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-[10px] px-1.5 py-0.5 rounded text-white font-medium">
          {Math.floor(video.duration / 60)}:
          {Math.floor(video.duration % 60)
            .toString()
            .padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <h4 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-blue-400 transition">
          {video.title}
        </h4>
        <p className="text-xs text-gray-500 line-clamp-1 mt-1">
          {video.discription || "No description provided."}
        </p>
        <div className="flex gap-2 mt-2.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
              video.isPublish
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
            }`}
          >
            {video.isPublish ? <Globe size={10} /> : <Lock size={10} />}{" "}
            {video.isPublish ? "Public" : "Private"}
          </span>
          <span className="text-gray-600 text-[10px] pt-0.5">
            {new Date(video.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-center">
        <span className="block text-sm font-bold text-white">
          {video.viewsCount || 0}
        </span>
        <span className="text-[10px] text-gray-500">Views</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(video, "video")}
          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(video._id, "video")}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

const TweetManagerRow = ({ tweet, onDelete, onEdit }) => (
  <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#1a1a1a] p-5 border-b border-gray-800 hover:bg-[#202020] transition-colors gap-4">
    <div className="flex-1">
      <p className="text-gray-200 text-sm mb-2 leading-relaxed">
        {tweet.content}
      </p>
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <FileText size={12} /> Posted{" "}
        {new Date(tweet.createdAt).toLocaleDateString()}
      </span>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1 text-gray-400 text-xs font-bold bg-[#121212] px-3 py-1 rounded-full border border-gray-800">
        <ThumbsUp size={12} /> {tweet.likes || 0}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(tweet, "tweet")}
          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(tweet._id, "tweet")}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

const PlaylistManagerRow = ({ playlist, onDelete, onEdit }) => (
  <div className="group flex items-center justify-between bg-[#1a1a1a] p-4 border-b border-gray-800 hover:bg-[#202020] transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-[#252525] rounded-lg flex items-center justify-center text-gray-500 border border-gray-700 group-hover:border-gray-500 group-hover:text-white transition shadow-sm">
        <List size={28} />
      </div>
      <div>
        <h4 className="text-white font-bold text-sm group-hover:text-blue-400 transition">
          {playlist.name}
        </h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-md">
          {playlist.description || playlist.discription || "No description"}
        </p>
        <div className="flex gap-2 mt-1">
          <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
            {playlist.videos?.length || 0} Videos
          </span>
          {/* Robust Check: Handles isPrivate(frontend) OR isprivate(backend) */}
          {(playlist.isPrivate || playlist.isprivate) && (
            <span className="text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded flex items-center gap-1">
              <Lock size={8} /> Private
            </span>
          )}
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => onEdit(playlist, "playlist")}
        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition"
      >
        <Edit2 size={16} />
      </button>
      <button
        onClick={() => onDelete(playlist._id, "playlist")}
        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

const WatchHistoryRow = ({ video }) => {
  let ownerName = "Unknown";
  let ownerAvatar = `https://ui-avatars.com/api/?name=${ownerName}`;
  let channelLink = "#";

  if (video.owner) {
    let ownerData = video.owner;
    if (Array.isArray(video.owner) && video.owner.length > 0)
      ownerData = video.owner[0];
    if (ownerData.username) {
      ownerName = ownerData.username;
      ownerAvatar = ownerData.avatar || ownerAvatar;
      channelLink = `channel/${ownerData.username}`;
    }
  }

  return (
    <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#1a1a1a] p-4 border-b border-gray-800 hover:bg-[#202020] transition-all gap-4">
      <div className="flex gap-4 w-full sm:w-auto overflow-hidden">
        <Link
          to={`/videos/watch/${video._id}`}
          className="relative w-40 aspect-video shrink-0 rounded-lg overflow-hidden border border-gray-700 group-hover:border-gray-500 transition"
        >
          <img
            src={
              video.thumbnail ||
              `https://placehold.co/400x225/111/475569?text=${encodeURIComponent(
                video.title
              )}`
            }
            alt={video.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-[10px] px-1.5 py-0.5 rounded text-white font-medium">
            {Math.floor(video.duration / 60)}:
            {Math.floor(video.duration % 60)
              .toString()
              .padStart(2, "0")}
          </span>
        </Link>
        <div className="flex flex-col justify-center min-w-0">
          <h4 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-blue-400 transition">
            <Link to={`/videos/watch/${video._id}`}>{video.title}</Link>
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <Link
              to={channelLink}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src={ownerAvatar}
                alt={ownerName}
                className="w-5 h-5 rounded-full object-cover border border-gray-700"
              />
              <span className="text-xs text-gray-400 hover:text-white transition-colors">
                {ownerName}
              </span>
            </Link>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="text-gray-600 text-[10px] flex items-center gap-1">
              <History size={10} /> Watched Recently
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-80 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl bg-[#1a1a1a]/50">
    <div className="w-16 h-16 bg-[#252525] rounded-full flex items-center justify-center mb-4">
      <Upload size={24} className="opacity-50" />
    </div>
    <p className="text-lg font-medium text-gray-400">{message}</p>
    <p className="text-sm mt-2 opacity-60">Upload content to get started.</p>
  </div>
);

// ==========================================
// 4. MAIN PAGE
// ==========================================

const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const currentUser = useSelector((state) => state.auth.userData);
  const [mostView, setMostView] = useState(0);
  const coverInputRef = useRef(null);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  const [subscribersCount, setSubscribersCount] = useState(0);
  const [videoLikeCount, setVideoLikeCount] = useState(0);
  const [myVideos, setMyVideos] = useState([]);
  const [myTweets, setMyTweets] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("videos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState("video");

  const refreshData = async () => {
    try {
      setUser(currentUser);
      const [videoRes, tweetRes, playlistRes, historyRes, subsCountRes] =
        await Promise.allSettled([
          fetchData(
            "GET",
            "http://localhost:5000/api/v1/Videos/get-user-video-list"
          ),
          fetchData(
            "GET",
            "http://localhost:5000/api/v1/tweets/get-user-tweet-list"
          ),
          fetchData(
            "GET",
            `http://localhost:5000/api/v1/playlist/user/${currentUser._id}`
          ),
          fetchData("GET", "http://localhost:5000/api/v1/users/history"),
          fetchData(
            "GET",
            "http://localhost:5000/api/v1/users/subscribers/count"
          ),
        ]);

      let views = 0;
      if (videoRes.status === "fulfilled" && videoRes.value.Data) {
        setMyVideos(videoRes.value.Data);
        videoRes.value.Data.forEach((val) => (views += val.viewsCount || 0));
      }
      setMostView(views);

      if (tweetRes.status === "fulfilled" && tweetRes.value.Data)
        setMyTweets(tweetRes.value.Data);

      // Robust Playlist Handling
      if (playlistRes.status === "fulfilled" && playlistRes.value.Data) {
        // Check if it's nested in { playlists: [...] } or direct [...]
        const plData =
          playlistRes.value.Data.playlists || playlistRes.value.Data;
        if (Array.isArray(plData)) setMyPlaylists(plData);
      }

      if (historyRes.status === "fulfilled" && historyRes.value?.Data) {
        const data = historyRes.value.Data;
        if (data.watchHistory && Array.isArray(data.watchHistory))
          setWatchHistory(data.watchHistory);
        else if (
          Array.isArray(data) &&
          data.length > 0 &&
          data[0]?.watchHistory
        )
          setWatchHistory(data[0].watchHistory);
        else if (Array.isArray(data)) setWatchHistory(data);
        else setWatchHistory([]);
      }

      if (subsCountRes.status === "fulfilled" && subsCountRes.value.Data)
        setSubscribersCount(subsCountRes.value.Data);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        await refreshData();
      } catch (e) {
        if (e.message === "UNAUTHORIZED") {
          navigate("/auth");
          setError("Login required");
        } else {
          console.error(e);
          setError("Load failed");
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      let endpoint = "";
      if (type === "video")
        endpoint = `http://localhost:5000/api/v1/Videos/delete/${id}`;
      if (type === "tweet")
        endpoint = `http://localhost:5000/api/v1/tweets/${id}`;
      if (type === "playlist")
        endpoint = `http://localhost:5000/api/v1/playlist/${id}`;
      await fetchData("DELETE", endpoint);

      if (type === "video")
        setMyVideos((prev) => prev.filter((i) => i._id !== id));
      if (type === "tweet")
        setMyTweets((prev) => prev.filter((i) => i._id !== id));
      if (type === "playlist")
        setMyPlaylists((prev) => prev.filter((i) => i._id !== id));
    } catch (error) {
      alert("Delete failed");
    }
  };

  const handleUpdateItem = async (id, data, type) => {
    try {
      let endpoint = "";
      if (type === "video")
        endpoint = `http://localhost:5000/api/v1/Videos/updatefields/${id}`;
      else if (type === "tweet")
        endpoint = `http://localhost:5000/api/v1/tweets/update/${id}`;
      else endpoint = `http://localhost:5000/api/v1/playlist/edit/${id}`;

      await fetchData("PATCH", endpoint, data);
      await refreshData();
      alert("Updated Successfully");
    } catch (e) {
      console.error(e);
      alert("Update failed");
    }
  };

  const handleUploadItem = async (formData, type) => {
    try {
      let endpoint = "";
      if (type === "video")
        endpoint = "http://localhost:5000/api/v1/Videos/upload";
      else if (type === "tweet")
        endpoint = "http://localhost:5000/api/v1/tweets/create";
      await fetchData("POST", endpoint, formData);
      await refreshData();
      alert("Upload Successful!");
    } catch (e) {
      console.error(e);
      alert(`Upload Failed: ${e.message}`);
    }
  };

  const handleSaveSettings = async (data) => {
    let profileUpdated = false;
    let passwordUpdated = false;

    try {
      if (
        data.fullname !== user.fullname ||
        data.email !== user.email ||
        data.avatarFile
      ) {
        if (data.fullname !== user.fullname || data.email !== user.email) {
          await fetchData(
            "PATCH",
            "http://localhost:5000/api/v1/users/update-account",
            { fullname: data.fullname, email: data.email }
          );
        }
        if (data.avatarFile) {
          const avatarData = new FormData();
          avatarData.append("avatar", data.avatarFile);
          const avRes = await fetchData(
            "PATCH",
            "http://localhost:5000/api/v1/users/avatar",
            avatarData
          );
          if (avRes?.Data) dispatch(Login(avRes.Data));
        }
        profileUpdated = true;
      }
    } catch (e) {
      console.error("Profile update failed:", e);
      alert("Failed to update profile.");
      return;
    }

    if (data.oldPassword && data.newPassword) {
      try {
        await fetchData(
          "POST",
          "http://localhost:5000/api/v1/users/change-password",
          { oldPassword: data.oldPassword, newPassword: data.newPassword }
        );
        passwordUpdated = true;
      } catch (e) {
        console.error("Password change failed:", e);
        alert("Failed to change password. Please check your old password.");
        return;
      }
    }

    if (profileUpdated || passwordUpdated) {
      await refreshData();
      setShowSettings(false);
      if (passwordUpdated) alert("Password changed successfully!");
      else alert("Profile updated successfully!");
    } else {
      setShowSettings(false);
    }
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || isCoverUploading) return;
    setIsCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append("coverImage", file);
      const res = await fetchData(
        "PATCH",
        "http://localhost:5000/api/v1/users/cover-image",
        formData
      );
      if (res?.Data) {
        dispatch(Login(res.Data));
        setUser(res.Data);
        alert("Cover Image Updated!");
      }
    } catch (error) {
      console.error("Cover image update failed", error);
      alert("Failed to update cover image");
    } finally {
      setIsCoverUploading(false);
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    setEditType(type);
    setShowEdit(true);
  };

  const handleLogout = async () => {
    try {
      await fetchData("POST", "http://localhost:5000/api/v1/users/logout");
      localStorage.clear();
      window.location.href = "/auth";
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#121212] text-white flex justify-center items-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-400 font-medium tracking-wide">
            LOADING DASHBOARD...
          </p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-center items-center gap-4">
        <p className="text-xl text-red-400">{error}</p>
        <button
          onClick={() => navigate("/auth")}
          className="bg-blue-600 px-6 py-2 rounded-full font-bold"
        >
          Login
        </button>
      </div>
    );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans relative pb-20">
      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}
      {showUpload && (
        <UploadModal
          type={activeTab === "tweets" ? "tweet" : "video"}
          onClose={() => setShowUpload(false)}
          onUpload={handleUploadItem}
        />
      )}
      {showEdit && editingItem && (
        <EditModal
          item={editingItem}
          type={editType}
          onClose={() => setShowEdit(false)}
          onUpdate={handleUpdateItem}
        />
      )}

      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-gray-800 to-gray-900 group">
        {user.coverimage ? (
          <img
            src={user.coverimage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <ImageIcon size={48} className="opacity-20" />
          </div>
        )}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={isCoverUploading}
            className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium flex items-center gap-2 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isCoverUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera size={16} />
            )}{" "}
            {isCoverUploading ? "Updating..." : "Edit Cover"}
          </button>
          <input
            type="file"
            ref={coverInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              handleCoverImageChange(e);
              e.target.value = null;
            }}
          />
        </div>
      </div>

      <div className="bg-[#1a1a1a] border-b border-gray-800 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 -mt-10 mb-6">
            <div className="flex items-end gap-6">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition blur-sm"></div>
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="relative w-28 h-28 rounded-full border-4 border-[#1a1a1a] object-cover bg-[#1a1a1a]"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-20">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="bg-black/60 p-2 rounded-full text-white"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {user.fullname}
                </h1>
                <p className="text-sm text-gray-400 font-medium">
                  @{user.username}
                </p>
                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto mb-2">
              <button
                onClick={() => setShowUpload(true)}
                className="flex-1 md:flex-none bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-full font-bold shadow-lg shadow-white/10 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Create
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-[#2a2a2a] hover:bg-[#333] text-white px-4 py-2.5 rounded-full font-bold border border-gray-700 transition flex items-center justify-center"
                title="Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="bg-[#2a2a2a] hover:bg-red-900/30 text-red-400 hover:text-red-300 px-4 py-2.5 rounded-full font-bold border border-gray-700 hover:border-red-800 transition flex items-center justify-center"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <StatsCard
              icon={Eye}
              label="Total Views"
              value={mostView.toLocaleString()}
              color="bg-blue-500/20 text-blue-400 border-blue-500/30"
            />
            <div
              onClick={() => navigate(`/account/subscriptions/${user._id}`)}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            >
              <StatsCard
                icon={Users}
                label="Subscribers"
                value={subscribersFormate(subscribersCount)}
                color="bg-purple-500/20 text-purple-400 border-purple-500/30"
              />
            </div>
            <StatsCard
              icon={Video}
              label="Videos"
              value={myVideos.length}
              color="bg-green-500/20 text-green-400 border-green-500/30"
            />
            <StatsCard
              icon={ThumbsUp}
              label="Total Likes"
              value={videoLikeCount}
              color="bg-pink-500/20 text-pink-400 border-pink-500/30"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto mt-8 border-b border-gray-800">
            <TabButton
              active={activeTab === "videos"}
              label="Videos"
              icon={Video}
              onClick={() => setActiveTab("videos")}
            />
            <TabButton
              active={activeTab === "tweets"}
              label="Posts"
              icon={FileText}
              onClick={() => setActiveTab("tweets")}
            />
            <TabButton
              active={activeTab === "playlists"}
              label="Playlists"
              icon={List}
              onClick={() => setActiveTab("playlists")}
            />
            <TabButton
              active={activeTab === "history"}
              label="History"
              icon={History}
              onClick={() => setActiveTab("history")}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden shadow-2xl min-h-[500px]">
          <div className="bg-[#202020] p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              {activeTab === "videos" && (
                <>
                  <Video size={16} /> Video Content
                </>
              )}
              {activeTab === "tweets" && (
                <>
                  <FileText size={16} /> Community Posts
                </>
              )}
              {activeTab === "playlists" && (
                <>
                  <List size={16} /> Collections
                </>
              )}
              {activeTab === "history" && (
                <>
                  <History size={16} /> Watch History
                </>
              )}
            </h3>
          </div>
          <div>
            {activeTab === "videos" &&
              (myVideos.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {myVideos.map((video) => (
                    <VideoManagerRow
                      key={video._id}
                      video={video}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="No videos uploaded yet" />
              ))}
            {activeTab === "tweets" &&
              (myTweets.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {myTweets.map((tweet) => (
                    <TweetManagerRow
                      key={tweet._id}
                      tweet={tweet}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="No posts created yet" />
              ))}
            {activeTab === "playlists" &&
              (myPlaylists.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {myPlaylists.map((playlist) => (
                    <PlaylistManagerRow
                      key={playlist._id}
                      playlist={playlist}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="No playlists created" />
              ))}
            {activeTab === "history" &&
              (watchHistory.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {watchHistory.map((video) => (
                    <WatchHistoryRow key={video._id} video={video} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No watch history found" />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;

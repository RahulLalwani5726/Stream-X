import { useState, useEffect } from "react";
import fetchData from "../apiClient";
import { X, Plus, Lock, Globe, Check, Save, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const PlaylistModal = ({ onClose, videoId, userData }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Track initial state
  const [initialSelectedIds, setInitialSelectedIds] = useState(new Set());

  // New Playlist Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const currentUser = useSelector((state) => state.auth.userData); 
  // 1. Fetch User's Playlists
  useEffect(() => {
    const fetchUserPlaylists = async () => {
      try {
        setLoading(true);
        const res = await fetchData("GET", `https://stream-x.onrender.com/api/v1/playlist`);
        
        if (res?.Data) {
            // Handle Data structure based on your previous messages
            const fetchedPlaylists = Array.isArray(res.Data) && res.Data[0]?.playlists 
                ? res.Data[0].playlists 
                : (Array.isArray(res.Data) ? res.Data : []);

            setPlaylists(fetchedPlaylists);

            // Store initially selected playlist IDs
            const initialSet = new Set();
            fetchedPlaylists.forEach(pl => {
                const isPresent = pl.videos.some(vid => (typeof vid === 'object' ? vid._id === videoId : vid === videoId));
                if (isPresent) initialSet.add(pl._id);
            });
            setInitialSelectedIds(initialSet);
        }
      } catch (error) {
        console.error("Error fetching playlists", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?._id) fetchUserPlaylists();
  }, [userData, videoId]);

  // 2. Handle Checkbox Click
  const handleTogglePlaylist = (playlistId) => {
    setPlaylists(prev => prev.map(pl => {
        if (pl._id === playlistId) {
            const isPresent = pl.videos.some(vid => (typeof vid === 'object' ? vid._id === videoId : vid === videoId));
            let newVideos;
            if (isPresent) {
                newVideos = pl.videos.filter(vid => (typeof vid === 'object' ? vid._id !== videoId : vid !== videoId));
            } else {
                newVideos = [...pl.videos, videoId]; 
            }
            return { ...pl, videos: newVideos };
        }
        return pl;
    }));
  };

  // 3. Handle Save
  const handleSave = async () => {
      try {
          setIsSaving(true);
          const promises = [];

          playlists.forEach(playlist => {
              const isCurrentlySelected = playlist.videos.some(vid => (typeof vid === 'object' ? vid._id === videoId : vid === videoId));
              const wasInitiallySelected = initialSelectedIds.has(playlist._id);

              // Add logic
              if (isCurrentlySelected && !wasInitiallySelected) {
                  promises.push(
                      fetchData("PATCH", `https://stream-x.onrender.com/api/v1/playlist/add/${playlist._id}/${videoId}`)
                  );
              }

              // Remove logic
              if (!isCurrentlySelected && wasInitiallySelected) {
                  promises.push(
                      fetchData("PATCH", `https://stream-x.onrender.com/api/v1/playlist/remove/${playlist._id}/${videoId}`)
                  );
              }
          });

          await Promise.all(promises);
          onClose(); 

      } catch (error) {
          console.error("Error saving playlist changes", error);
          alert("Something went wrong while saving.");
      } finally {
          setIsSaving(false);
      }
  };

  // 4. Create New Playlist Handler
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
        const res = await fetchData("POST", "https://stream-x.onrender.com/api/v1/playlist/create", {
            name: newPlaylistName,
            isPrivate: isPrivate,
        });
        
        // Handle different possible response structures
        const createdPlaylist = res?.Data;

        if(createdPlaylist) {
             // Create & Add immediately
             await fetchData("PATCH", `https://stream-x.onrender.com/api/v1/playlist/add/${createdPlaylist._id}/${videoId}`);

             const newPlaylistObj = { ...createdPlaylist, videos: [videoId] };
             setPlaylists(prev => [...prev, newPlaylistObj]);
             setInitialSelectedIds(prev => new Set(prev).add(createdPlaylist._id));
             
             setNewPlaylistName("");
             setShowCreateForm(false);
        }
    } catch (error) {
        console.error("Error creating playlist", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] w-full max-w-sm rounded-xl shadow-2xl border border-gray-800 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#1e1e1e] shrink-0">
          <h3 className="text-white font-semibold text-lg">Save to playlist</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* Playlist List Area */}
        <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex-grow min-h-[150px]">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                    <p className="text-gray-500 text-sm">Loading playlists...</p>
                </div>
            ) : playlists.length === 0 && !showCreateForm ? (
                <div className="text-center text-gray-500 py-10">
                    <p>No playlists found.</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {playlists.map((playlist) => {
                        const isPresent = playlist.videos.some(vid => (typeof vid === 'object' ? vid._id === videoId : vid === videoId));
                        if(playlist.ownerData._id !== currentUser._id) return null
                        return (
                            <label key={playlist._id} className="group flex items-center gap-3 p-3 hover:bg-[#2a2a2a] rounded-lg cursor-pointer transition select-none">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        checked={isPresent}
                                        onChange={() => handleTogglePlaylist(playlist._id)}
                                        className="peer sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                        isPresent 
                                        ? "bg-blue-600 border-blue-600" 
                                        : "border-gray-500 group-hover:border-gray-400"
                                    }`}>
                                        <Check size={14} className={`text-white transition-transform ${isPresent ? "scale-100" : "scale-0"}`} />
                                    </div>
                                </div>
                                <span className="text-gray-200 text-sm font-medium truncate flex-1 group-hover:text-white transition-colors">{playlist.name}</span>
                                {playlist.isprivate ? (
                                    <Lock size={14} className="text-gray-500" />
                                ) : (
                                    <Globe size={14} className="text-gray-600" />
                                )}
                            </label>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Footer: Create Form OR Action Buttons */}
        <div className="border-t border-gray-800 bg-[#1e1e1e] shrink-0">
            {!showCreateForm ? (
                <div>
                     {/* Create New Trigger */}
                    <button 
                        onClick={() => setShowCreateForm(true)}
                        className="w-full p-4 flex items-center gap-3 cursor-pointer hover:bg-[#2a2a2a] transition text-left group"
                    >
                        <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-gray-700 transition">
                            <Plus size={20} className="text-white" />
                        </div>
                        <span className="text-white font-medium">Create new playlist</span>
                    </button>

                     {/* Action Buttons */}
                     <div className="p-4 flex justify-end gap-3 pt-2">
                        <button 
                            onClick={onClose}
                            className="text-gray-300 hover:text-white font-medium text-sm px-4 py-2 hover:bg-gray-800 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full font-bold text-sm transition shadow-lg flex items-center gap-2"
                        >
                            {isSaving && <Loader2 size={14} className="animate-spin" />}
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                // Create Form
                <form onSubmit={handleCreatePlaylist} className="p-4 flex flex-col gap-4 animate-in slide-in-from-bottom-5">
                    <div>
                        <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Name</label>
                        <input 
                            type="text" 
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="Enter playlist name..." 
                            className="w-full bg-[#121212] border border-gray-700 focus:border-blue-500 rounded-lg outline-none text-white text-sm px-3 py-2.5 transition"
                            autoFocus
                        />
                        <div className="flex justify-end mt-1">
                             <span className={`text-[10px] ${newPlaylistName.length > 0 ? "text-blue-500" : "text-gray-600"}`}>
                                {newPlaylistName.length}/150
                             </span>
                        </div>
                    </div>
                    
                    <div>
                         <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase tracking-wider">Privacy</label>
                         <div className="flex bg-[#121212] p-1 rounded-lg border border-gray-700">
                             <button
                                type="button"
                                onClick={() => setIsPrivate(false)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition ${!isPrivate ? "bg-gray-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                             >
                                <Globe size={14} /> Public
                             </button>
                             <button
                                type="button"
                                onClick={() => setIsPrivate(true)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition ${isPrivate ? "bg-gray-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                             >
                                <Lock size={14} /> Private
                             </button>
                         </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-2">
                         <button 
                            type="button"
                            onClick={() => setShowCreateForm(false)}
                            className="text-gray-400 hover:text-white font-medium text-sm px-3 py-2 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={!newPlaylistName.trim()}
                            className="text-blue-500 font-bold text-sm px-4 py-2 hover:bg-blue-500/10 rounded-lg transition disabled:text-gray-600 disabled:hover:bg-transparent"
                        >
                            Create
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
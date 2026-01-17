import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import {
  Videos,
  Tweets,
  Playlists,
  Account,
  Home,
  WatchPage,
  AuthPage,
  SubscribersPage,
  ChannelPage,
  PlaylistView,
  SearchPage,
} from "./pages/Pages.js";
import "./index.css";
import { Provider } from "react-redux";
import App from "./App.jsx";
import store from "./store/store.js";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<Home />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/videos" element={<Videos />} />
      <Route path="/videos/watch/:videoId" element={<WatchPage />} />
      <Route path="/tweets" element={<Tweets />} />
      <Route path="/playlist" element={<Playlists />} />
      <Route
        path="/playlist/view/:playlistId"
        element={<PlaylistView />}
      />
      <Route path="/account" element={<Account />} />
      <Route
        path="/account/subscriptions/:userId"
        element={<SubscribersPage />}
      />
      <Route path="/account/channel/:username" element={<ChannelPage />} />
      <Route path="/auth" element={<AuthPage />} />
    </Route>
  )
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);

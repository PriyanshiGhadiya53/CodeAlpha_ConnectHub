
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { StrictMode } from "react";

import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import PostDetails from "./pages/PostDetails.jsx";
import Profile from "./pages/Profile.jsx";
import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore.jsx";
import Messages from "./pages/Messages.jsx";
import Bookmarks from "./pages/Bookmarks.jsx";
import ResetPassword from "./pages/ResetPassword";
import LogoutButton from "./components/LogoutButton.jsx";

import "./index.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Shared layout: Navbar + page + MobileBottomNav */}
      <Route element={<App />}>
        <Route path="/" element={<Home />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/post/:postId" element={<PostDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userName" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
      </Route>

      {/* Authentication pages: without main navigation */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="bottom-center" />
  </StrictMode>
);
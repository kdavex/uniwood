import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import Providers from "./providers";

// Routes
import Root, { loader as rootLoader } from "./routes/Root.tsx";
import Home from "./routes/Home.tsx";
import Message from "./routes/Messsage.tsx";
import Notification from "./routes/Notification.tsx";
import Profile from "./routes/Profile.tsx";
import Login from "./routes/Login.tsx"; // loader as loginLoader, // action as loginAction,
import Search from "./routes/Search.tsx";
import Test from "./routes/Test.tsx";

// Api
import { usersAction, usersLoader } from "./api/users.ts";
import { postsAction, postsLoader } from "./api/posts.ts";
import { loginAction } from "./api/login.ts";
import { profileLoader } from "./api/loaders/profile.ts";
import { loader as messageLoader } from "./api/loaders/message.ts";
import { loader as videoCallLoader } from "./api/loaders/videoCall.ts";

// Misc
import "./styles.scss";
import { profileAction } from "./api/actions/profile.ts";

import Post from "./routes/Post.tsx";
import Test2 from "./routes/Test2.tsx";
import Landing from "./routes/Landing.tsx";
import UniVault from "./routes/UniVault.tsx";
import VideoCall from "./routes/VideoCall.tsx";
import { Test3 } from "./routes/Test3.tsx";

const router = createBrowserRouter([
  {
    path: "/test",
    element: <Test />,
  },
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    children: [
      {
        path: "/univault",
        element: <UniVault />,
      },
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/profile/:usernameOrId",
        element: <Profile />,
        loader: profileLoader,
        action: profileAction,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/post/:postId",
        element: <Post />,
      },
      {
        path: "/notification",
        element: <Notification />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
    action: loginAction,
    loader: postsLoader,
  },
  {
    path: "/users",
    action: usersAction,
    loader: usersLoader,
  },
  {
    path: "/posts",
    action: postsAction,
  },
  {
    path: "/message",
    element: <Message />,
    loader: messageLoader,
  },
  {
    path: "/message/:converseId",
    element: <Message />,
    loader: messageLoader,
  },
  {
    path: "/message/new/:recipientId",
    element: <Message />,
    loader: messageLoader,
  },

  {
    path: "/test2",
    element: <Test2 />,
  },
  {
    path: "/welcome",
    element: <Landing />,
  },
  {
    path: "/videoCall/:recipientId",
    element: <VideoCall />,
    loader: videoCallLoader,
  },
  {
    path: "test3",
    element: <Test3 />,
  },
]);

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <Providers>
    <RouterProvider router={router} />
  </Providers>,
);

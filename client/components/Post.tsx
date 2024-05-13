import {
  FavoriteRounded,
  ChatRounded,
  FavoriteBorderRounded,
  ChatBubbleOutlineRounded,
  CloseRounded,
  SendRounded,
  DeleteRounded,
  EditRounded,
  PriorityHighRounded,
} from "@mui/icons-material";
import {
  Paper,
  Avatar,
  Typography,
  Button,
  Box,
  MenuItem,
  useTheme,
  Modal,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import React, {
  Dispatch,
  MouseEvent,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { dateWhenFormat } from "../utils/dateTools";
import { UserInfoContext } from "../providers/UserInfoProvider";
import axiosClient from "../utils/axios";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PostContextProps } from "../types/providers";
import { PostEditor } from "./PostEditor";
import { TokenContext } from "../providers/TokenProvider";
import { AlertContext } from "../providers/AlertProvider";

export const PostContext = createContext<PostContextProps | null>(null);

export default function Post({ postParam }: { postParam: Post }) {
  const [post, setPost] = useState<Post | null>(null);
  const [textVisible, setTextVisibility] = useState<boolean>(false);
  const initializeContextData = () => {
    setPost(postParam);
  };
  const navigate = useNavigate();
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [postEditor, setPostEditor] = useState(false);
  const location = useLocation();

  const postNotFromUser = post?.author.id !== localStorage.getItem("id");

  const navigateToProfile = () => {
    if (!post) return;
    if (postNotFromUser) navigate(`/profile/${post.author.id}`);
  };

  const loading = post === null;
  const openDeleteAlert = () => {
    setDeleteAlert(true);
  };
  const openPostEditor = () => {
    setPostEditor(true);
  };

  useEffect(() => {
    initializeContextData();
  }, [postParam]);

  return loading ? (
    <></>
  ) : (
    <PostContext.Provider value={{ post, setPost }}>
      <Paper className="post">
        <div className="flex gap-3">
          <Avatar
            className="size-[50px] border-[3px]  border-solid border-primary-400"
            src={`${process.env.SERVER_PUBLIC}/${post.author.pfp}`}
          />
          <div className={`post-detail`}>
            <p
              className={` font-body text-base font-bold text-slate-800 ${postNotFromUser ? "hover:cursor-pointer hover:underline" : ""}`}
              onClick={navigateToProfile}
            >
              {post.author.fullname}
            </p>
            <Typography variant="subtitle2" sx={{ color: "#536471" }}>
              {dateWhenFormat(new Date(post.createdAt))}
            </Typography>
          </div>
          {location.pathname.includes("/profile/") && (
            <div className="ml-auto self-start rounded-full bg-primary-50 px-3 py-1">
              <Tooltip title="Edit Post">
                <IconButton onClick={openPostEditor}>
                  <EditRounded className="text-secondary-400" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete Post">
                <IconButton onClick={openDeleteAlert}>
                  <DeleteRounded className="text-red-600" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>
        <div className="line line__1"></div>
        <Typography className="my-2 font-bold" variant="h5">
          {post.title}
        </Typography>
        {post.context.length < 200 ? (
          <>
            <Typography variant="body1">{post.context}</Typography>
            <Tags tags={post.tags} />
          </>
        ) : (
          <>
            <Typography variant="body1">
              {textVisible ? post.context : post.context.slice(0, 200) + "..."}
              <Button
                className="normal-case text-blue-400 hover:cursor-pointer hover:text-blue-700 hover:underline"
                variant="text"
                color="secondary"
                onClick={() => setTextVisibility(!textVisible)}
              >
                {textVisible ? "Show Less" : "Show More"}
              </Button>
            </Typography>
            <Tags tags={post.tags} />
          </>
        )}
        <ImageList medias={post.media} />
        <PostActions />
      </Paper>
      {deleteAlert && (
        <PostDeleteAlert
          dialogOpen={deleteAlert}
          setDialogOpen={setDeleteAlert}
        />
      )}
      {postEditor && (
        <PostEditor
          postModalView={postEditor}
          setPostModalView={setPostEditor}
          post={post}
          setPost={setPost}
        />
      )}
    </PostContext.Provider>
  );
}
function ImageList({
  medias,
}: {
  medias: { filename: string; caption?: string }[];
}) {
  let gridCols = "";
  let gridRows = "";
  let gridBluePrint: { gridCol: string; gridRow: string }[] = [{}] as {
    gridCol: string;
    gridRow: string;
  }[];

  switch (medias.length) {
    case 1:
      gridCols = "1fr";
      gridRows = "1fr";
      gridBluePrint[0] = { gridCol: "1", gridRow: "1" };
      break;
    case 2:
      gridCols = "1fr";
      gridRows = "1fr 1fr";
      gridBluePrint[0] = { gridCol: "1/2", gridRow: "1/2" };
      gridBluePrint[1] = { gridCol: "1/2", gridRow: "2/3" };
      break;
    case 3:
      gridCols = "1fr 1fr";
      gridCols = "1fr 1fr";
      gridBluePrint[0] = { gridCol: "1/1", gridRow: "1/1" };
      gridBluePrint[1] = { gridCol: "2/3", gridRow: "1/1" };
      gridBluePrint[2] = { gridCol: "1/3 ", gridRow: "2/2" };
      break;
    case 4:
      gridCols = "1fr 1fr";
      gridRows = "1fr 1fr";
      gridBluePrint[0] = { gridCol: "1/2", gridRow: "1/2" };
      gridBluePrint[1] = { gridCol: "2/3", gridRow: "1/2" };
      gridBluePrint[2] = { gridCol: "1/2", gridRow: "2/3" };
      gridBluePrint[3] = { gridCol: "2/3", gridRow: "2/3" };
      break;
    default:
      gridRows = "1fr 1fr";
      gridCols = "1fr 1fr 1fr 1fr 1fr 1fr";
      gridBluePrint[0] = { gridCol: "1/3", gridRow: "1/2" };
      gridBluePrint[1] = { gridCol: "3/5", gridRow: "1/2" };
      gridBluePrint[2] = { gridCol: "5/7", gridRow: "1/2" };
      gridBluePrint[3] = { gridCol: "1/4", gridRow: "2/3" };
      gridBluePrint[4] = { gridCol: "4/7", gridRow: "2/3" };
  }
  const mediaSet: JSX.Element[] = [];
  medias.forEach((media, index) => {
    if (media.filename.match(/\.(jpg|png|gif|png|heif|webp|bmp|avif)/)) {
      mediaSet.push(
        <img
          className=" image block h-full w-full object-cover"
          key={media.filename.slice(0, 15)}
          src={`${process.env.SERVER_PUBLIC}/${media.filename}`}
          style={{
            gridRow: gridBluePrint[index].gridRow,
            gridColumn: gridBluePrint[index].gridCol,
          }}
          alt="post"
        />,
      );
    } else {
      mediaSet.push(
        <video
          className="block h-full w-full border-2 border-solid border-slate-800 object-cover"
          key={media.filename.slice(0, 15)}
          style={{
            gridRow: gridBluePrint[index].gridRow,
            gridColumn: gridBluePrint[index].gridCol,
          }}
          src={`${process.env.SERVER_PUBLIC}/${media.filename}`}
          controls
        />,
      );
    }
  });
  return (
    <Box
      className="image-list flex-center grid items-center justify-center gap-[2px] overflow-hidden"
      sx={{
        gridTemplateRows: gridRows,
        gridTemplateColumns: gridCols,
      }}
    >
      {...mediaSet}
    </Box>
  );
}

function PostActions() {
  const { post } = useContext(PostContext)!;
  const theme = useTheme();
  const [fillHeart, setFillHeart] = useState(
    post?.liked_by_users_id.includes(
      (localStorage.getItem("id") as string) ?? false,
    ),
  );
  const [commentModalView, setCommentModalView] = useState(false);
  const [likeCountState, setLikeCountState] = useState(
    post?.liked_by_users_id.length ?? 0,
  );
  return (
    <>
      <div className="mt-4 flex items-center justify-between px-2">
        <MenuItem className="rounded-md">
          <FavoriteRounded className={`text-gray-400`} />
          <Typography
            className="ml-2"
            variant="subtitle2"
            color={theme.palette.text.secondary}
          >
            {likeCountState === 0 ? "" : likeCountState}
          </Typography>
        </MenuItem>
        <MenuItem className="rounded-md">
          <ChatRounded className={`text-gray-400`} />
          <Typography
            className={`ml-2`}
            variant="subtitle2"
            color={theme.palette.text.secondary}
          >
            {post?.comments.length === 0 ? "" : post?.comments.length}
          </Typography>
        </MenuItem>
      </div>
      <div className="my-2 w-full border-b-2 border-solid border-gray-300" />
      <div className="flex items-center justify-center gap-4">
        <MenuItem
          className="rounded-md"
          color="primary"
          onClick={() => {
            axiosClient.patch(
              "/posts/likeToggle",
              {
                postId: post?.id,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken",
                  )}`,
                },
              },
            );
            setLikeCountState(likeCountState + (fillHeart ? -1 : 1));
            setFillHeart(!fillHeart);
          }}
        >
          {fillHeart ? (
            <FavoriteRounded className="text-primary-300" />
          ) : (
            <FavoriteBorderRounded className="text-gray-600" />
          )}
          <Typography className="ml-2">Like</Typography>
        </MenuItem>
        <MenuItem
          className="rounded-md"
          onClick={() => setCommentModalView(!commentModalView)}
          color="primary"
        >
          <ChatBubbleOutlineRounded className="text-gray-600" />
          <Typography className="ml-2">Comment</Typography>
        </MenuItem>
        <CommentModal
          commentModalView={commentModalView}
          setCommentModalView={setCommentModalView}
        />
      </div>
    </>
  );
}

function CommentModal({
  commentModalView,
  setCommentModalView,
}: {
  setCommentModalView: React.Dispatch<React.SetStateAction<boolean>>;
  commentModalView: boolean;
}) {
  const { post, setPost } = useContext(PostContext)!;
  const commentRef = useRef<HTMLInputElement>(null);
  const [newComment, setNewComment] = useState<CommentProps[]>([]);
  const { userInfo } = useContext(UserInfoContext)!;
  const genId = useId();
  const [searchParams] = useSearchParams();
  const commentContainerRef = useRef<HTMLDivElement>(null);

  const clearCommentBox = () => {
    commentRef.current!.value = "";
  };
  const loading = userInfo === null;

  const hoistHighlightedComment = () => {
    const paramsCommentId = searchParams.get("commentId");
    if (!paramsCommentId || !post) return;

    const highlightedComment = post.comments.find(
      (comment) => paramsCommentId === comment.id,
    );

    if (!highlightedComment) return;

    post.comments = [
      highlightedComment,
      ...post.comments.filter((comment) => comment.id !== paramsCommentId),
    ];
    setPost(post);
  };

  useEffect(hoistHighlightedComment);

  return loading ? (
    <div>Loading...</div>
  ) : (
    <Modal
      open={commentModalView}
      onClose={() => setCommentModalView(!commentModalView)}
    >
      <div className="absolute left-1/2 top-1/2 flex max-h-[90%] w-[600px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-white shadow-md  2xl:min-h-[450px] ">
        <div className="header flex items-center justify-center bg-transparent py-5">
          <Typography variant="h4">{post?.author.fullname}'s Post</Typography>
          <MenuItem
            className="absolute right-3 rounded-[100%] p-2"
            onClick={() => setCommentModalView(!commentModalView)}
          >
            <CloseRounded className="text-gray-500" />
          </MenuItem>
        </div>
        <div
          className="h-full overflow-auto px-4 pb-[125px]"
          ref={commentContainerRef}
        >
          {newComment?.map((comment, index) => (
            <Comment highlight={false} key={index} comment={comment} />
          ))}
          {post?.comments.map((comment, index) => (
            <Comment
              highlight={
                searchParams.get("commentId") === comment.id ? true : false
              }
              key={index}
              comment={comment}
            />
          )) ?? (
            <Box className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"></Box>
          )}
        </div>
        <Paper
          className="fixed bottom-0 flex w-full gap-2 px-4 py-4"
          elevation={2}
        >
          <Avatar
            className="avatar"
            src={`${process.env.SERVER_PUBLIC}/${userInfo.pfp}`}
          />
          <form className="relative w-full">
            <TextField
              className="input"
              placeholder="Write a comment"
              multiline
              rows={2}
              sx={{
                "& .MuiInputBase-input::placeholder": {
                  color: "#838489",
                  opacity: 1,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "none",
                  },
                  "&:hover fieldset": {},
                  "&.Mui-focused fieldset": {
                    borderColor: "none",
                  },
                },
              }}
              inputProps={{ ref: commentRef }}
              fullWidth
              required
            />
            <IconButton
              type="submit"
              className="absolute bottom-2 right-2"
              onClick={(e) => {
                e.preventDefault();
                axiosClient.post(
                  "/comments",
                  {
                    comment: commentRef.current?.value,
                    postId: post?.id,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "accessToken",
                      )}`,
                    },
                  },
                );
                newComment.push({
                  author: {
                    id: userInfo.id,
                    fullname: userInfo.fullname,
                    affiliation: userInfo.affiliation,
                    pfp: userInfo.pfp,
                    cover: userInfo.cover,
                    address: userInfo.address,
                    username: userInfo.username,
                    bio: userInfo.bio,
                  },
                  id: genId,
                  content: commentRef.current?.value ?? "",
                  createdAt: new Date().toISOString(),
                  up_voted_by_users_id: [],
                  down_voted_by_users_id: [],
                });
                e.currentTarget.value = "";
                setNewComment([...newComment]);
                clearCommentBox();

                if (commentContainerRef.current) {
                  commentContainerRef.current.scrollTop = 0;
                }
              }}
            >
              <SendRounded className="icon" />
            </IconButton>
          </form>
        </Paper>
      </div>
    </Modal>
  );
}

function Tags({ tags }: { tags: string[] }) {
  const navigate = useNavigate();
  const handleTagNavigation = (
    e: MouseEvent<HTMLSpanElement, globalThis.MouseEvent>,
  ) => {
    navigate(`/search?q=${e.currentTarget.textContent!.slice(1)}`);
  };
  return (
    <>
      {tags.map((tag) => {
        if (tag === "") return <></>;
        return (
          <span
            onClick={handleTagNavigation}
            className="break-words text-blue-400 hover:cursor-pointer hover:text-blue-700 hover:underline"
          >
            #{tag}
          </span>
        );
      })}
    </>
  );
}

function Comment({
  comment,
  highlight,
}: {
  comment: CommentProps;
  highlight: boolean;
}) {
  return (
    <div className="mb-12 flex gap-4">
      <Avatar
        className="border"
        src={`${process.env.SERVER_PUBLIC}/${comment.author.pfp}`}
      />
      <div
        className={`relative max-w-[85%] rounded-md ${!highlight ? "bg-gray-100" : "border-2 border-solid border-primary-300 bg-primary-100"} p-4`}
      >
        <p className="font-body text-sm font-semibold  text-slate-800">
          {comment.author.fullname}
        </p>
        <Typography className="">{comment.content}</Typography>
        <Typography className="absolute top-full">
          {dateWhenFormat(new Date(comment.createdAt))}
        </Typography>
      </div>
    </div>
  );
}

function PostDeleteAlert({ dialogOpen, setDialogOpen }: PostDeleteDialogProps) {
  const { accessToken } = useContext(TokenContext)!;
  const { post, setPost } = useContext(PostContext)!;
  const { setAlert } = useContext(AlertContext)!;

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const deletePost = () => {
    if (!post) return;
    axiosClient
      .delete(`/posts/${post.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        setAlert({
          message: "Post Deleted",
          severity: "success",
          visible: true,
        });
        setPost(null);
      })
      .catch(() => {
        setAlert({
          message: "Failed to delete post",
          severity: "error",
          visible: true,
        });
      });
    setDialogOpen(false);
  };

  return (
    <Modal open={dialogOpen} onClose={closeDialog}>
      <div className="position absolute left-[50%] top-[50%] flex h-[300px] w-[450px] translate-x-[-50%] translate-y-[-50%] flex-col items-center justify-center rounded-xl bg-white px-5 py-8 shadow-lg">
        <PriorityHighRounded className="rounded-full bg-red-200 p-2 text-[50px] text-red-400" />
        <p className="text my-3 text-lg font-bold text-slate-800">
          Are you sure ?
        </p>
        <p className="mb-7 text-center text-slate-600">
          This action cannot be undone. All values associated with the post will
          be lost
        </p>
        <button
          className="w-full rounded-lg bg-red-400  py-2 font-bold text-white hover:bg-red-500 "
          onClick={deletePost}
        >
          Delete Post
        </button>
        <button
          className="mt-4 w-full rounded-lg border-[3px] border-solid border-slate-300 py-2 font-body font-bold text-slate-700 hover:bg-slate-300 hover:text-white"
          onClick={closeDialog}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

// Types
interface PostDeleteDialogProps {
  dialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}

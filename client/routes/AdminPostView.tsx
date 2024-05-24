import { useContext, useEffect, useState } from "react";
import axiosClient from "../utils/axios";
import { AxiosError } from "axios";
import { sendPostPostRequest } from "../utils";
import PostComponent from "../components/AdminPost";
import { useParams, useSearchParams } from "react-router-dom";
import { TokenContext } from "../providers/TokenProvider";


export default function Post() {
  const { accessToken } = useContext(TokenContext)!;
  const [post, setPost] = useState<Post>();
  const params = useParams<{ postId: string }>();

  const initializePost = () => {
    axiosClient
      .get(`/posts/${params.postId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setPost(res.data.data);
      });
  };

  useEffect(initializePost, [accessToken]);
  return (
    <>
      {post && (
        <div className="px-8">
          <PostComponent postParam={post} />
        </div>
      )}
    </>
  );
}

// TypeDefs
type post = {
  id: string;
  context: string;
  title: string | null;
  tags: string[] | null;
  liked_by_users_id: string[];
  createdAt: Date;
  media: {
    filename: string;
    caption?: string;
  }[];
  author: {
    id: string;
    firstname: string;
    lastname: string;
    proffeciency: string;
    affiliation: string;
    user_image: {
      pfp_name: string;
      cover_name: string;
    };
  };
  comments?: {
    content: string;
    createdAt: string;
    up_voted_by_users_id: string[];
    author: {
      firstname: string;
      lastname: string;
      proffeciency: string;
      affilitation: string;
      user_image: { pfp_name: string; cover_name: string };
    };
  }[];
};

import { CloseRounded, AddPhotoAlternateRounded } from "@mui/icons-material";
import {
  Modal,
  Paper,
  Typography,
  MenuItem,
  Avatar,
  Tooltip,
  useTheme,
  IconButton,
  Chip,
} from "@mui/material";
import React, {
  Dispatch,
  FormEvent,
  MutableRefObject,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import { Input as TextField, Button } from "@mui/base";
import { useFetcher } from "react-router-dom";
import { UserInfoContext } from "../providers/UserInfoProvider";
import axiosClient from "../utils/axios";
import { AlertContext } from "../providers/AlertProvider";

export default function Poster({
  setPostModalView,
}: {
  setPostModalView: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const theme = useTheme();
  const { userInfo } = useContext(UserInfoContext)!;

  return (
    <Paper elevation={1} className="poster sm:w-11/12 md:w-full">
      <div className="pane1">
        <Avatar
          className="avatar sm:size-24 md:size-12"
          src={`${process.env.SERVER_PUBLIC}/${userInfo.pfp}`}
        />
        <Typography
          className="context p-5 sm:text-3xl md:text-lg"
          color={theme.palette.text.secondary}
          sx={{
            ":hover": {
              cursor: "pointer",
              backgroundColor: "#d7dbdc",
              transition: "background-color 0.3s ease",
            },
            background: "#eff3f4",
          }}
          onClick={() => setPostModalView(true)}
        >
          Share your Knowlge or Idea
        </Typography>
      </div>
      <div className="flex justify-center">
        <button
          className="mt-5 rounded-full bg-primary-400 font-semibold normal-case text-white hover:shadow-md sm:w-2/6 sm:p-4 sm:text-3xl md:m-2 md:w-full md:py-2 md:text-lg"
          onClick={() => setPostModalView(true)}
        >
          Post
        </button>
      </div>
    </Paper>
  );
}

export function PosterModal({
  postModalView,
  setPostModalView,
}: {
  postModalView: boolean;
  setPostModalView: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [mediaData, setMediaData] = useState<MediaDataProps[]>([]);
  const imageFileData = useRef<{ fileSrc: File; id: string }[]>([]);
  const postFormData = useRef(new FormData());
  const postFetcher = useFetcher();
  const { setAlert } = useContext(AlertContext);
  const rootFetcher = useFetcher();
  const { userInfo } = useContext(UserInfoContext)!;

  const handlePostSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mediaData !== null) {
      postFormData.current.append("username", userInfo.username);
      mediaData.forEach((image, index) => {
        const imgFile = imageFileData.current?.find(
          (imageFile) => imageFile.id === image.id,
        );
        postFetcher.formData?.append(
          `image-${index}`,
          imgFile?.fileSrc as File,
        );
        if (image.caption !== "")
          postFetcher.formData?.append(`caption-${index}`, image.caption);
        postFormData.current.append(`image-${index}`, imgFile?.fileSrc as File);
      });
      rootFetcher.submit({ idle: true }, { method: "POST", action: "/posts" });
    }

    axiosClient
      .post("/posts", postFormData.current, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setPostModalView(!postModalView);
        setAlert({
          severity: "success",
          message: "Posted Succesfully",
          visible: true,
        });
        setMediaData([]);
        postFormData.current = new FormData();
      });
  };

  return (
    postModalView && (
      <Modal
        open={postModalView}
        onClose={() => setPostModalView(!postModalView)}
      >
        <postFetcher.Form
          className="absolute left-1/2 top-1/2 flex  max-h-[85%] w-[525px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white shadow-lg sm:min-h-[940px] sm:min-w-[1000px] md:min-h-[450px]  md:min-w-[500px]"
          method="POST"
          action="/posts"
          onSubmit={handlePostSubmit}
          encType="multipart/form-data"
        >
          <ModalHeader setModalView={setPostModalView} />
          <UserInfo />
          <div className="w-full overflow-y-auto pb-5">
            <PostForm postFormDataRef={postFormData} />
            <ImageInputSet
              mediaData={mediaData}
              imageFileData={imageFileData}
              setMediaData={setMediaData}
            />
          </div>

          <div className="sticky bottom-0 w-full border-t-2 border-solid border-secondary-100 bg-white px-5 py-2 backdrop-blur-sm">
            <Button
              className="ml-auto block rounded-md bg-secondary-300 px-5 py-2 font-semibold normal-case text-white hover:bg-secondary-400 active:bg-secondary-500 sm:h-16 sm:w-52 sm:text-3xl md:h-10 md:w-20 md:text-base"
              type="submit"
            >
              Post
            </Button>
          </div>
        </postFetcher.Form>
      </Modal>
    )
  );
}

function ImageInputSet({
  mediaData,
  imageFileData,
  setMediaData,
}: {
  mediaData: MediaDataProps[];
  imageFileData: ImageFileDataProps;
  setMediaData: SetMediaDataType;
}) {
  const handlePostImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    const processMedia = (file: File) => {
      const id = Math.random().toString(36);
      if (file.type.match(/image/)) {
        return new Promise<MediaDataProps>((resolve) => {
          imageFileData.current?.push({ id, fileSrc: file });
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            resolve({
              id,
              src: reader.result as string,
              caption: "",
              type: file.type,
            });
          };
        });
      } else {
        return new Promise<MediaDataProps>((resolve) => {
          imageFileData.current?.push({ id, fileSrc: file });
          resolve({
            id,
            src: URL.createObjectURL(file),
            caption: "",
            type: file.type,
          });
        });
      }
    };

    const newImageData = await Promise.all(
      Array.from(files || []).map(processMedia),
    );

    setMediaData([...mediaData, ...newImageData]);
  };

  return (
    <div className="mt-4 flex flex-wrap gap-3 px-5 [&*]:w-full">
      <input
        type="file"
        hidden
        id="post-image-input"
        multiple
        onChange={handlePostImage}
        accept="image/*, video/*"
      />
      <label
        htmlFor="post-image-input"
        className="group flex items-center justify-center rounded-lg bg-secondary-200 hover:cursor-pointer hover:bg-secondary-300 sm:size-[150px] md:size-[100px]"
      >
        <Tooltip
          title="Attach Image"
          className="text-gray-700 group-hover:text-gray-100"
        >
          <AddPhotoAlternateRounded className="sm:size-16 md:size-10" />
        </Tooltip>
      </label>
      <ImagePostSet mediaData={mediaData} setMediaData={setMediaData} />
    </div>
  );
}

function PostForm({ postFormDataRef }: PostFormProps) {
  const [tags, setTags] = useState<string[]>([]);

  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => {
    postFormDataRef.current.append(e.target.name, e.target.value);
  };

  return (
    <div className="scroll-y-auto mt-5 flex w-full flex-col gap-5 px-5">
      <TextField
        slotProps={{
          input: {
            className:
              "bg-slate-100 w-full rounded-lg p-3 border focus-visible:outline-none hover:border-secondary-300 focus-visible:border-secondary-400 border-2 border-secondary-200 md:text-base sm:text-4xl",
          },
        }}
        placeholder="Title (Optional)"
        name="title"
        onChange={handleInputBlur}
      />
      <TextField
        slotProps={{
          input: {
            className:
              "bg-slate-100 w-full rounded-lg p-3 border hover:border-secondary-300 focus-visible:outline-none focus-visible:border-secondary-400 border-2 border-secondary-200 resize-none md:text-base sm:text-3xl",
          },
        }}
        rows={5}
        onChange={handleInputBlur}
        placeholder="Share your knowledge or idea"
        name="context"
        required
        multiline
      />
      <InputTag
        tags={tags}
        setTags={setTags}
        postFormDataRef={postFormDataRef}
      />
    </div>
  );
}

function ImagePostSet({
  mediaData,
  setMediaData,
}: {
  mediaData: MediaDataProps[];
  setMediaData: Dispatch<SetStateAction<MediaDataProps[]>>;
}) {
  const processMediaDataToElement = (media: MediaDataProps, index: number) => {
    if (media.type.match(/image/)) {
      return (
        <div className="relative" key={index}>
          <img src={media.src} className="rounded-lg sm:h-36 md:h-[95px]" />
          <IconButton
            title="Remove Image"
            className="absolute -right-3 -top-3 size-8 border-2 border-solid border-gray-400 bg-gray-100 hover:bg-gray-200"
            onClick={() => {
              setMediaData(
                mediaData.filter((innerImage) => innerImage.id !== media.id),
              );
            }}
          >
            <CloseRounded className="icon" />
          </IconButton>
        </div>
      );
    } else {
      return (
        <div className="relative">
          <video src={media.src} className="size-[100px] rounded-lg" controls />
          <IconButton
            title="Remove Image"
            className="absolute -right-3 -top-3 size-8 border-2 border-solid border-gray-400 bg-gray-100 hover:bg-gray-200"
            onClick={() => {
              setMediaData(
                mediaData.filter((innerImage) => innerImage.id !== media.id),
              );
            }}
          >
            <CloseRounded className="icon" />
          </IconButton>
        </div>
      );
    }
  };

  return <>{mediaData.map(processMediaDataToElement)}</>;
}

function UserInfo() {
  const { userInfo } = useContext(UserInfoContext)!;

  return (
    <div className=" flex items-center gap-2 rounded-sm border-b-4 border-solid border-b-secondary-400 px-5 pb-3 font-semibold text-slate-800">
      <Avatar
        className="-z-10 sm:size-24 md:size-10"
        src={`${process.env.SERVER_PUBLIC}/${userInfo.pfp}`}
      />
      <p className="sm:text-4xl md:text-base">{userInfo.fullname}</p>
    </div>
  );
}

function ModalHeader({ setModalView }: ModalHeaderProps) {
  const closeModal = () => setModalView(false);

  return (
    <div className="sticky top-0 mb-3 flex w-full items-center justify-center border-b-2 border-solid border-secondary-100 bg-white px-5 py-3 text-slate-800">
      <p className="z-50 font-extrabold sm:p-5 sm:text-5xl md:p-0 md:text-xl">
        Create Post
      </p>
      <IconButton className="absolute right-3" onClick={closeModal}>
        <CloseRounded className="sm:size-24 md:size-8" />
      </IconButton>
    </div>
  );
}

function InputTag({
  tags,
  setTags,
  postFormDataRef,
}: InputTagProps & PostFormProps) {
  const { setAlert } = useContext(AlertContext)!;
  const [inputValue, setInputValue] = useState<string>("");
  const [inputFocused, setInputFocused] = useState<boolean>(false);

  const ref = useRef<HTMLInputElement>(null);
  const addInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e.key.match(/( |Enter)/)) return;

    let tag = e.currentTarget.value;
    if ((e.key === " " && tag === "") || (e.key === "Enter" && tag === "")) {
      setInputValue("");
      e.preventDefault();
      return;
    }
    if (tags.find((e) => tag === e)) {
      setInputValue("");
      return setAlert({
        visible: true,
        severity: "warning",
        message: "Word Already added",
      });
    }
    setInputValue("");
    setTags([...tags, tag]);
    e.preventDefault();
  };
  const handleInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value);
  };
  const removeChip = (word: string) => () => {
    setTags(tags.filter((tag) => tag !== word));
  };
  const focusInput = () => {
    ref.current?.focus();
  };
  const inputFocusIn = () => setInputFocused(true);
  const attachTagToForm = () =>
    postFormDataRef.current.append("tags", tags.toString());

  const focusFormStyle = inputFocused
    ? "border-secondary-400"
    : "border-secondary-200";

  return (
    <div
      className={`${focusFormStyle} ${inputFocused || "hover:border-secondary-300"} flex min-h-[55.2px] w-full flex-wrap items-center justify-center rounded-lg border-2 border-solid bg-slate-100 p-2 hover:cursor-text`}
      onClick={focusInput}
    >
      {tags.map((tag) => (
        <Chip
          key={tag}
          className="max-w flex-gow mb-1 ml-1 min-w-[10px] border-2 border-solid border-secondary-300  bg-secondary-200  font-body text-slate-800 hover:cursor-default focus-visible:border-none sm:text-4xl md:text-base"
          label={tag}
          onDelete={removeChip(tag)}
        />
      ))}
      <input
        className="ml-1 mr-auto bg-transparent font-mono  focus-visible:outline-none sm:p-3 sm:text-3xl md:p-0 md:text-base"
        type="text"
        placeholder={tags.length === 0 ? "tags" : ""}
        ref={ref}
        name="tag"
        size={inputValue === "" ? 4 : inputValue.length + 1}
        onChange={handleInputValue}
        value={inputValue}
        onFocusCapture={inputFocusIn}
        onBlur={attachTagToForm}
        onKeyDown={addInterest}
      />
    </div>
  );
}

interface InputTagProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

interface ModalHeaderProps {
  setModalView: Dispatch<SetStateAction<boolean>>;
}

interface PostFormProps {
  postFormDataRef: MutableRefObject<FormData>;
}

interface ModalAlertProps {
  setModalView: Dispatch<SetStateAction<boolean>>;
}

interface MediaDataProps {
  src: string;
  caption: string;
  id: string;
  type: string;
}

type ImageFileDataProps = MutableRefObject<
  {
    fileSrc: File;
    id: string;
  }[]
>;

type SetMediaDataType = Dispatch<SetStateAction<MediaDataProps[]>>;

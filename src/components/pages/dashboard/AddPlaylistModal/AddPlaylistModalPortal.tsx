// AddPlaylistModalPortal.tsx
import { createPortal } from "react-dom";
import AddPlaylistModal from "./AddPlaylistModal";

interface AddPlaylistModalPortalProps {
  setIsOpen: (val: boolean) => void;
  video_id: string;
}

export default function AddPlaylistModalPortal({
  setIsOpen,
  video_id,
}: AddPlaylistModalPortalProps) {
  if (typeof window === "undefined") return null;

  const modalRoot = document.getElementById("modal-root") || document.body;

  return createPortal(
    <AddPlaylistModal setIsOpen={setIsOpen} video_id={video_id} />,
    modalRoot
  );
}

import { useState } from "react";
import { Repeat2, Undo2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface Props {
  open: boolean;
  onClose: () => void;
  isReshared: boolean;
  busy?: boolean;
  onRepost: (comment?: string) => void;
  onUndo: () => void;
}

export function RepostModal({ open, onClose, isReshared, busy, onRepost, onUndo }: Props) {
  const [comment, setComment] = useState("");

  return (
    <Modal open={open} onClose={onClose} title={isReshared ? "Repost options" : "Repost"}>
      <div className="space-y-3">
        <Button fullWidth variant="primary" isLoading={busy} onClick={() => { onRepost(); }}>
          <Repeat2 className="h-4 w-4" /> Repost to your feed
        </Button>

        <div>
          <Textarea label="Repost with a comment" placeholder="Add your thoughts..."
            value={comment} onChange={(e) => setComment(e.target.value)} />
          <Button fullWidth variant="outline" className="mt-2" isLoading={busy}
            disabled={!comment.trim()} onClick={() => onRepost(comment.trim())}>
            Repost with comment
          </Button>
        </div>

        {isReshared && (
          <Button fullWidth variant="ghost" className="text-rose-500" isLoading={busy} onClick={onUndo}>
            <Undo2 className="h-4 w-4" /> Undo repost
          </Button>
        )}
      </div>
    </Modal>
  );
}

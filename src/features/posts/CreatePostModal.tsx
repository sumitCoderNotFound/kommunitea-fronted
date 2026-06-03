import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { useUIStore } from "@/store/uiStore";
import { useCreatePost } from "@/hooks/usePosts";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { CATEGORIES } from "@/constants";
import type { PostCategory } from "@/types";

const schema = z.object({
  body: z.string().min(3, "Say a little more (min 3 characters)").max(2000),
  category: z.string().min(1, "Pick a category"),
  image: z.any().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CreatePostModal() {
  const { isCreatePostOpen, setCreatePostOpen } = useUIStore();
  const createPost = useCreatePost();
  const toast = useToast();
  const confirm = useConfirm();

  const { register, handleSubmit, control, reset, setValue, getValues, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { category: "university_life" } });

  const doPost = async (values: FormValues) => {
    try {
      await createPost.mutateAsync({
        body: values.body,
        category: values.category as PostCategory,
        image: values.image ?? null,
      });
      toast.success("Posted to the community 🎉");
      reset();
      setCreatePostOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onSubmit = (values: FormValues) => {
    confirm({
      title: "Share this post?",
      message: "Your post will be visible to the community.",
      confirmLabel: "Yes, post it",
      cancelLabel: "Cancel",
      onConfirm: () => doPost(values),
    });
  };

  return (
    <Modal open={isCreatePostOpen} onClose={() => setCreatePostOpen(false)} title="Create a post">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Textarea
            autoFocus
            placeholder="Share an opportunity, ask for advice, or celebrate a win..."
            error={errors.body?.message}
            {...register("body")}
          />
          <div className="mt-1 flex justify-end">
            <EmojiPicker onPick={(e) => setValue("body", (getValues("body") || "") + e)} />
          </div>
        </div>
        <Select
          label="Category"
          options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.emoji} ${c.label}` }))}
          error={errors.category?.message}
          {...register("category")}
        />
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <ImageUploader value={field.value} onChange={field.onChange} />
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => setCreatePostOpen(false)}>Cancel</Button>
          <Button type="submit" isLoading={createPost.isPending}>Post</Button>
        </div>
      </form>
    </Modal>
  );
}

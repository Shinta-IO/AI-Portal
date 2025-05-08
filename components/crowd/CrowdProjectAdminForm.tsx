"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { marked } from "marked";
import type { CrowdProject } from "@/types/crowd";

export default function CrowdProjectAdminForm({ editingProject, onSuccess }: {
  editingProject?: CrowdProject;
  onSuccess: () => void;
}) {
  const { supabase } = useSupabase();

  const [title, setTitle] = useState(editingProject?.title || "");
  const [shortDesc, setShortDesc] = useState(editingProject?.description || "");
  const [longDesc, setLongDesc] = useState(editingProject?.long_description || "");
  const [goalAmount, setGoalAmount] = useState<number>(editingProject?.goal_amount ? editingProject.goal_amount / 100 : 0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingProject?.image_url || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !goalAmount) return;
    setLoading(true);

    let image_url = editingProject?.image_url || "";

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const existing = await supabase.storage.from("crowd-images").list("", {
        search: fileName,
      });

      if (!existing?.data?.find((file) => file.name === fileName)) {
        const { error: uploadError } = await supabase.storage
          .from("crowd-images")
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) {
          console.error("Image upload failed:", uploadError);
        }
      }

      const { data: publicUrlData } = supabase.storage
        .from("crowd-images")
        .getPublicUrl(fileName);
      image_url = publicUrlData?.publicUrl || "";
    }

    const payload = {
      title,
      description: shortDesc,
      long_description: longDesc,
      goal_amount: Math.floor(goalAmount * 100 + 0.5),
      image_url,
    };

    const table = supabase.from("crowd_projects");

    try {
      if (editingProject?.id) {
        await table.update(payload).eq("id", editingProject.id);
      } else {
        await table.insert(payload);
      }

      setTitle("");
      setShortDesc("");
      setLongDesc("");
      setGoalAmount(0);
      setImageFile(null);
      setImagePreview(null);
      onSuccess();
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-zinc-900 border border-brand-muted dark:border-brand-blue p-6 rounded-2xl shadow-md w-full max-w-3xl mx-auto"
    >
      <h2 className="text-xl font-heading font-bold text-brand-primary dark:text-brand-accent">
        {editingProject ? "Edit Crowd Project" : "Create New Crowd Project"}
      </h2>

      <div className="grid gap-4">
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter project title"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="shortDesc">Short Description</Label>
          <Textarea
            id="shortDesc"
            rows={2}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="This will show up on the card"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="longDesc">Long Description (Markdown supported)</Label>
          <Textarea
            id="longDesc"
            rows={6}
            value={longDesc}
            onChange={(e) => setLongDesc(e.target.value)}
            placeholder="Add full project details here..."
          />
          {longDesc && (
            <div className="mt-3 p-4 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
              <strong className="block mb-1">Preview:</strong>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: marked(longDesc) }}
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="goalAmount">Funding Goal ($)</Label>
          <Input
            id="goalAmount"
            type="number"
            min={1}
            value={goalAmount}
            onChange={(e) => setGoalAmount(Number(e.target.value))}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {imagePreview && (
            <Image
              src={imagePreview}
              alt="Preview"
              width={250}
              height={200}
              className="rounded mt-2 border"
            />
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="bg-brand-primary hover:bg-brand-accent text-white w-full"
      >
        {loading
          ? editingProject
            ? "Updating..."
            : "Creating..."
          : editingProject
          ? "Update Project"
          : "Create Project"}
      </Button>
    </form>
  );
}

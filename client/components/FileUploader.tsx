"use client";
import { useState } from "react";
import { http } from "@/lib/api";

interface FileUploaderProps {
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
}

export default function FileUploader({
  onUpload,
  accept = "image/*,.pdf,.doc,.docx",
  label = "Choisir un fichier",
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const data = await http.post<{ url: string }>("/api/upload", formData, {
        auth: false,
      });
      onUpload(data.url);
    } catch (err) {
      console.error("Erreur upload:", err);
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded cursor-pointer text-sm">
        {uploading ? "Téléversement..." : label}
        <input
          type="file"
          className="hidden"
          onChange={handleFile}
          accept={accept}
        />
      </label>
    </div>
  );
}

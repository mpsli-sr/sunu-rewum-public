"use client";
import { useState, useRef, useEffect } from "react";
import WysiwygEditor from "./WysiwygEditor";

interface InlineEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  role: string | null;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export default function InlineEditor({
  initialContent,
  onSave,
  role,
  className,
  as: Tag = "div",
}: InlineEditorProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = () => {
    if (role === "ADMIN" || role === "COORDINATOR") {
      setEditing(true);
    }
  };

  const handleSave = () => {
    onSave(content);
    setEditing(false);
  };

  const handleCancel = () => {
    setContent(initialContent);
    setEditing(false);
  };

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  if (editing) {
    return (
      <div className="relative">
        <WysiwygEditor value={content} onChange={setContent} />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
          >
            Enregistrer
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <Tag
      className={className}
      onDoubleClick={handleDoubleClick}
      title={
        role === "ADMIN" || role === "COORDINATOR"
          ? "Double-cliquez pour modifier"
          : ""
      }
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

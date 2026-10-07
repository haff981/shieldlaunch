"use client";

import { useRef, useState, useCallback } from "react";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB（gomo 同款上限）

export default function ImageDropzone({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const pick = useCallback(
    (f: File | undefined | null) => {
      setError("");
      if (!f) return;
      if (!f.type.startsWith("image/")) {
        setError("只支持图片文件");
        return;
      }
      if (f.size > MAX_SIZE) {
        setError("图片不能超过 5MB");
        return;
      }
      setPreview(URL.createObjectURL(f));
      onChange(f);
    },
    [onChange]
  );

  const clear = () => {
    setPreview(null);
    setError("");
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        onPaste={(e) => pick(e.clipboardData.files?.[0])}
        className={`w-full rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-colors ${
          dragOver ? "border-shield-primary bg-blue-50" : "border-shield-line bg-shield-bg"
        } ${preview ? "h-40" : "h-28"}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-40 w-full object-contain" />
        ) : (
          <div className="text-center px-4">
            <div className="text-3xl mb-1">🖼️</div>
            <div className="text-sm font-bold text-shield-ink">点击 / 拖拽 / 粘贴上传</div>
            <div className="text-xs text-shield-muted mt-1">
              JPG / PNG / GIF / WebP，≤5MB
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <div className="text-xs">
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : file ? (
            <span className="text-shield-muted">
              {file.name} · {(file.size / 1024).toFixed(0)}KB
            </span>
          ) : (
            <span className="text-shield-muted/70">截图后直接 Ctrl+V 粘贴也行</span>
          )}
        </div>
        {file && (
          <button onClick={clear} className="text-xs text-red-500 font-bold hover:underline">
            移除
          </button>
        )}
      </div>
    </div>
  );
}

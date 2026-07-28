import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, FileText } from "lucide-react";

export default function FileUpload({ value, onChange, accept, placeholder }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const fileName = value ? decodeURIComponent(value.split("/").pop()) : "";

  return (
    <div>
      {value ? (
        <div className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2.5">
          <a href={value} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 min-w-0 hover:text-emerald-600">
            <FileText className="w-5 h-5 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700 truncate">{fileName}</span>
          </a>
          <button type="button" onClick={() => onChange("")} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 px-3 py-2.5">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">{placeholder || "Загрузить файл"}</span>
            </>
          )}
          <input type="file" accept={accept} className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}
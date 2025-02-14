"use client";

import { useEffect, useState } from "react";
import ImageTable from "./ImageTable";
import { createClient } from "@/utils/supabase/client";

interface Props {
  searchParams: Promise<{ sortOrder: string }>;
}

export default function GoogleDriveLite(props: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const supabase = createClient();

  useEffect(() => {
    props.searchParams.then((params) => {
      setSortOrder(params.sortOrder);
    });
  }, [props.searchParams]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Upload file using standard upload
  async function uploadFile(file: File) {
    const timestamp = Date.now();
    const filePath = `images/${timestamp}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("google-drive-lite")
      .upload(filePath, file, { contentType: file.type });
    if (error) {
      console.log("Upload failed:", error.message);
      return null;
    } else {
      console.log("File uploaded successfully:", data);
    }
    const fileName = data.path.split("/").pop();
    console.log("Uploaded File Name:", fileName);

    return fileName;
  }

  return (
    <div className="p-4 mx-auto">
      <h1 className="text-center text-3xl font-semibold mb-4">
        Google Drive Lite
      </h1>

      <div className="pt-4 pb-4">
        <label className="input input-bordered flex items-center gap-2 max-w-xs">
          <input
            type="text"
            className="grow"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="pb-4">
        <input
          type="file"
          className="file-input file-input-bordered w-full max-w-xs"
          accept="image/*"
          onChange={handleFileChange}
        />
        <button
          type="button"
          title="Upload"
          className="btn btn-primary ml-3"
          onClick={() => {
            if (!selectedFile) {
              alert("Please select a file before uploading.");
              return;
            }
            uploadFile(selectedFile);
          }}
        >
          UPLOAD
        </button>
      </div>

      <ImageTable sortOrder={sortOrder} searchQuery={searchQuery} />
    </div>
  );
}

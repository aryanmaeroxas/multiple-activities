"use client";

import { useEffect, useState } from "react";
import ImageTable from "./ImageTable";
import { createClient } from "@/utils/supabase/client";

interface FileData {
  name: string;
  id: string;
  created_at: string;
}

interface Props {
  searchParams: Promise<{ sortOrder: string }>;
}

export default function GoogleDriveLite(props: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileData[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    props.searchParams.then((params) => {
      setSortOrder(params.sortOrder);
      setUploadError("");
    });
  }, [props.searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  async function fetchData() {
    const { data, error } = await supabase.storage
      .from("google-drive-lite")
      .list("images/", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.log("Upload failed:", error.message);
      return null;
    }

    const filteredFiles = data
      .filter((item) => item.id !== null)
      .map(({ name, id, created_at }) => ({ name, id, created_at }));

    setImageFiles(filteredFiles);
    console.log("Data fetched:", filteredFiles);
  }

  async function uploadFile(file: File) {
    const timestamp = Date.now();
    const filePath = `images/${file.name}`;
    const { data, error } = await supabase.storage
      .from("google-drive-lite")
      .upload(filePath, file, { contentType: file.type });
    if (error) {
      console.log("Upload failed:", error.message);
      setUploadError(error.message);
      return null;
    } else {
      console.log("File uploaded successfully:", data);
    }
    const fileName = data.path.split("/").pop();
    console.log("Uploaded File Name:", fileName);
    fetchData();
    return fileName;
  }

  async function handleDelete(fileId: string) {
    const { error } = await supabase.storage
      .from("google-drive-lite")
      .remove([`images/${fileId}`]);

    if (error) {
      console.error("Delete failed:", error.message);
      alert("Failed to delete file!");
      return;
    }

    setImageFiles((prevFiles) =>
      prevFiles.filter((file) => file.id !== fileId)
    );
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
      {uploadError && (
        <div className="text-red-500 mt-1 mb-2">Error: {uploadError}</div>
      )}

      <ImageTable
        sortOrder={sortOrder}
        searchQuery={searchQuery}
        files={imageFiles}
        handleDelete={handleDelete}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import ImageTable from "./ImageTable";

interface Props {
  searchParams: Promise<{ sortOrder: string }>;
}

export default function GoogleDriveLite(props: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const [sortOrder, setSortOrder] = useState<string>("");

  props.searchParams.then((params) =>
    setSortOrder(params.sortOrder || "upload")
  );

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
        />
      </div>

      {/* 🔹 Pass searchQuery to ImageTable */}
      <ImageTable sortOrder={sortOrder} searchQuery={searchQuery} />
    </div>
  );
}

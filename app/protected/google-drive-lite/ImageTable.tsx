import { useState } from "react";
import Link from "next/link";
import { sort } from "fast-sort";

interface FileData {
  name: string;
  id: string;
  created_at: string;
}

interface Props {
  sortOrder: string;
  searchQuery: string;
  files: FileData[];
  handleDelete: (fileId: string) => void;
}

export default function ImageTable({
  sortOrder,
  searchQuery,
  files,
  handleDelete,
}: Props) {
  const [order, setOrder] = useState<string>("asc");

  const toggleSortOrder = () => {
    setOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const filteredData = files.filter((data) =>
    data.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedData =
    order === "asc"
      ? sort(filteredData).asc((data) =>
          sortOrder === "title" ? data.name.toLowerCase() : data.created_at
        )
      : sort(filteredData).desc((data) =>
          sortOrder === "title" ? data.name.toLowerCase() : data.created_at
        );
  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>
              <Link
                href={"?sortOrder=title"}
                type="button"
                onClick={toggleSortOrder}
              >
                File Name
              </Link>
            </th>
            <th>
              <Link
                href={"?sortOrder=upload"}
                type="button"
                onClick={toggleSortOrder}
              >
                Upload Date
              </Link>
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((file) => (
            <tr key={file.id}>
              <td>{file.name}</td>
              <td>{new Date(file.created_at).toLocaleString()}</td>
              <td>
                <button
                  className="text-red-500 text-lg font-bold hover:text-red-700"
                  onClick={() => handleDelete(file.id)}
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

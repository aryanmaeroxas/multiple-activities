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
}

export default function ImageTable({ sortOrder, searchQuery, files }: Props) {
  const filteredData = files.filter((data) =>
    data.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedData = sort(filteredData).asc(
    sortOrder === "title" ? (data) => data.name : (data) => data.created_at
  );

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>
              <Link href={"?sortOrder=title"} type="button">
                File Name
              </Link>
            </th>
            <th>
              <Link href={"?sortOrder=upload"} type="button">
                Upload Date
              </Link>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((file) => (
            <tr key={file.id}>
              <td>{file.name}</td>
              <td>{new Date(file.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

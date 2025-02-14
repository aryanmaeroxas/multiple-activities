import Link from "next/link";
import { sort } from "fast-sort";

interface Props {
  sortOrder: string;
  searchQuery: string;
}

export default function ImageTable({ sortOrder, searchQuery }: Props) {
  const dummyData = [
    {
      author: "John Doe",
      photo:
        "https://media.4-paws.org/d/2/5/f/d25ff020556e4b5eae747c55576f3b50886c0b90/cut%20cat%20serhio%2002-1813x1811-720x719.jpg",
      title: "The Beauty of Nature",
      uploadDate: "2024-02-14",
    },
    {
      author: "Jane Smith",
      photo:
        "https://media.4-paws.org/8/b/f/4/8bf45f56549cff7f705eb200f5ec5f6a9b335baf/VIER%20PFOTEN_2020-10-07_00138-1806x1804-720x719.jpg",
      title: "Exploring the Cosmos",
      uploadDate: "2024-02-10",
    },
    {
      author: "Michael Johnson",
      photo:
        "https://cdn-fastly.petguide.com/media/2022/02/16/8242210/why-do-cats-always-land-on-their-feet.jpg?size=720x845&nocrop=1",
      title: "The Art of Minimalism",
      uploadDate: "2024-01-25",
    },
    {
      author: "Emily Davis",
      photo:
        "https://www.vetmed.wisc.edu/wp-content/uploads/2022/12/lina-angelov-Ah_QC2v2alE-unsplash-1200x960.jpg",
      title: "A Journey Through Time",
      uploadDate: "2024-01-15",
    },
  ];

  const filteredData = dummyData.filter((data) =>
    data.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedData = sort(filteredData).asc(
    sortOrder === "title" ? (data) => data.title : (data) => data.uploadDate
  );

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Author</th>
          <th>Photo</th>
          <th>
            <Link href={"?sortOrder=title"} type="button">
              Title
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
        {sortedData.map((data, index) => (
          <tr key={index}>
            <td>{data.author}</td>
            <td className="avatar">
              <div className="w-24 rounded">
                <img src={data.photo} alt={`${data.author}'s photo`} />
              </div>
            </td>
            <td>{data.title}</td>
            <td>{data.uploadDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

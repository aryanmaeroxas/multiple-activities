export default async function FoodReview() {
  return (
    <div className="p-4 mx-auto">
      <h1 className="text-center text-3xl font-semibold mb-4">Food Review</h1>
      <div className="pb-5">
        <input
          type="file"
          className="file-input file-input-bordered w-full max-w-xs"
          accept="image/*"
        />
        <button type="button" title="Upload" className="btn btn-neutral ml-3">
          POST
        </button>
      </div>
      <div className="card bg-base-100 w-96 shadow-xl">
        <h2 className="card-title justify-end">
          <div className="badge badge-secondary">NEW</div>
        </h2>
        <div className="card-body">
          <div className="avatar">
            <div className="w-16 rounded-full mb-2 mr-2">
              <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
          </div>
          <div>
            <img
              src="https://plus.unsplash.com/premium_photo-1669742928112-19364a33b530?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGVsaWNpb3VzJTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D"
              alt="food"
              className="h-48 w-96 object-cover rounded-lg"
            />
          </div>
          <div className="card-actions justify-start"></div>
        </div>
      </div>
    </div>
  );
}

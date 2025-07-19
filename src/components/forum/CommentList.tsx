const CommentList = ({ comments }) => (
  <div className="space-y-4">
    {comments.map((c) => (
      <div key={c.id} className="border rounded p-3 bg-gray-50">
        <p className="text-sm">{c.content}</p>
        <p className="text-xs text-gray-500 mt-1">{new Date(c.created_at).toLocaleString("th-TH")}</p>
      </div>
    ))}
  </div>
);
export default CommentList;
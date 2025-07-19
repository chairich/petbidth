const ThreadContent = ({ title, content, image_url, created_at, is_admin }) => (
  <div className="mb-6">
    {image_url && (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
        <img src={image_url} className="w-full rounded border" alt="cover" />
      </div>
    )}
    <h1 className="text-2xl font-bold">{title}</h1>
    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
      <span>{new Date(created_at).toLocaleString('th-TH')}</span>
      {is_admin && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">แอดมิน</span>}
    </div>
    <div className="mt-4 whitespace-pre-wrap">{content}</div>
  </div>
);
export default ThreadContent;
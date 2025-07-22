import { createSupabaseServerClient } from '@/utils/supabase-server'
import CommentForm from '@/components/knowledge/CommentForm'

export default async function KnowledgeDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient(); // ✅ แก้ตรงนี้ ต้องใส่ await

  const { data: post } = await supabase
    .from('knowledge_posts')
    .select('*')
    .eq('id', params.id)
    .single()

  const { data: sections } = await supabase
    .from('knowledge_sections')
    .select('*')
    .eq('post_id', params.id)
    .order('created_at', { ascending: true })

  const { data: comments } = await supabase
    .from('knowledge_comments')
    .select('*, user:users(username)')
    .eq('post_id', params.id)
    .order('created_at', { ascending: true })

  if (!post) {
    return (
      <div className="p-10 text-center text-red-500 text-lg">
        ❌ ไม่พบเนื้อหาข่าวสารนี้ หรืออาจถูกลบไปแล้ว
      </div>
    )
  }

  return (
    <div className="p-4 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      {post.images?.length > 0 && (
        <div className="space-y-3 mb-6">
          {post.images.map((url: string, i: number) => (
            <img key={i} src={url} alt={`img-${i}`} className="rounded-lg w-full" />
          ))}
        </div>
      )}

      {sections?.map((s, i) => (
        <div key={i} className="mb-6">
          <h2 className="text-xl font-semibold text-blue-400 mb-1">{s.subheading}</h2>
          <p className="text-gray-200 whitespace-pre-wrap">{s.body}</p>
        </div>
      ))}

      <h2 className="text-xl font-semibold mb-2 mt-10">ความคิดเห็น</h2>
      <CommentForm postId={params.id} />
      <div className="space-y-2 mt-4">
        {comments?.map((c, i) => (
          <div key={i} className="bg-zinc-800 p-3 rounded">
            <strong>{c.user?.username || 'ไม่ระบุชื่อ'}</strong>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

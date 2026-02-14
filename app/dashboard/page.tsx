import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookmarkList from '@/components/BookmarkList'
import AddBookmarkForm from '@/components/AddBookmarkForm'
import LogoutButton from '@/components/LogoutButton'

export default async function Dashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch initial bookmarks
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      <header className="shadow-sm border-b bg-[#0f1115] border-[#1f2733]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-100">
                  My Bookmarks
                </h1>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="rounded-xl shadow-sm border p-6 sticky top-8 bg-[#111318] border-[#1f2733]">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">
                Add New Bookmark
              </h2>
              <AddBookmarkForm />
            </div>
          </div>

          <div className="lg:col-span-2">
            <BookmarkList initialBookmarks={bookmarks || []} />
          </div>
        </div>
      </main>
    </div>
  )
}

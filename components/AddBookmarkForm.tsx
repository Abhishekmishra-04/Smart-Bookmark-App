'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function AddBookmarkForm() {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) {
      alert('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('You must be logged in')
        return
      }

      // Add https:// if no protocol specified
      let formattedUrl = url.trim()
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl
      }

      const { error } = await supabase.from('bookmarks').insert({
        user_id: user.id,
        title: title.trim(),
        url: formattedUrl,
      })

      if (error) throw error

      // Clear form
      setTitle('')
      setUrl('')
    } catch (error) {
      console.error('Error adding bookmark:', error)
      alert('Failed to add bookmark. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-xs font-medium text-gray-200 mb-1">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Awesome Website"
          className="w-full px-4 py-2 rounded-lg border bg-[#0f1115] border-[#1f2733] text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-200 mb-1"
        >
          URL
        </label>
        <input
          type="text"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          className="w-full px-4 py-2 rounded-lg border bg-[#0f1115] border-[#1f2733] text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-slate-400">
          You can skip https:// - we&apos;ll add it for you
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Adding...' : 'Add Bookmark'}
      </button>
    </form>
  )
}

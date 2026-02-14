'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
}

export default function BookmarkList({
  initialBookmarks,
}: {
  initialBookmarks: Bookmark[]
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Set up Realtime subscription
    const channel: RealtimeChannel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((current) => [payload.new as Bookmark, ...current])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((current) =>
              current.filter((bookmark) => bookmark.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) {
      return
    }

    setDeletingId(id)
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      alert('Failed to delete bookmark. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-xl shadow-sm border p-12 text-center bg-[#111318] border-[#1f2733]">
        <svg
          className="w-16 h-16 text-slate-500 mx-auto mb-4"
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
        <h3 className="text-lg font-medium text-gray-100 mb-2">
          No bookmarks yet
        </h3>
        <p className="text-slate-400">
          Add your first bookmark to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">
        Your Bookmarks ({bookmarks.length})
      </h2>
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow bg-[#111318] border-[#1f2733]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-100 mb-1 truncate">
                {bookmark.title}
              </h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-300 hover:text-indigo-200 hover:underline flex items-center gap-1 truncate"
              >
                <span className="truncate">{getDomain(bookmark.url)}</span>
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <p className="text-xs text-slate-400 mt-1">
                Added {new Date(bookmark.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(bookmark.id)}
              disabled={deletingId === bookmark.id}
              className="flex-shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors disabled:opacity-50"
              title="Delete bookmark"
            >
              {deletingId === bookmark.id ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

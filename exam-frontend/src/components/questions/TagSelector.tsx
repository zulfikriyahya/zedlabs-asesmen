'use client'
import { useEffect, useState } from 'react'
import { questionsApi } from '@/lib/api/questions.api'
import type { QuestionTag } from '@/types/question'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'

interface TagSelectorProps {
  selected: string[]   // tagIds
  onChange: (ids: string[]) => void
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<QuestionTag[]>([])
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    questionsApi.listTags().then(setTags).catch(() => {})
  }, [])

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  }

  const createTag = async () => {
    if (!search.trim()) return
    setCreating(true)
    try {
      const tag = await questionsApi.createTag(search.trim())
      setTags(prev => [...prev, tag])
      onChange([...selected, tag.id])
      setSearch('')
    } finally {
      setCreating(false)
    }
  }

  const filtered = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-2">
      <Input
        placeholder="Cari atau buat tag..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        inputSize="sm"
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); void createTag() }
        }}
      />
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
        {filtered.map(tag => {
          const active = selected.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={`badge cursor-pointer transition-colors ${active ? 'badge-primary' : 'badge-ghost border border-base-300 hover:badge-primary'}`}
            >
              {tag.name}
            </button>
          )
        })}
        {search && !filtered.some(t => t.name === search) && (
          <button
            type="button"
            onClick={() => void createTag()}
            disabled={creating}
            className="badge badge-outline badge-accent cursor-pointer"
          >
            + Buat "{search}"
          </button>
        )}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-base-content/50">{selected.length} tag dipilih</p>
      )}
    </div>
  )
}

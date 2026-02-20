'use client'
import { useCallback, useRef } from 'react'
import { useAnswerStore } from '@/stores/answer.store'
import { saveAnswerToLocal } from '@/lib/exam/auto-save'
import type { AnswerValue } from '@/types/answer'
import type { ID } from '@/types/common'

const DEBOUNCE_MS = 1500

// Utility debounce inline agar tidak circular import
function debounce<T extends (...args: Parameters<T>) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { fn(...args); timer = null }, delay)
  }
}

interface UseAutoSaveParams {
  attemptId: ID
  sessionId: ID
}

export function useAutoSave({ attemptId, sessionId }: UseAutoSaveParams) {
  const { setAnswer } = useAnswerStore()
  const isSavingRef = useRef(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (questionId: ID, answer: AnswerValue) => {
      if (isSavingRef.current) return
      isSavingRef.current = true
      try {
        await saveAnswerToLocal({ questionId, attemptId, sessionId, answer })
      } finally {
        isSavingRef.current = false
      }
    }, DEBOUNCE_MS),
    [attemptId, sessionId],
  )

  const saveAnswer = useCallback((questionId: ID, answer: AnswerValue) => {
    setAnswer(questionId, answer)   // optimistic update UI
    debouncedSave(questionId, answer)
  }, [setAnswer, debouncedSave])

  return { saveAnswer, isSaving: isSavingRef.current }
}

'use client'
import { useState, useEffect } from 'react'

interface DeviceWarnings {
  isStorageLow: boolean
  isOldBrowser: boolean
  warnings: string[]
}

const MIN_STORAGE_MB = Number(process.env.NEXT_PUBLIC_MIN_STORAGE_MB ?? 2048)

export function useDeviceWarnings(): DeviceWarnings {
  const [warnings, setWarnings] = useState<string[]>([])
  const [isStorageLow, setStorageLow] = useState(false)
  const [isOldBrowser, setOldBrowser] = useState(false)

  useEffect(() => {
    const w: string[] = []

    if (!window.crypto?.subtle) {
      w.push('Browser tidak mendukung Web Crypto API. Gunakan Chrome 80+ atau Firefox 90+.')
      setOldBrowser(true)
      setWarnings([...w])
      return
    }

    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(({ available }) => {
        if (available !== undefined && available < MIN_STORAGE_MB * 1024 * 1024) {
          const mb = Math.round(available / 1024 / 1024)
          const msg = `Penyimpanan tersedia hanya ${mb} MB. Harap kosongkan ruang minimal ${MIN_STORAGE_MB} MB.`
          w.push(msg)
          setStorageLow(true)
          setWarnings([...w])
        }
      })
    }

    setWarnings(w)
  }, [])

  return { isStorageLow, isOldBrowser, warnings }
}

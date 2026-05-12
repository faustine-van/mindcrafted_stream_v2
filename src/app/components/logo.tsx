'use client'

import Image from 'next/image'
import logoLight from '@/assets/logo-horizontal.svg'
import logoDark from '@/assets/logo-horizontal-dark.svg'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function Logo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <Image
      src={mounted && resolvedTheme === 'dark' ? logoDark : logoLight}
      alt="Mindcrafted Stream"
      width={240}
      height={48}
      priority
    />
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Zenith',
  description: 'Sign in to your Zenith Life OS workspace.',
}

import { Suspense } from 'react'
import SignInPage from './_page'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignInPage />
    </Suspense>
  )
}

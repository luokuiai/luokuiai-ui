'use client'

import { useState } from 'react'
import { RiFileCopyLine } from '@remixicon/react'
import { Button } from '@luokui/ui'

export default function Code({ children }: { children: string }) {
  const [feedback, setFeedback] = useState('')
  async function copy() {
    try { await navigator.clipboard.writeText(children); setFeedback('已复制') }
    catch { setFeedback('请手动复制') }
  }
  return <div className="docs-code" dir="ltr">
    <div className="docs-code-action"><Button size="xs" variant="ghost" leadingIcon={RiFileCopyLine} onClick={copy}>复制</Button><span role="status">{feedback}</span></div>
    <pre><code>{children}</code></pre>
  </div>
}

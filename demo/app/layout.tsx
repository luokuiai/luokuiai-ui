import type { Metadata } from 'next'
import { DirectionProvider } from '@luokui/ui'
import '@luokui/ui/styles.css'
import './site.css'

export const metadata: Metadata = {
  title: { default: 'LUOKUI UI', template: '%s · LUOKUI UI' },
  description: 'LUOKUI-AI 组件预览、使用示例与 TypeScript API。'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: 'try{if(localStorage.getItem("luokui-ai:theme")==="dark")document.documentElement.classList.add("dark")}catch{}' }} /></head>
    <body><DirectionProvider locale="zh-CN">{children}</DirectionProvider></body>
  </html>
}

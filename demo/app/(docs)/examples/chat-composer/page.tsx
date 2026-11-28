import '@luokui/ui/chat-composer.css'
import { ComposerExamples } from './previews'

export const metadata = { title: '公共聊天输入框' }

export default function ChatComposerExamples() {
  return <>
    <h1>公共聊天输入框</h1>
    <p>四种场景共用输入框布局。编辑、模型选择、技能菜单、发送和停止均可在此试用。示例在本地模拟回复。</p>
    <ComposerExamples />
  </>
}

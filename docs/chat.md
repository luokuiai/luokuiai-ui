# Chat 聊天组件

`@luokui/ui/chat` 只提供 React 展示组件，不依赖 Next.js、AI SDK、路由、网络、浏览器存储或模型。消息内容、回调、语言和状态由宿主传入，不复制 BoardUI Pro 模板。

```tsx
import '@luokui/ui/styles.css'
import '@luokui/ui/chat.css'
import { ChatShell, ChatTranscript, ChatMessage, ChatComposerSeat, ChatWelcome } from '@luokui/ui/chat'

<ChatShell header={toolbar} sidebar={history} auxiliary={details} composer={
  <ChatComposerSeat>{existingComposer}</ChatComposerSeat>
}>
  <ChatTranscript role="log" aria-label="会话消息">
    {!messages.length && <ChatWelcome>{welcomeText}</ChatWelcome>}
    {messages.map(message => <ChatMessage key={message.id} author={message.author}
      side={message.isMine ? 'end' : 'start'} actions={renderActions(message)}>
      {renderContent(message)}
    </ChatMessage>)}
  </ChatTranscript>
</ChatShell>
```

- `ChatShell`：支持 `header`、`sidebar`、`auxiliary`、`composer` 和 `children`，转发原生 div 属性与 ref。不传侧栏和辅助区时，不会添加额外 DOM 层级。
- `ChatTranscript`、`ChatComposerSeat`、`ChatWelcome`：接收内容和 div 属性；滚动、焦点、空态/加载逻辑由调用方负责。如已有滚动容器，传宿主的 `className` 保留原来的滚动归属。
- `ChatMessage`：支持作者、头像、时间、操作区和对齐方向；内容可直接传入宿主现有的 Markdown、附件或引用渲染器。不要把长消息流整体设为实时公告区；由宿主决定无障碍播报范围。
- `className` 替换默认组件类（不是追加），这样可以接入已有的主题和布局，而不引入第二套样式。使用默认外观时导入 `@luokui/ui/chat.css`。

## 可选工作台外观

在默认 `chat.css` 之外导入 `@luokui/ui/chat-workbench.css`，并设置 `<ChatShell skin="workbench">`。它只作用于明确启用的聊天区域，提供工作台风格的内容宽度、消息间距、用户气泡和输入栏，随 `ThemeScope` 的浅色、深色或系统主题变化。该入口不依赖毕昇的 `dsh-*` 类名或接口。保留组件的默认类，或在覆盖 `className` 时自己附上相应的 `lk-chat-*` 类。

毕昇现有聊天页使用单独的 `@luokui/ui/chat-bisheng.css` 兼容入口，它沿用原选择器和现有的主题变量，不通过 `skin` 切换。工作区布局和移动端页头仍在毕昇的 `luokui-chat-host.css`。

## bingsheng-ee 接入范围

默认聊天页 `ChatView.tsx` 使用共享的聊天布局、消息区、欢迎区和输入承载区，保留当前宿主样式、尺寸 refs、DOM 层级和 `AiChatMessages` / `AiChatInput`。未替换消息气泡、侧栏、独立分享页、Linsight 任务页以及其他内嵌对话。会话恢复、SSE、停止生成、重试、上传、模型、权限和工作区预览仍由毕昇原实现负责。

消费端通过 `@bisheng/ui/chat` 转发到同一 workspace 的 `@luokui/ui/chat`。修改 `src/chat.ts` 后直接由应用编译，不需要再同步快照。

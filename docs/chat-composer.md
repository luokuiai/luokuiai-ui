# 公共聊天输入框

`@luokui/ui/chat-composer` 提供 `ChatComposer`、`ChatComposerFrame` 和 `ChatReplyLoading`。布局源自 AI 对话输入框，包含编辑区、操作区、底部状态和模型栏。Web 页面和桌面渲染器可提供各自的模型数据、编辑器、权限状态和提交回调。

```tsx
import { ChatComposer, ChatComposerFrame, ChatReplyLoading } from '@luokui/ui/chat-composer'
import '@luokui/ui/chat-composer.css'
```

## `ChatComposer`

组件提供受控文本框、标签、模型选择及发送和停止按钮。Enter 提交，Shift+Enter 换行。中文输入法组词时保留确认操作。光标在文本开头且没有文本选区时，Backspace 移除最后一个标签。聚焦标签时也可用 Backspace 或 Delete 删除。

| Prop | 类型与行为 |
| --- | --- |
| `value`、`onChange` | 必传。`string` 草稿及其变化回调。 |
| `onSend` | 必传。收到 `{ text, modelId, tags }`，其中 `modelId` 可省略。由宿主发送消息或创建任务。 |
| `onStop` | 停止回调。传入后，`running` 期间显示停止按钮。 |
| `placeholder` | 输入提示。 |
| `inputLabel`、`sendLabel`、`stopLabel` | 无障碍名称。前两项必传，`stopLabel` 默认 `Stop`。 |
| `disabled`、`sendDisabled` | 默认 `false`。`disabled` 禁用内置编辑区、模型选择及标签删除。`sendDisabled` 只阻止提交。自定义控件可由宿主传入相应的禁用属性。 |
| `skillMenu` | 自定义菜单节点，包含触发器和弹层。可在选择技能时更新 `tags`。 |
| `tags`、`onRemoveTag`、`removeTagLabel` | 标签列表为 `{ id, label, icon? }[]`。删除回调收到标签 ID，可自定义删除按钮的无障碍名称。 |
| `models`、`modelLabel` | 默认选择器的 `{ id, name }[]` 模型目录及无障碍名称，后者默认 `Model`。 |
| `defaultModel` | 非受控模式的初始模型 ID。目录中找不到对应项时选择目录首项。 |
| `modelValue`、`onModelChange` | 受控模型与选择回调。替换选择器时，可用 `modelValue` 将选择结果传给 `onSend`。 |
| `compact` | 指定是否使用单行布局。默认随草稿中的换行切换，存在附件时使用多行布局。 |

`ChatComposer` 还接收下面的外壳属性，编辑器由组件提供。`leadingActions` 和 `trailingActions` 分别在标签和发送按钮旁加入额外控件。

## `ChatComposerFrame`

适用于已有编辑器和提交逻辑的页面。除 `editor` 外均可选。各内容插槽接收 `ReactNode`。

| Prop | 用途 |
| --- | --- |
| `editor` | 必传。宿主编辑器，例如 Harness 会话输入区域。 |
| `toolbarAbove`、`attachments` | 上方工具栏与卡片内附件预览。 |
| `leadingActions`、`trailingActions` | 左侧和右侧操作，例如引用文件、语音、发送和停止。 |
| `footerStart`、`modelPicker` | 底部状态或业务控件，以及右侧完整模型选择器。 |
| `compact`、`elevated`、`boardUi` | 紧凑排布、阴影和 `data-ui-library="boardui"` 标记。 |
| `running`、`animateLoading` | 运行状态与加载光带开关，分别默认 `false` 和 `true`。 |
| `loadingIndicator` | 运行时替换默认光带，可传入组件库已有的 `ComposerLoader`。 |
| `className`、`leadingRef`、`onKeyDownCapture` | 外层样式类、左侧操作区 DOM 引用及键盘捕获回调。 |

`ChatReplyLoading` 接收一个 `label: string`，在消息区域展示带状态提示的等待动效。默认光带和等待动效遵循系统的「减少动态效果」设置。

## 调用示例

在组件库运行 `npm run demo`，打开 [公共聊天输入框](http://127.0.0.1:3214/examples/chat-composer)。示例使用本地状态模拟发送、回复和停止。[完整示例源码](../demo/app/%28docs%29/examples/chat-composer/previews.tsx)

| 场景 | 调用方式 |
| --- | --- |
| AI 对话 | `ChatComposer` 配置提示词、技能菜单、可删除标签、自定义 `ModelPicker`、光带和回复动效。 |
| 图像生成 | `ChatComposer` 配置参考图、画板、默认模型、生成与停止状态。 |
| 代码工作台 | `ChatComposerFrame` 接入自定义编辑器、文件引用、工作区权限和指定模型，并组合 `ComposerLoader` 与 `AgentThinking`。 |
| 多代理协作 | `ChatComposer` 配置代理切换、受控模型、技能标签、语音操作和停止。 |

```tsx
import { useState } from 'react'
import { ChatComposer } from '@luokui/ui/chat-composer'
import '@luokui/ui/chat-composer.css'

export function Prompt({ send }: { send: (text: string, modelId?: string) => void }) {
  const [draft, setDraft] = useState('')
  return <ChatComposer
    value={draft}
    onChange={setDraft}
    placeholder="描述你的任务"
    inputLabel="任务描述"
    sendLabel="发送"
    models={[{ id: 'default', name: '默认模型' }]}
    onSend={({ text, modelId }) => send(text, modelId)}
  />
}
```

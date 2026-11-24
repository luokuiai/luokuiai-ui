import { ComponentLab } from '@luokui/ui/components/workspace/lab.tsx'
import { FeaturedExamples } from '../../previews'

export const metadata = { title: '交互示例' }

export default function Examples() {
  return <>
    <h1>交互示例</h1>
    <p>试用真实组件，打开代码查看导入方式、受控状态和事件回调。</p>
    <FeaturedExamples />
    <h2>应用组件实验室</h2>
    <ComponentLab />
  </>
}

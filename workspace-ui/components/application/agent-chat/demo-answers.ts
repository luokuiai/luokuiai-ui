type DemoAnswer = { match: RegExp; reply: string };

const ANSWERS: DemoAnswer[] = [
  {
    match: /工作台|项目介绍|能做什么|starter|what (is|does) this|about this app|luokui-ai/i,
    reply: "LUOKUI-AI 提供流式对话、多代理协作、代码工作台、图像生成演示和组件实验室。当前使用本地预设回复，你可以先发送消息、暂停回复和查看历史。配置 AI_API_KEY 后，同一对话界面即可连接真实模型。",
  },
  {
    match: /产品更新|发布说明|更新公告|product update|announcement|release notes|changelog/i,
    reply: "本次更新加入了可逐项打开的组件目录。对话和设置界面已切换为简体中文。你可以通过模型连接页查看环境配置状态，再返回对话试用。［本地演示回复］",
  },
  {
    match: /取名|五个名字|命名|names?\b.*\b(app|product|scheduling|startup|company)|name ideas|suggest.*names/i,
    reply: "五个排程应用名字：刻序、空档、日程桥、约时、节律。刻序适合个人时间管理，空档和约时适合预约场景，日程桥适合团队共享。［本地演示回复］",
  },
  {
    match: /模型|密钥|接口|服务商|key|api|openrouter|openai|anthropic|provider|model/i,
    reply: "要接入真实模型，在项目的 .env.local 中配置 AI_API_KEY，并重启服务。也可以通过 CHAT_MODEL 指定模型，再到「模型连接」页面检查配置。［本地演示回复］",
  },
  {
    match: /你好|您好|在吗|hello|hi\b|hey|good (morning|afternoon|evening)/i,
    reply: "你好，我是 LUOKUI-AI 的本地演示助手。你可以问我工作台有哪些功能，或怎样配置真实模型。",
  },
];

const FALLBACK =
  "当前使用本地演示回复。你可以问我「工作台能做什么」或「如何接入模型」。配置 AI_API_KEY 后，可以在这个对话界面向真实模型提问。";

export function pickDemoAnswer(prompt: string): string {
  return ANSWERS.find((answer) => answer.match.test(prompt))?.reply ?? FALLBACK;
}

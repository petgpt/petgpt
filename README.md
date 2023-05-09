# petgpt

> desktop pet + chatgpt + tools

### Build Setup

``` bash
# install dependencies
yarn

# serve with hot reload
yarn run dev

# build
yarn run build
```
### 前置条件
- node环境：推荐nvm来管理node环境
- yarn包管理工具，用于插件下载：npm install -g yarn


### 插件开发
- [插件模板](https://www.npmjs.com/package/petgpt-plugin-template)
- [chatgpt插件](https://www.npmjs.com/package/petgpt-plugin-chatgpt)
- [bing chat插件](https://www.npmjs.com/package/petgpt-plugin-bing-chat)

---

- 模板修改完后，上传到npm
- 在setting页面，输入插件的名字，例如：petgpt-plugin-test，点击install，就可以安装了（需要有node环境，能运行npm命令）
- 插件会自动下载到app.getPath('userData')/node_modules下，依赖会自动添加到.getPath('userData')下的package.json里的dependencies里
- electron暴露给插件的能力，见lib/types.ts里的定义

### TODO:
基础功能：
- [x] 全局状态管理\持久化
- [x] 本地数据库（持久化）（重启的时候读取到配置信息）
  - [x] 本地文件系统配置文件的操作接口
- [x] main线程与renderer线程通信
- [x] 动态快捷键监听与绑定、解绑
- [x] 系统文件夹路径获取
  - [ ] 文件夹下文件列表获取
  - [ ] 本地文件系统的操作，例如保存记录为文件、从某种格式的文件中读取内容
- [x] 剪贴板文字获取 / 剪贴板文件路径获取（mac没有测试行不行）
  - [x] 剪贴板文件类型获取
  - [ ] 针对不同的文件预留不同的handler
- [x] 弹出系统通知 
- [x] cmd运行
  - [ ] 唤起已经打开的本地应用

高级功能：
- [x] 插件系统
  - [x] 插件的在线下载、更新、删除 
  - [x] [插件模板](https://www.npmjs.com/package/petgpt-plugin-template)
  - [x] [chatgpt插件](https://www.npmjs.com/package/petgpt-plugin-chatgpt)
    - [ ] 多个对话
  - [x] [bing chat插件](https://www.npmjs.com/package/petgpt-plugin-bing-chat)
- [ ] 拖动的时候，屏幕不同边缘检测
- [ ] 根据功能，进行页面布局设计
- [ ] chatgpt的对话，提供修改功能，点击之前发送的文本，可以便捷的进行修改。
  - [ ] 在微调自己的prompt的时候非常有用，不用重新开一个对话，把前面调试好的发过去，再继续调试刚才的内容。
- [ ] chatgpt
  - [x] proxy设置
  - [x] 单次对话、连续对话
  - [x] 自定义temperature等参数
  - [x] markdown\表格\code
  - [x] latex
  - [ ] 其他接口（模型操作、图片操作、语音转文字接口）
  - [ ] 侧边栏保存不同的配置，例如设置了不同的system message，让chatgpt扮演不同的角色，每次都需要重新输入好麻烦。如果能保存之前的设置，一键切换，会很方便！
- [ ] 本地配置文件（json）设计
  - [x] 提供操作接口 => db.ts
- [ ] Pet页面里的gif改成动态加载
  - [ ] 提供修改接口，这样可以根据main线程的不同事件，动态修改gif
  - [ ] Pet页面的操作轮盘
  - [ ] 从配置文件渲染Pet页面？（2.0）
- [ ] 音频获取
  - [x] win下的简单
  - [ ] mac下的非常麻烦，参考https://cloud.tencent.com/developer/article/1884082
- [ ] OCR 功能
- [ ] 翻译接口
- [ ] prompt页面 
  - [x] 提供prompt的本地CRUD
- [ ] pdf内容获取
  - pdf内容无关清洗
- [ ] 语音 => 文字，文字 => 微调模型 => cmd命令
  - [ ] 命令（cmd）数据结构的设计
  - [ ] 用于命令的微调模型的训练数据json
- [ ] 如果要定时通知、定时执行命令，需要用到定时任务
  - [ ] 定时任务的数据结构
  - [ ] 定时任务的本地CRUD
- [ ] 自定义请求
  - [ ] 对接别人免费的网站，模拟请求
  - [ ] 可行吗？要试试
- [ ] CI
  - [ ] 修改现有的.github/workflows里的action，改为可以用的

素材：
- [ ] 默认的gif
  - gif状态流转之间要有过渡/流畅（见python实现那个），感觉是动画有个中间态，中间态可以向不同的状态进行转移，这样就可以实现流畅的状态转移。
  - [ ] 需要结合pet状态机的设计
### bug
- [x] aside翻页的时候跟随着一起运动了。
- [x] 消息没有自动滚动到最底部
- [ ] 侧边缩小的时候，用户的文字超出边框了 | system的消息在 `包裹` 里面，所以超出边框了 | 用户输入的代码没有格式化 | 用户输入的regex不见了 
- [ ] chatgpt插件slotMenu的标题没有改
- [ ] 文件类型获取的时候，md多个hex值。xml与psd冲突。mac没有测试行不行。
- [x] main窗口拖动的时候，碰到屏幕边缘闪烁
- [ ] main/renderer的系统通知，监听notification的click事件都失败了，不知道为啥。
- [ ] electron-clipboard-ex不兼容linux平台
---

This project was generated with [electron-vite-vue](https://github.com/electron-vite/electron-vite-vue)

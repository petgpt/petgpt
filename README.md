# petgpt

> desktop pet + chatgpt + tools

### Build Setup

``` bash
# install dependencies
yarn

# serve with hot reload at localhost:9080
yarn run dev

# build
yarn run build
```

### TODO:
基础功能：
- [x] 全局状态管理\持久化
- [ ] 本地数据库（持久化）（重启的时候读取到配置信息）
  - [ ] 本地文件系统配置文件的操作接口
- [x] main线程与renderer线程通信
- [x] 动态快捷键监听与绑定、解绑
- [x] 系统文件夹路径获取
  - [ ] 文件夹下文件列表获取
  - [ ] 本地文件系统的操作，例如保存记录为文件、从某种格式的文件中读取内容
- [x] 剪贴板文字获取 / 剪贴板文件路径获取（mac没有测试行不行）
  - [x] 剪贴板文件类型获取
  - [ ] 针对不同的文件预留不同的handler
- [x] 弹出系统通知 
- [ ] 唤起本地的应用

高级功能：
- [ ] 拖动的时候，屏幕不同边缘检测
- [ ] chatgpt微调
  - [ ] 接口与参数
  - [ ] 封装api
- [ ] 本地配置文件（json）设计
  - [ ] 提供操作接口
- [ ] Pet页面里的gif改成动态加载
  - [ ] 提供修改接口，这样可以根据main线程的不同事件，动态修改gif
  - [ ] Pet页面的操作轮盘
  - [ ] 从配置文件渲染Pet页面？（2.0）

素材：
- [ ] 默认的gif
  - gif状态流转之间要有过渡/流畅（见python实现那个），感觉是动画有个中间态，中间态可以向不同的状态进行转移，这样就可以实现流畅的状态转移。

### bug
- [ ] 文件类型获取的时候，md多个hex值。xml与psd冲突。mac没有测试行不行。
- [ ] main窗口拖动的时候，碰到屏幕边缘闪烁
- [ ] main/renderer的系统通知，监听notification的click事件都失败了，不知道为啥。
- [ ] electron-clipboard-ex不兼容linux平台
---

This project was generated with [electron-vite-vue](https://github.com/electron-vite/electron-vite-vue)

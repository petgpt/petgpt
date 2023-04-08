<template>
  <div style="background-color: red">功能演示, 平台{{platform}}</div>
  <el-row>
    <el-button type="primary" size="small" @click="pushRouter">跳转到Chatgpt页面</el-button>
    <el-divider></el-divider>
    <el-col>
      获取全局状态title: {{computedStoreTitle}}
      <div>
        持久化状态count(存放在localStorage): {{ persistStoreTestCount }}<el-button type="primary" size="small" @click="addPersistStoreTest">点击+1 不受刷新影响</el-button>
      </div>
    </el-col>
    <el-divider></el-divider>
    <el-col>
      main renderer线程通信：
      <el-button type="primary" size="small" @click="ipcRenderInvokeTest">invoke</el-button>
      <el-button type="primary" size="small" @click="ipcRenderSendTest">send</el-button>
    </el-col>
    <el-divider></el-divider>
    <el-col>
      点击开始监听用户按下的组合键：
      <el-input class="iconfont" v-model="shortcut" style="width:150px;"
             clearable maxlength="20"
             :placeholder="placeholder" @blur="inputBlur()" @keydown="getShortKeys" @clear="clearAllShortKey"/>
    </el-col>
    <el-divider></el-divider>
    <el-col>
      点击获取系统路径：{{dirPath}}<el-button type="primary" size="small" @click="getSystemDirPath">获取系统路径</el-button>
      <div>剪贴板内容类型:{{clipBoardType}}<el-button type="primary" size="small" @click="getClipBoardType">获取</el-button></div>
      <div>
        <el-button type="primary" size="small" @click="showSysNotification">弹系统通知</el-button>
        <el-button type="primary" size="small" @click="changeImage">切换pet gif</el-button>
      </div>
    </el-col>
  </el-row>
  <el-divider></el-divider>
  <el-row>
    <div>输入正确的cmd命令（提供了一个示例）：
      <el-button type="primary" size="small" @click="executeCmd">执行cmd</el-button>
      <el-input v-model="cmd" style="width:300px;"></el-input>
    </div>
<!--    输入参数数组(string[]，|号分隔)(TODO：有些参数没有效果)：<el-input v-model="parameters"></el-input>-->
  </el-row>
  <el-divider>↓↓ 打开配置文件 ↓↓</el-divider>
  <el-row>
    <el-button type="primary" size="small" @click="openConfigFile">打开配置文件</el-button>
  </el-row>
  <el-divider>↓↓ 配置文件的CRUD ↓↓</el-divider>
  <el-row>
    <el-col>
      <div>获取到的内容： {{dbGetContent}}</div>
      <el-input style="width: 70px" placeholder="key" v-model="dbKey">db-getByKey</el-input>
      <el-button type="primary" size="small" @click="dbGetKey">db-getByKey</el-button>
      <el-button type="primary" size="small" @click="dbRead">db-readAll</el-button>
    </el-col>
    <el-col>

    </el-col>
    <el-col>
      <el-input style="width: 70px" placeholder="key" v-model="key">key</el-input>
      <el-input style="width: 70px" placeholder="value" v-model="value">value</el-input>
      <el-button type="primary" size="small" @click="dbSet">db-set</el-button>
    </el-col>
    <el-col>
      <el-input style="width: 70px" placeholder="value" v-model="keyToDelete">value</el-input>
      <el-button type="primary" size="small" @click="dbDelete">db-delete</el-button>
    </el-col>
    <el-col>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import {usePersistStoreTest, useTitleStore} from "../store";
import {ipcRenderer, IpcRendererEvent} from "electron";
import {sendToMain} from "../utils/dataSender";
import {computed, ref} from "vue";
import {
  Change_Image,
  Execute_Cmd,
  Get_ClipBoard_Type,
  Get_System_File_Path,
  Reset_Short_Key,
  Set_Short_Keys,
  Sys_Notification
} from "../utils/events/constants";
import {DBList, IWindowList} from "../../electron/main/types/enum";

const platform = computed(() => process.platform); // 获取当前的操作系统


// 【start】----------- 全局状态获取 -----------【start】
const titleStore = useTitleStore()
const computedStoreTitle = computed(() => titleStore.title)
const persistStoreTestCount = computed(() => persistStoreTest.state.count)
const storeClick = () => console.log(titleStore.title)
// 【end】---------------------- 全局状态获取 ----------------------【end】


// 【start】----------- main线程与renderer线程通信 -----------【start】
function ipcRenderInvokeTest() {
  // invoke方法会返回一个promise对象，可以通过then方法获取返回值。可以通过catch捕获主进程处理函数抛出的错误。
  ipcRenderer.invoke('ping', '[invoke]ping').then((arg: {msg: string}) => {
    console.log(arg)
  })
}

function ipcRenderSendTest() {
  sendToMain('ping', '[send]ping') // 通过异步事件发送消息。只需要向主进程发送消息，可以使用ipcRenderer.send方法

  // send方法不会返回任何结果，send方法不提供错误处理机制
  ipcRenderer.on('ping-replay', (event: IpcRendererEvent, arg: {msg: string}) => {
    console.log(arg)
  })
}
// 【end】---------------------- main线程与renderer线程通信 ----------------------【end】


// 【start】----------- 全局数据持久化 -----------【start】
const persistStoreTest = usePersistStoreTest();
function addPersistStoreTest() {
  persistStoreTest.state.count++
}
// 【end】---------------------- 全局数据持久化 ----------------------【end】


// 【start】----------- 动态修改快捷键 -----------【start】
// TODO: 可能会与现有的快捷键冲突，例如：ctrl + shift + c 唤起了gif窗口的F12
const shortcut = ref('')
const placeholder = ref('点击input框按下快捷键')
const oldKeys = ref('')
function  inputBlur () {
  placeholder.value = '点击设置快捷键'
  const formatKeys = shortcut.value.replace('\ue672', 'CommandOrControl')
  const keyArr = formatKeys.split('+')
  if (formatKeys && keyArr.slice(-1)[0].trim()) {
    // 将设置好的截图快捷键发送给主进程，让其重新设置
    let params = {
      new: formatKeys,
      old: oldKeys.value
    }
    oldKeys.value = formatKeys
    ipcRenderer.send(Set_Short_Keys, params)

    // TODO: persist short key
    console.log(`shortKey:`, params)
  }
}

function getShortKeys(e: KeyboardEvent) {
  e.preventDefault();
  // ====== 禁止上下左右按键 ===== start
  const list = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

  if(list.includes(e.key)) return;

  // ====== 禁止上下左右按键 =====
  const str: string = shortcut.value
  // 获取用户有没有按下特殊按键【'Control', 'Alt', 'Shift', 'Meta'】
  const auxiliaryKey = [(e.ctrlKey ? 'Ctrl' : ''), (e.altKey ? 'Alt' : ''), (e.shiftKey ? 'Shift' : ''), (e.metaKey ? '\ue672' : '')].filter(t => t)

  const someKeys = ['Control', 'Alt', 'Shift', 'Meta']

  // mac下禁止使用快捷键option
  let publicKey = someKeys.indexOf(e.key) < 0 ? e.key.toLocaleUpperCase() : ''
  if(platform.value === 'darwin' && e.altKey) {
    publicKey = ''
  }
  if (auxiliaryKey.length) {
    shortcut.value = auxiliaryKey.join('+') + '+' + publicKey
  } else {
    shortcut.value = str.substring(0, str.lastIndexOf('+') + 1) + publicKey
  }
}

function clearAllShortKey() {
  if(oldKeys.value !== '') ipcRenderer.send(Reset_Short_Key, oldKeys.value)
}
// 【end】--------------------- 动态修改快捷键 ----------------------【end】


// 【start】----------- 获取系统文件路径 -----------【start】
const dirPath = ref('')
function getSystemDirPath() {
  sendToMain(Get_System_File_Path)
  ipcRenderer.on(Get_System_File_Path, (event: IpcRendererEvent, arg: {path: string}) => {
    console.log(`[renderer][on:${Get_System_File_Path}]获取到的文件夹路径:`, arg.path)
    dirPath.value = arg.path
  })
}
// 【end】---------------------- 获取系统文件路径 ----------------------【end】

// 【start】----------- 获取剪贴板内容 -----------【start】
const clipBoardType = ref('')
function getClipBoardType() {
  ipcRenderer.invoke(Get_ClipBoard_Type).then((arg) => {
    console.log(`[renderer][on:Get_ClipBoard_Type]获取到的剪贴板信息:`, arg)
    clipBoardType.value = arg;
  }).catch((err) => {
    alert(`获取到的剪贴板信息 err:${JSON.stringify(err)}`)
  });
}
// 【end】---------------------- 获取剪贴板内容 ----------------------【end】

// 【start】----------- main与renderer线程的系统通知 -----------【start】
function showSysNotification() {
  ipcRenderer.send(Sys_Notification, {
    title: '系统通知',
    body: '这是一个main线程触发的通知',
  })

  const NOTIFICATION_TITLE = 'Title'
  const NOTIFICATION_BODY = 'Notification from the Renderer process. Click to log to console.'
  new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY })
}
// 【end】---------------------- main与renderer线程的系统通知 ----------------------【end】

// 【start】----------- 更改Pet的gif展示 -----------【start】
function changeImage() {
  ipcRenderer.send(Change_Image, '[from detail/send] from detail.vue send to main thread')
}
// 【end】---------------------- 更改Pet的gif展示 ----------------------【end】

// 【start】----------- 运行cmd -----------【start】
let cmd = ref("\"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe\" --chrome-frame --incognito --app=https://www.baidu.com");
function executeCmd() {
  ipcRenderer.send(Execute_Cmd, cmd.value)
}

// 下面是分离exe与params的写法，main线程用的child_process.execFile来运行
// let exePath = ref('C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe')
// let parameters = ref("--incognito");
// function openExecutableFile() {
//   let args = {
//     executablePath: exePath.value,
//     parameters: parameters.value.split("|")
//     // --incognito|--window-size="1080,1000"|--window-position="0,0" 为啥不行
//     // "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --chrome-frame --app=https://www.baidu.com
//   };
//   console.log(`exe arg: `, args)
//   ipcRenderer.send('cmd', args)
// }
// 【end】----------- 运行cmd -----------【end】

// 【start】----------- 打开配置文件 -----------【start】
function openConfigFile() {
  ipcRenderer.send('open-file', 'data.json');
}
// 【end】----------- 打开配置文件 -----------【end】

// 【start】----------- 配置文件的CRUD -----------【start】
let dbGetContent = ref('')
let dbKey = ref('');// 要获取的db key对应的内容
function dbGetKey() {
  ipcRenderer.invoke('db-get', {db: DBList.Config_DB, key: dbKey.value}).then(res => {
    dbGetContent.value = JSON.stringify(res)
  })
}

function dbRead() {
  ipcRenderer.invoke('db-read', {db: DBList.Config_DB}).then(res => {
    dbGetContent.value = JSON.stringify(res)
  })
}

let key = ref('')
let value = ref('')
function dbSet() {
  ipcRenderer.send('db-set', {db: DBList.Config_DB, key: key.value, value: value.value})
}

let keyToDelete = ref('')
function dbDelete() {
  ipcRenderer.send('db-delete', {db: DBList.Config_DB, key: keyToDelete.value})
}
// 【end】----------- 配置文件的CRUD -----------【end】

// 【start】
function pushRouter() {
  ipcRenderer.send('router', {window: IWindowList.PET_DETAIL_WINDOW, hash: 'chatgpt'})
}
</script>

<style scoped lang="less">
.el-divider--horizontal{
  margin: 10px;
}
</style>

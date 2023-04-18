import { lstat } from 'node:fs/promises'
import { cwd } from 'node:process'
import { ipcRenderer } from 'electron'


ipcRenderer.on('main-process-message', (_event, ...args) => {
  // logger('[Receive Main-process message]:', ...args)
})

lstat(cwd()).then(stats => {
  // logger('[fs.lstat]', stats)
}).catch(err => {
  // console.error(err)
})

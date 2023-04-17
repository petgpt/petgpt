import { lstat } from 'node:fs/promises'
import { cwd } from 'node:process'
import { ipcRenderer } from 'electron'
import log from "electron-log";

ipcRenderer.on('main-process-message', (_event, ...args) => {
  // log.info('[Receive Main-process message]:', ...args)
})

lstat(cwd()).then(stats => {
  // log.info('[fs.lstat]', stats)
}).catch(err => {
  log.error(err)
})

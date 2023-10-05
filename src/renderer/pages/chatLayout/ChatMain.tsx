import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ChatFooter from './ChatFooter';
import ChatText from './ChatText';
import { ipcRenderer } from "electron";
import { sendToMain } from "../../utils/common";
import { useLocalStorage } from "@uidotdev/usehooks";

type ChatMainProps = {
}

const ChatMain = (props: ChatMainProps) => {
  const scrollBar = useRef(null);
  const [chatStore, setChatStore] = useLocalStorage<{ activePluginIndex: string; activePluginNameList: string[]; }>('chatStore');
  const chatFooter = useRef<{
    reloadChat: () => void,
    continueChat: () => void,
  }>();

  const chatText = useRef<{
    upsertLatestText: (message: ChatItem) => void,
    clearChatContext: (isClearContext: boolean) => void,
    deleteLastText: () => void,
  }>();
  const [currentPluginSlotInfo, setCurrentPluginSlotInfo] = useState<SlotMenu[]>()
  const slotData = useState<any[]>([{}, {}, {}, {}, {}])
  const [pluginSlotInfoList, setPluginSlotInfoList] = useState([])

  // 通过监听store的变化，来替代之前通过ref几方透传的方案。
  useEffect(() => {
    // console.log(`订阅chatStore的更新: `, chatStore)
    changePluginHandler(true);
    return () => {
      // TODO: unregister old plugin? 怎么获取到chatStore变化前的值?
    }
  }, [chatStore.activePluginIndex]);

  function onChatUpdateScrollHandler() {
    setTimeout(() => {
      const scrollElement = document.getElementById('image-wrapper');
      scrollElement?.scrollTo({
        // @ts-ignore
        top: scrollBar.current?.scrollHeight,
      });
    })
  }

  function onReloadLatestChatHandler() {
    chatFooter.current?.reloadChat();
  }

  function onContinueChatHandler() {
    chatFooter.current?.continueChat();
  }

  function clearChatHandler() {
    chatText.current?.clearChatContext(true)
  }

  function upsertLatestText(arg: any) {
    chatText.current?.upsertLatestText(arg)
  }

  function deleteLastMsgHandler() {
    chatText.current?.deleteLastText()
  }

  function changePluginHandler(isClearContext: boolean) {
    fetchSlotData()
    chatText.current?.clearChatContext(isClearContext)
    initCurrentPluginClient()
  }

  function initCurrentPluginClient() {
    setTimeout(() => {
      let pureName = chatStore?.activePluginNameList[+chatStore.activePluginIndex];
      // console.log(`plugin.init, name: `, pureName, ` chatStore: `, chatStore)
      sendToMain('plugin.init', pureName)
    })
  }

  /**
   * 重新获取插件的slotMenu定义
   */
  async function fetchSlotData() {
    // 从main线程获取slot的信息
    await getPluginSlotMenu()
    buildSlotData(currentPluginSlotInfo)
  }

  // switch的slot: {value: boolean}。默认值：如果menu.value有值，那么就是默认值
// select: {value: string}, 选中的就是当前的label对应的value。默认值：第一个label的value
// dialog: {value: [{name: string, value: string}]}。默认值：name为menu.child[x].name, value为menu.child[x].default
// TODO:upload?: {value: string}。默认值：menu.value
  function buildSlotData(currentPluginSlotMenuList: SlotMenu[] | undefined) {
    // slotData.forEach((slot, index) => {
    //   slotData[index] = {}
    // })

    currentPluginSlotMenuList?.forEach((slotMenu, index) => {
      // logger(`当前的slotMenu:`, slotMenu, `, index:${index}`)
      if (slotMenu.menu.type === 'switch') {
        slotData[index] = {
          // @ts-ignore
          type: 'switch',
          value: slotMenu.menu.value || false,
        }
      } else if (slotMenu.menu.type === 'select') {
        slotData[index] = {
          // @ts-ignore
          type: 'select',
          options: slotMenu.menu.child?.map((child: any) => {
            // options是渲染select的数据
            return { label: child.name, value: child.value }
          }),
          value: slotMenu.menu.value || slotMenu.menu.child?.[0].value, // 如果传来的value有东西，那么就是select默认选中的值，否则就是第一个
        }
      } else if (slotMenu.menu.type === 'dialog') {
        slotData[index] = {
          // @ts-ignore
          type: 'dialog',
          value: slotMenu.menu.child?.map((child: any) => {
            return { name: child.name, value: child.default, message: child.message }
          }),
        }
      } else if (slotMenu.menu.type === 'upload') {
        // slotData[index] = {value: slotMenu.menu.value}
      }
    })
  }

  async function getPluginSlotMenu() {
    await ipcRenderer.invoke('plugin.getSlotMenu').then(infoList => {
      setPluginSlotInfoList(infoList);
      setCurrentPluginSlotInfo(infoList[chatStore?.activePluginIndex!]?.menu);
    })
  }

  return (
    <div className="main-and-footer-container flex w-fit flex-1 flex-col pb-1 pr-2">
      <div
        id="image-wrapper"
        ref={scrollBar}
        className="el-main m-1 flex h-full w-[70] flex-col overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded"
      >
        <div className="el-scrollbar">
          {<ChatText ref={chatText} onChatUpdate={onChatUpdateScrollHandler}
                     onReloadLatestChat={onReloadLatestChatHandler}
                     onContinueChat={onContinueChatHandler} />}
        </div>
      </div>
      <div className="el-footer flex flex-col content-center justify-end">
        {<ChatFooter ref={chatFooter} clearCurrentChat={clearChatHandler}
                     upsertLatestText={upsertLatestText}
                     deleteLastMsg={deleteLastMsgHandler}></ChatFooter>}
      </div>
    </div>
  );
}

export default ChatMain;

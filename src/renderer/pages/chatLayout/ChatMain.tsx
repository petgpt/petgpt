import React, { useEffect, useRef, useState } from 'react';
import ChatFooter from './ChatFooter';
import ChatText from './ChatText';
import { ipcRenderer } from "electron";
import { logger, sendToMain } from "../../utils/common";
import { useLocalStorage } from "@uidotdev/usehooks";

const ChatMain = () => {
  const scrollBar = useRef(null);
  const [chatStore, setChatStore] = useLocalStorage<{
    activePluginIndex: string;
    activePluginNameList: string[];
  }>('chatStore');
  const chatFooter = useRef<{
    reloadChat: () => void,
    continueChat: () => void,
  }>();

  const chatText = useRef<{
    upsertLatestText: (message: ChatItem) => void,
    clearChatContext: (isClearContext: boolean) => void,
    deleteLastText: () => void,
  }>();
  const [currentPluginSlotInfo, setCurrentPluginSlotInfo] = useState<SlotMenu[]>();
  const slotDataRef = useRef<any[]>([{}, {}, {}, {}, {}]);
  const [slotDataRefUpdate, setSlotDataRefUpdate] = useState(0);

  const [pluginSlotInfoList, setPluginSlotInfoList] = useState([]);
  const [centerDialogVisible, setCenterDialogVisible] = useState(false);

  // 通过监听store的变化，来替代之前通过ref几方透传的方案。
  useEffect(() => {
    // console.log(`订阅chatStore的更新: `, chatStore)
    changePluginHandler(true);
    return () => {
      // TODO: unregister old plugin? 怎么获取到chatStore变化前的值?
    }
  }, [chatStore.activePluginIndex]);

  useEffect(() => {
    if (currentPluginSlotInfo) buildSlotData(currentPluginSlotInfo)
  }, [currentPluginSlotInfo]);

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
  }

  function updateSlotDataRef(fn: () => void) {
    fn();
    setSlotDataRefUpdate(prevState => prevState + 1);
  }

  // switch的slot: {value: boolean}。默认值：如果menu.value有值，那么就是默认值
// select: {value: string}, 选中的就是当前的label对应的value。默认值：第一个label的value
// dialog: {value: [{name: string, value: string}]}。默认值：name为menu.child[x].name, value为menu.child[x].default
// TODO:upload?: {value: string}。默认值：menu.value
  function buildSlotData(currentPluginSlotMenuList: SlotMenu[] | undefined) {
    currentPluginSlotMenuList?.forEach((slotMenu, index) => {
      // logger(`当前的slotMenu:`, slotMenu, `, index:${index}`)
      if (slotMenu.menu.type === 'switch') {
        updateSlotDataRef(() => {
          slotDataRef.current[index] = {
            type: 'switch',
            value: slotMenu.menu.value || false,
          }
        });
      } else if (slotMenu.menu.type === 'select') {
        updateSlotDataRef(() => {
          slotDataRef.current[index] = {
            type: 'select',
            options: slotMenu.menu.child?.map((child: any) => {
              // options是渲染select的数据
              return { label: child.name, value: child.value }
            }),
            value: slotMenu.menu.value || slotMenu.menu.child?.[0].value, // 如果传来的value有东西，那么就是select默认选中的值，否则就是第一个
          }
        });
      } else if (slotMenu.menu.type === 'dialog') {
        updateSlotDataRef(() => {
          slotDataRef.current[index] = {
            type: 'dialog',
            value: slotMenu.menu.child?.map((child: any) => {
              return { name: child.name, value: child.default, message: child.message }
            }),
          }
        })
      } else if (slotMenu.menu.type === 'upload') {
        // slotData[index] = {value: slotMenu.menu.value}
      }
    })
    console.log(`currentPluginSlotMenuList: `, currentPluginSlotMenuList, ` slotData: `, slotDataRef.current)
  }

  async function getPluginSlotMenu() {
    await ipcRenderer.invoke('plugin.getSlotMenu').then(infoList => {
      setPluginSlotInfoList(infoList);
      setCurrentPluginSlotInfo(infoList[chatStore?.activePluginIndex!]?.menu);
    })
  }

  function closeHandler() {
    setCenterDialogVisible(false);
  }

  function confirmHandler(data: any) {
    logger(`click slot confirm, data:`, data)
    setCenterDialogVisible(false);
    slotUpdateHandler();
  }

  function slotUpdateHandler() {
    const pluginPureName = chatStore?.activePluginNameList[+chatStore.activePluginIndex];
    let channel = `plugin.${pluginPureName}.slot.push`;
    console.log(`[slot udpate]channel: `, channel, ` slotDataRef.current: `, slotDataRef.current)
    sendToMain(channel, slotDataRef.current);
  }

  const slots = () => {
    return (
      <>
        {
          currentPluginSlotInfo?.map((slotInfo, index) => {
            return (
              <div className="tooltip" data-tip={slotInfo.description} key={index}>
                {slotInfo.menu.type === 'dialog' ? (
                  <div className="flex w-full flex-col items-center">
                    <svg
                      onClick={() => setCenterDialogVisible(true)}
                      className="cursor-pointer"
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                    >
                      <g fill="none">
                        <path
                          d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
                        ></path>
                        <path
                          fill="currentColor"
                          d="M14.41 2.293a9.947 9.947 0 0 1 2.75 1.14a1 1 0 0 1 .47 1.019c-.113.689.058 1.216.38 1.538c.322.322.85.493 1.538.38a1 1 0 0 1 1.019.47a9.945 9.945 0 0 1 1.14 2.75a1 1 0 0 1-.388 1.054c-.567.407-.82.9-.82 1.356c0 .456.253.95.82 1.357a1 1 0 0 1 .388 1.053a9.947 9.947 0 0 1-1.14 2.75a1 1 0 0 1-1.019.47c-.689-.113-1.216.059-1.538.38c-.322.322-.493.85-.38 1.538a1 1 0 0 1-.47 1.02a9.948 9.948 0 0 1-2.75 1.14a1 1 0 0 1-1.054-.388c-.407-.568-.9-.82-1.356-.82c-.456 0-.95.252-1.357.82a1 1 0 0 1-1.053.388a9.948 9.948 0 0 1-2.75-1.14a1 1 0 0 1-.47-1.02c.113-.688-.059-1.215-.38-1.537c-.323-.322-.85-.494-1.538-.38a1 1 0 0 1-1.02-.47a9.948 9.948 0 0 1-1.14-2.752a1 1 0 0 1 .388-1.053c.568-.406.82-.9.82-1.356c0-.455-.252-.95-.82-1.356a1 1 0 0 1-.388-1.053a9.947 9.947 0 0 1 1.14-2.751a1 1 0 0 1 1.02-.47c.688.113 1.215-.058 1.537-.38c.322-.322.494-.85.38-1.538a1 1 0 0 1 .47-1.019a9.946 9.946 0 0 1 2.751-1.14a1 1 0 0 1 1.053.388c.407.567.901.82 1.357.82c.455 0 .95-.253 1.356-.82a1 1 0 0 1 1.053-.388ZM12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6a3 3 0 0 1 0-6Z"
                        ></path>
                      </g>
                    </svg>
                    <dialog className={centerDialogVisible ? 'modal modal-open' : 'modal'}>
                      <form method="dialog" className="modal-box">
                        <h3 className="text-lg font-bold">{slotInfo.description}</h3>
                        <div className="flex flex-col content-start items-start">
                          {
                            slotDataRef.current[index]?.value?.map((dialogInfo: any, dialogInfoIndex: number) => {
                              return (
                                <div className="tooltip w-full tooltip-bottom" data-tip={dialogInfo.message}
                                     key={dialogInfoIndex}>
                                  <div className="form-control mt-1 w-full">
                                    <label className="input-group">
                                      <span className="w-full">{dialogInfo.name}：</span>
                                      <input type="text" placeholder={dialogInfo.name}
                                             className="input input-bordered input-xs w-full"
                                             value={slotDataRef.current[index].value[dialogInfoIndex].value}
                                             onChange={(e) => {
                                               updateSlotDataRef(() => {
                                                 slotDataRef.current[index].value[dialogInfoIndex].value = e.target.value;
                                               })
                                             }}/>
                                    </label>
                                  </div>
                                </div>
                              );
                            })
                          }
                        </div>
                        <div className="modal-action">
                          <button className="btn-info btn-sm btn" onClick={closeHandler}>close</button>
                          <button className="btn-info btn-sm btn"
                                  onClick={() => confirmHandler(slotDataRef.current)}>confirm
                          </button>
                        </div>
                      </form>
                    </dialog>
                  </div>
                ) : null}
                {slotInfo.menu.type === 'switch' ? (
                  <div className="flex w-full flex-col items-center">
                    {slotDataRef.current[index]?.value != undefined ? (
                      <input
                        onClick={() => {
                        }}
                        type="checkbox"
                        className="toggle toggle-xs ml-1"
                        onChange={(e) => {
                          updateSlotDataRef(() => {
                            slotDataRef.current[index].value = e.target.checked;
                            console.log(`slotDataRef.current[index].value: `, slotDataRef.current[index].value);
                            console.log(`e.target.checked: `, e.target.checked);
                            console.log(`slotDataRef: `, slotDataRef.current);
                          })
                          slotUpdateHandler();
                        }}
                        checked={slotDataRef.current[index]?.value}
                      />
                    ) : null}
                  </div>
                ) : null}
                {slotInfo.menu.type === 'select' ? (
                  <div className="ml-2 flex w-full flex-col items-center">
                    <select className="select select-bordered select-xs w-full max-w-xs"
                            value={slotDataRef.current[index]?.value}
                            onChange={(e) => {
                              console.log(`select的 onChange`, e.target.value)
                              updateSlotDataRef(() => {
                                slotDataRef.current[index].value = e.target.value;
                              })
                              slotUpdateHandler();
                            }}>
                      {
                        slotDataRef.current[index]?.options?.map((item: any, index: number) => {
                          return <option key={index}>{item.value}</option>
                        })
                      }
                    </select>
                  </div>
                ) : null}
              </div>
            );
          })
        }
      </>
    );
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
                     onContinueChat={onContinueChatHandler}/>}
        </div>
      </div>
      <div className="el-footer flex flex-col content-center justify-end">
        {<ChatFooter ref={chatFooter} clearCurrentChat={clearChatHandler}
                     upsertLatestText={upsertLatestText}
                     deleteLastMsg={deleteLastMsgHandler} children={slots()}></ChatFooter>}
      </div>
    </div>
  );
}

export default ChatMain;

import { useEffect, useState } from 'react';
import { ipcRenderer } from "electron";
import { logger } from "../../utils/common";
import { useLocalStorage } from "@uidotdev/usehooks";

function ChatAside() {
  // useEffect(() => {
  //   .ipcRenderer
  //     .invoke('plugin.getAllPluginName')
  //     .then((res) => {
  //       console.log(`plugins: `, res);
  //       return res;
  //     })
  //     .catch((e) => {
  //       throw e;
  //     });
  // }, []);

  const [pluginsConfigList, setPluginsConfigList] = useState<PluginInfo[]>([])
  const [defaultActiveMenu, setDefaultActiveMenu] = useState('0')
  const [chatStore, setChatStore] = useLocalStorage<{
    activePluginIndex: string;
    activePluginNameList: string[];
  }>('chatStore');

  useEffect(() => {
    setDefaultActiveMenu(chatStore?.activePluginIndex || '0');
    // logger(`defaultActiveMenu:`, defaultActiveMenu.value)
    getPluginsNameList().then((pluginsConfigs) => {
      const purePluginNameList = pluginsConfigs.map(info => info.name)
      setTimeout(() => {
        let chatStoreToSet = {
          activePluginIndex: chatStore?.activePluginIndex || '0',
          activePluginNameList: purePluginNameList
        };
        // console.log(`chatStoreToSet: `, chatStoreToSet)
        setChatStore(chatStoreToSet)
      })
    })
  }, []);

  async function getPluginsNameList() {
    const pluginInfoList: {
      name: string;
      version: string;
      description: string;
      config: any;
      enabled: boolean;
    }[] = await ipcRenderer.invoke('plugin.getAllPluginName');
    const pluginsConfigs = pluginInfoList
      .filter((pluginInfo) => pluginInfo.enabled)
      .map(p => {
        return {
          name: p.name,
          version: p.version,
          description: p.description,
          config: p.config,
          enabled: p.enabled,
        }
      });
    setPluginsConfigList(pluginsConfigs);
    return pluginsConfigs; // 这里和之前不一样返回了，因为setPluginsConfigList之后，后面.then直接读state还是空的，所以这里返回给后面用。
    // for (const pluginInfo of pluginInfoList) {
    //   if (pluginInfo.enabled) {
    //     pluginsConfigList.value.push({
    //       name: pluginInfo.name,
    //       version: pluginInfo.version,
    //       description: pluginInfo.description,
    //       config: pluginInfo.config,
    //       enabled: pluginInfo.enabled,
    //     })
    //   }
    // }
    // logger(`aside, pluginInfoList：`, pluginInfoList, ` pluginsConfigList:`, pluginsConfigList.value)
  }

  function onPluginClick(index: number) {
    if (chatStore?.activePluginIndex !== index + '') {
      // remove chatStore.state.activePluginIndex active class and add to index
      let activePluginIndex = document.querySelector(`#aside-menu .active`)
      if (activePluginIndex) {
        activePluginIndex.classList.remove('active')
      }
      let activePluginIndexEle = document.querySelector(`#aside-menu li:nth-child(${index + 1}) a`)
      if (activePluginIndexEle) {
        activePluginIndexEle.classList.add('active')
      }
    }
    logger(`click: `, index)
    setChatStore({
      activePluginIndex: index + '',
      activePluginNameList: chatStore?.activePluginNameList || []
    });
  }

  return (
    <div className="hover:bg-base-300">
      <ul id="aside-menu" className="menu border-r-2 border-r-neutral-content">
        {pluginsConfigList.map((info, index) => {
          return (
            <li key={index}>
              <a className={defaultActiveMenu === (index + '') ? 'active' : ''}
                 onClick={e => onPluginClick(index)}>{info.name}</a>
            </li>
          )
        })}
      </ul>
    </div>
  );
}

export default ChatAside;

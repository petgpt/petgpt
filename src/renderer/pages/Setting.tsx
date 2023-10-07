import React, { CSSProperties, useEffect, useState } from 'react';
import { logger, sendToMain } from '../utils/common';
import { ipcRenderer } from "electron";

interface ModalProperties extends CSSProperties {
  modalOpen: boolean;
}

function PluginSettingSVG(props: { onClick: () => Promise<void> }) {
  return <svg
    onClick={props.onClick}
    className="cursor-pointer"
    xmlns="http://www.w3.org/2000/svg"
    width="17px"
    height="17px"
    viewBox="0 0 24 24"
  >
    <g fill="none">
      <path
        d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
      <path
        fill="currentColor"
        d="M14.41 2.293a9.947 9.947 0 0 1 2.75 1.14a1 1 0 0 1 .47 1.019c-.113.689.058 1.216.38 1.538c.322.322.85.493 1.538.38a1 1 0 0 1 1.019.47a9.945 9.945 0 0 1 1.14 2.75a1 1 0 0 1-.388 1.054c-.567.407-.82.9-.82 1.356c0 .456.253.95.82 1.357a1 1 0 0 1 .388 1.053a9.947 9.947 0 0 1-1.14 2.75a1 1 0 0 1-1.019.47c-.689-.113-1.216.059-1.538.38c-.322.322-.493.85-.38 1.538a1 1 0 0 1-.47 1.02a9.948 9.948 0 0 1-2.75 1.14a1 1 0 0 1-1.054-.388c-.407-.568-.9-.82-1.356-.82c-.456 0-.95.252-1.357.82a1 1 0 0 1-1.053.388a9.948 9.948 0 0 1-2.75-1.14a1 1 0 0 1-.47-1.02c.113-.688-.059-1.215-.38-1.537c-.323-.322-.85-.494-1.538-.38a1 1 0 0 1-1.02-.47a9.948 9.948 0 0 1-1.14-2.752a1 1 0 0 1 .388-1.053c.568-.406.82-.9.82-1.356c0-.455-.252-.95-.82-1.356a1 1 0 0 1-.388-1.053a9.947 9.947 0 0 1 1.14-2.751a1 1 0 0 1 1.02-.47c.688.113 1.215-.058 1.537-.38c.322-.322.494-.85.38-1.538a1 1 0 0 1 .47-1.019a9.946 9.946 0 0 1 2.751-1.14a1 1 0 0 1 1.053.388c.407.567.901.82 1.357.82c.455 0 .95-.253 1.356-.82a1 1 0 0 1 1.053-.388ZM12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6a3 3 0 0 1 0-6Z"
      />
    </g>
  </svg>;
}

function PluginUpdateSVG(props: { onClick: () => void }) {
  return <svg
    onClick={props.onClick}
    className="ml-1 cursor-pointer"
    xmlns="http://www.w3.org/2000/svg"
    width="17px"
    height="17px"
    viewBox="0 0 24 24"
  >
    <g fill="none">
      <path
        d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
      <path
        fill="currentColor"
        d="M2 12.08c-.006-.862.91-1.356 1.618-.975l.095.058l2.678 1.804c.972.655.377 2.143-.734 2.007l-.117-.02l-1.063-.234a8.002 8.002 0 0 0 14.804.605a1 1 0 0 1 1.82.828c-1.987 4.37-6.896 6.793-11.687 5.509A10.003 10.003 0 0 1 2 12.08Zm.903-4.228C4.89 3.482 9.799 1.06 14.59 2.343a10.002 10.002 0 0 1 7.414 9.581c.007.863-.91 1.358-1.617.976l-.096-.058l-2.678-1.804c-.972-.655-.377-2.143.734-2.007l.117.02l1.063.234A8.002 8.002 0 0 0 4.723 8.68a1 1 0 1 1-1.82-.828Z"
      />
    </g>
  </svg>;
}

function PluginDeleteSVG(props: { onClick: () => void }) {
  return <svg
    onClick={props.onClick}
    className="ml-1 cursor-pointer"
    xmlns="http://www.w3.org/2000/svg"
    width="17px"
    height="17px"
    viewBox="0 0 24 24"
  >
    <g fill="none" fillRule="evenodd">
      <path
        d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
      <path
        fill="currentColor"
        d="M14.28 2a2 2 0 0 1 1.897 1.368L16.72 5H20a1 1 0 1 1 0 2l-.003.071l-.867 12.143A3 3 0 0 1 16.138 22H7.862a3 3 0 0 1-2.992-2.786L4.003 7.07A1.01 1.01 0 0 1 4 7a1 1 0 0 1 0-2h3.28l.543-1.632A2 2 0 0 1 9.721 2h4.558ZM9 10a1 1 0 0 0-.993.883L8 11v6a1 1 0 0 0 1.993.117L10 17v-6a1 1 0 0 0-1-1Zm6 0a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1Zm-.72-6H9.72l-.333 1h5.226l-.334-1Z"
      />
    </g>
  </svg>;
}

function PluginSettingBody(props: { info: PluginInfo, onSettingClick: () => Promise<void>, onUpdateClick: () => void, onDeleteClick: () => void, onPluginEnableClick: () => void }) {
  return <div className="card w-64 bg-base-100 shadow-md">
    <div className="card-body">
      <div
        className="tooltip tooltip-top"
        data-tip={`${props.info.name}-${props.info.version}`}
      >
        <div className="flex flex-row">
          <div className="card-title truncate">
            {props.info.name} - {props.info.version}
          </div>
        </div>
      </div>
      <div
        className="tooltip tooltip-top"
        data-tip={props.info.description}
      >
        <div className="flex flex-row">
          <div className="truncate">{props.info.description}</div>
        </div>
      </div>
      <div className="flex flex-row justify-start">
        <div className="tooltip tooltip-top" data-tip="设置">
          <div className="flex flex-row">
            <PluginSettingSVG onClick={props.onSettingClick}/>
          </div>
        </div>
        <div
          className="tooltip tooltip-top"
          data-tip="更新插件"
        >
          <div className="flex flex-row">
            <PluginUpdateSVG onClick={props.onUpdateClick}/>
          </div>
        </div>
        <div
          className="tooltip tooltip-top"
          data-tip="删除插件"
        >
          <div className="flex flex-row">
            <PluginDeleteSVG onClick={props.onDeleteClick}/>
          </div>
        </div>
        <div
          className="tooltip tooltip-top"
          data-tip="是否开启插件"
        >
          <div className="flex flex-row">
            <input
              onClick={props.onPluginEnableClick}
              type="checkbox"
              className="toggle toggle-xs ml-1"
              // @ts-ignore 这里使用的ui组件
              value={props.info.enabled}
            />
          </div>
        </div>
      </div>
    </div>
  </div>;
}

function ModalActions(props: { onClose: () => void, onConfirm: () => void }) {
  return <div className="modal-action">
    <button className="btn" onClick={props.onClose}>
      Close
    </button>
    <button className="btn" onClick={props.onConfirm}>
      confirm
    </button>
  </div>;
}

function ModalConfigs(props: { configItem: IPluginConfig, dialogModelData: Record<any, string>, onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  return <div className="flex flex-row justify-start">
    <div className="form-control mt-1 w-full">
      <label className="input-group">
        <span className="w-full">{props.configItem.name}：</span>
        <input
          type="text"
          placeholder={props.configItem.name}
          className="input input-bordered input-xs w-full"
          value={props.dialogModelData[props.configItem.name]}
          onChange={props.onChange}
        />
      </label>
    </div>
  </div>;
}

function SettingPluginInstaller(props: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, installPercentage: number, installStatus: string, onClick: () => void }) {
  return <div className="setting-actions flex">
    <div className="setting-actions-input flex w-5/6 flex-col">
      <input
        type="text"
        value={props.value}
        onChange={props.onChange}
        placeholder="plugin name to install, like: template/chatgpt"
        className="setting-actions-item input-bordered input w-full"
      />
      {props.installPercentage !== 0 ? (
        <progress
          className={
            props.installStatus === ""
              ? "progress ml-1 w-56 progress-info"
              : props.installStatus === "success"
                ? "progress ml-1 w-56 progress-success"
                : "progress ml-1 w-56 progress-error"
          }
          value={props.installPercentage}
          max="100"
        />
      ) : null}
    </div>
    <div className="ml-1 w-1/6">
      <button
        className="setting-actions-button setting-actions-item btn-info btn"
        onClick={props.onClick}
      >
        install
      </button>
    </div>
  </div>;
}

function PluginStateProgress(props: { progresses: Progress[], index: number, installStatus: string }) {
  return <>
    {props.progresses[props.index].percentage !== 0 ? (
      <progress
        className={
          props.progresses[props.index].status === ""
            ? "progress ml-1 w-56 progress-info"
            : props.installStatus === "success"
              ? "progress ml-1 w-56 progress-success"
              : "progress ml-1 w-56 progress-error"
        }
        value={props.progresses[props.index].percentage}
        max="100"
      />
    ) : null}
  </>;
}

function Setting() {
  const [pluginNameToInstall, setPluginNameToInstall] = useState('');
  const [centerDialogVisible, setCenterDialogVisible] = useState(false);
  const [dialogConfigList, setDialogConfigList] = useState<IPluginConfig[]>([]);
  const [dialogModelData, setDialogModelData] = useState<Record<any, string>>(
    {},
  );
  const [pluginsConfigList, setPluginsConfigList] = useState<PluginInfo[]>([]);
  const [upOrDeleteProgress, setUpOrDeleteProgress] = useState<Progress[]>([]);
  const [installPercentage, setInstallPercentage] = useState(0);
  const [installStatus, setInstallStatus] = useState('');
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [currentRules, setCurrentRules] = useState<Rule[]>([]);

  useEffect(() => {
    (async function getPluginInfo() {
      await getPluginsNameList();
    })();

    ipcRenderer.on('installSuccess', (event, data) => {
      logger(
        `installSuccess: `,
        data,
        ` pluginsConfigList:`,
        pluginsConfigList,
      );
      getPluginsNameList();
      logger(`[after install success] pluginsConfigList:`, pluginsConfigList);
      setProgressSuccess('install');
    });

    ipcRenderer.on('uninstallSuccess', (event, data) => {
      logger(
        `uninstallSuccess: `,
        data,
        ` pluginsConfigList:`,
        pluginsConfigList,
      );
      setProgressSuccess('upOrDelete');
      getPluginsNameList();
      logger(`[after install success] pluginsConfigList:`, pluginsConfigList);
    });

    ipcRenderer.on('updateSuccess', (event, data) => {
      logger(`updateSuccess: `, data);
      setProgressSuccess('upOrDelete');
      getPluginsNameList();
    });

    // update \ delete 失败的时候，设置失败的进度条
    ipcRenderer.on('failedProgress', () => {
      upOrDeleteProgress.forEach((progress, index) => {
        if (progress.percentage > 0) {
          setProgressFailed('upOrDelete', index);
        }
      });
    });

    return () => {
      setPluginsConfigList([]);
      setUpOrDeleteProgress([]);
      ipcRenderer.removeAllListeners('installSuccess');
      ipcRenderer.removeAllListeners('uninstallSuccess');
      ipcRenderer.removeAllListeners('updateSuccess');
      ipcRenderer.removeAllListeners('failedProgress');
    };
  }, []);

  async function getPluginsNameList() {
    setPluginsConfigList([]);
    setUpOrDeleteProgress([]);

    const pluginInfoList = await ipcRenderer.invoke(
      'plugin.getAllPluginName',
    );
    const pluginsConfigList = pluginInfoList.map((pluginInfo: { name: any; version: any; description: any; config: any; enabled: any; }) => {
      return {
        name: pluginInfo.name,
        version: pluginInfo.version,
        description: pluginInfo.description,
        config: pluginInfo.config,
        enabled: pluginInfo.enabled,
      };
    });
    setPluginsConfigList(pluginsConfigList);

    const upOrDeleteProgressList = pluginInfoList.map((pluginInfo: { name: any; version: any; description: any; config: any; enabled: any; }) => {
      return { percentage: 0, status: '' };
    });
    setUpOrDeleteProgress(upOrDeleteProgressList);
  }

  function setProgressSuccess(type: 'install' | 'upOrDelete') {
    if (type === 'install') {
      setInstallPercentage(100);
      setInstallStatus('success');
    } else {
      upOrDeleteProgress.forEach((progress, index) => {
        if (progress.percentage > 0) {
          setUpOrDeleteProgress((prevState) => {
            const updatedArray = [...prevState];
            updatedArray[index] = { percentage: 100, status: 'success' };
            return updatedArray;
          });
        }
      });
    }
    setTimeout(() => {
      // clear progress status
      if (type === 'install') {
        setInstallPercentage(0);
        setInstallStatus('');
      } else {
        upOrDeleteProgress.forEach((progress, index) => {
          if (progress.percentage > 0) {
            setUpOrDeleteProgress((prevState) => {
              const updatedArray = [...prevState];
              updatedArray[index] = { percentage: 0, status: '' };
              return updatedArray;
            });
          }
        });
      }
    }, 1000);
  }

  function setProgressFailed(type: 'install' | 'upOrDelete', index: number) {
    if (type === 'install') {
      setInstallPercentage(100);
      setInstallStatus('exception');
    } else {
      setUpOrDeleteProgress((prevState) => {
        const updatedArray = [...prevState];
        updatedArray[index] = { percentage: 100, status: 'exception' };
        return updatedArray;
      });
    }
    setTimeout(() => {
      // clear progress status
      if (type === 'install') {
        setInstallPercentage(0);
        setInstallStatus('');
      } else {
        setUpOrDeleteProgress((prevState) => {
          const updatedArray = [...prevState];
          updatedArray[index] = { percentage: 0, status: '' };
          return updatedArray;
        });
      }
    }, 1000);
  }

  function closeHandler() {
    setCenterDialogVisible(false);
  }

  const getConfigByIndex = (index: number) => pluginsConfigList[index];

  function confirmHandler() {
    setCenterDialogVisible(false);

    const purePluginName = getConfigByIndex(currentConfigIndex).name;
    // logger(`name:${purePluginName}, configData: `, dialogModelData)
    sendToMain(`plugin.${purePluginName}.config.update`, {
      name: purePluginName,
      data: dialogModelData,
    });

    setPluginsConfigList([]);
    (async function getPluginInfo() {
      await getPluginsNameList();
    })();
  }

  function setProgressBegin(index: number) {
    setUpOrDeleteProgress((prevArray) => {
      // 复制原始数组
      const updatedArray = [...prevArray];
      // 根据索引更新值
      updatedArray[index] = { percentage: 10, status: '' };
      return updatedArray;
    });
  }

  function installPlugin() {
    sendToMain('installPlugin', pluginNameToInstall);
    setInstallPercentage(10);
  }

  function updatePlugin(index: number) {
    sendToMain('updatePlugin', getConfigByIndex(index).name);
    setProgressBegin(index);
  }

  function deletePlugin(index: number) {
    sendToMain('uninstallPlugin', getConfigByIndex(index).name);
    setProgressBegin(index);
  }

  function enablePlugin(enabled: boolean, index: number) {
    const { name } = getConfigByIndex(index);
    console.log(`enablePlugin: ${name}, enabled: ${enabled}`);
    sendToMain('enablePlugin', { name, enabled });
  }

  async function configClickHandler(index: number) {
    setDialogModelData({});
    setCurrentRules([]);

    setCurrentConfigIndex(index);
    setCenterDialogVisible(true);

    // 根据下标获取到某个插件的config信息
    const pluginConfigs = getConfigByIndex(index).config;
    setDialogConfigList(pluginConfigs);
    pluginConfigs.forEach((config) => {
      setCurrentRules((prevState) => {
        return [
          ...prevState,
          {
            required: config.required,
            message: config.required ? `${config.name}不能为空` : '',
            trigger: config.required ? 'blur' : 'none',
          },
        ];
      });

      setDialogModelData((prevState) => {
        return {
          ...prevState,
          [config.name]: config.value
            ? config.value
            : config.default
              ? config.default
              : '',
        };
      });
    });
  }

  return (
    <div>
      <div className="setting flex-col p-4">
        <SettingPluginInstaller value={pluginNameToInstall} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPluginNameToInstall(e.target.value)}
                                installPercentage={installPercentage} installStatus={installStatus}
                                onClick={installPlugin}/>
        <div className="setting-container mt-4 flex flex-row flex-wrap">
          {pluginsConfigList.map((info, index) => {
            return (
              <div className="setting-container-item m-1" key={index}>
                <div className="w-full">
                  <PluginSettingBody info={info} onSettingClick={() => configClickHandler(index)}
                                     onUpdateClick={() => updatePlugin(index)} onDeleteClick={() => deletePlugin(index)}
                                     onPluginEnableClick={() => enablePlugin(info.enabled, index)}/>
                  <PluginStateProgress progresses={upOrDeleteProgress} index={index} installStatus={installStatus}/>
                </div>
              </div>
            );
          })}
          {centerDialogVisible ? (
            <dialog className={centerDialogVisible ? 'modal modal-open' : 'modal'}>
              <form method="dialog" className="modal-box">
                <div>
                  <h3 className="text-lg font-bold">参数设置</h3>
                  {dialogConfigList?.map((configItem, index) => {
                    return (
                      <ModalConfigs key={index} configItem={configItem} dialogModelData={dialogModelData}
                                    onChange={(event) => setDialogModelData((prevState) => {
                                      return {
                                        ...prevState,
                                        [configItem.name]: event.target.value,
                                      };
                                    })}/>
                    );
                  })}
                </div>
                <ModalActions onClose={closeHandler} onConfirm={confirmHandler}/>
              </form>
            </dialog>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Setting;

import { useState } from 'react';

function PetDetail() {
  const [os, setOs] = useState<string>();
  const [platform, setPlatform] = useState<string>();
  const [computedStoreTitle, setComputedStoreTitle] = useState<string>();
  const [persistStoreTestCount, setPersistStoreTestCount] = useState<string>();
  const [shortcut, setShortcut] = useState<
    string | ReadonlyArray<string> | number | undefined
  >();
  const [placeholder, setPlaceholder] = useState<string | undefined>();
  const [dirPath, setDirPath] = useState<string>();
  const [clipBoardType, setClipBoardType] = useState<string>();
  const [cmd, setCmd] = useState<
    string | ReadonlyArray<string> | number | undefined
  >();
  const [dbGetContent, setDbGetContent] = useState<string>();
  const [dbKey, setDbKey] = useState<
    string | ReadonlyArray<string> | number | undefined
  >();
  const [key, setKey] = useState<
    string | ReadonlyArray<string> | number | undefined
  >();
  const [value, setValue] = useState<
    string | ReadonlyArray<string> | number | undefined
  >();
  const [keyToDelete, setKeyToDelete] = useState<
    string | ReadonlyArray<string> | number | undefined
  >();
  const [dragContent, setDragContent] = useState<string>();

  function pushRouter() {}

  function addPersistStoreTest() {}

  function ipcRenderInvokeTest() {}

  function ipcRenderSendTest() {}

  function inputBlur() {}

  function getShortKeys() {}

  function getSystemDirPath() {}

  function getClipBoardType() {}

  function showSysNotification() {}

  function changeImage() {}

  function executeCmd() {}

  function openConfigFile() {}

  function dbGetKey() {}

  function dbRead() {}

  function dbSet() {}

  function dbDelete() {}

  function startRecording() {}

  function stopRecording() {}

  return (
    <div>
      <div style={{ backgroundColor: 'red' }}>功能演示, 平台{platform}</div>
      <div>
        <button className="btn-info btn-xs btn" onClick={pushRouter}>
          跳转到Chatgpt页面
        </button>
        <div className="divider">divider</div>
        <div>
          获取全局状态title: {computedStoreTitle}
          <div>
            持久化状态count(存放在localStorage): {persistStoreTestCount}
            <button
              className="btn-info btn-xs btn"
              onClick={addPersistStoreTest}
            >
              点击+1 不受刷新影响
            </button>
          </div>
        </div>
        <div className="divider">divider</div>
        <div>
          main renderer线程通信：
          <button className="btn-info btn-xs btn" onClick={ipcRenderInvokeTest}>
            invoke
          </button>
          <button className="btn-info btn-xs btn" onClick={ipcRenderSendTest}>
            send
          </button>
        </div>
        <div className="divider">divider</div>
        <div>
          点击开始监听用户按下的组合键：
          <input
            value={shortcut}
            className="w-40"
            placeholder={placeholder}
            onBlur={inputBlur}
            onKeyDown={getShortKeys}
          />
          {/* maxLength="20" */}
          {/* @clear="clearAllShortKey" */}
        </div>
        <div className="divider">divider</div>
        <div>
          点击获取系统路径：{dirPath}
          <button className="btn-info btn-xs btn" onClick={getSystemDirPath}>
            获取系统路径
          </button>
          <div>
            剪贴板内容类型:{clipBoardType}
            <button className="btn-info btn-xs btn" onClick={getClipBoardType}>
              获取
            </button>
          </div>
          <div>
            <button
              className="btn-info btn-xs btn"
              onClick={showSysNotification}
            >
              弹系统通知
            </button>
            <button className="btn-info btn-xs btn" onClick={changeImage}>
              切换pet gif
            </button>
          </div>
        </div>
      </div>
      <div className="divider">divider</div>
      <div>
        <div>
          输入正确的cmd命令（提供了一个示例）：
          <button className="btn-info btn-xs btn" onClick={executeCmd}>
            执行cmd
          </button>
          <input value={cmd} className="w-72" />
        </div>
        {/*   输入参数数组(string[]，|号分隔)(TODO：有些参数没有效果)：<el-input v-model="parameters"></el-input> */}
      </div>
      <div className="divider">↓↓ 打开配置文件 ↓↓</div>
      <div>
        <button className="btn-info btn-xs btn" onClick={openConfigFile}>
          打开配置文件
        </button>
      </div>
      <div className="divider">↓↓ 配置文件的CRUD ↓↓</div>
      <div>
        <div>
          <div style={{ wordWrap: 'break-word' }}>
            获取到的内容： {dbGetContent}
          </div>
          <input className="w-16" placeholder="key" value={dbKey} />
          <button className="btn-info btn-xs btn" onClick={dbGetKey}>
            db-getByKey
          </button>
          <button className="btn-info btn-xs btn" onClick={dbRead}>
            db-readAll
          </button>
        </div>
        <div />
        <div>
          <input className="w-16" placeholder="key" value={key} />
          <input className="w-16" placeholder="value" value={value} />
          <button className="btn-info btn-xs btn" onClick={dbSet}>
            db-set
          </button>
        </div>
        <div>
          <input className="w-16" placeholder="value" value={keyToDelete} />
          <button className="btn-info btn-xs btn" onClick={dbDelete}>
            db-delete
          </button>
        </div>
        <div />
      </div>
      <div className="divider">↓↓ audio capture ↓↓</div>
      <div className="flex flex-row">
        {os && os === 'win32' ? (
          <>
            <svg
              onClick={startRecording}
              className="cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              >
                <rect width="6" height="11" x="9" y="3" rx="3" />
                <path d="M19 11a7 7 0 1 1-14 0m7 7v3" />
              </g>
            </svg>
            <svg
              onClick={stopRecording}
              className="cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
            >
              <g fill="none" fillRule="evenodd">
                <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z" />
                <path
                  fill="currentColor"
                  d="m12 13.414l5.657 5.657a1 1 0 0 0 1.414-1.414L13.414 12l5.657-5.657a1 1 0 0 0-1.414-1.414L12 10.586L6.343 4.929A1 1 0 0 0 4.93 6.343L10.586 12l-5.657 5.657a1 1 0 1 0 1.414 1.414L12 13.414Z"
                />
              </g>
            </svg>
          </>
        ) : null}
        {/* </div> */}
        {/*   <div className="divider">↓↓ drag ↓↓</div> */}
        {/*   <div */}
        {/* 		@dragover.prevent="dragover = true" */}
        {/*     @drop.prevent="onDrop" */}
        {/*     @dragleave.prevent="dragover = false" */}
        {/*     className="upload-container" */}
        {/*     :className="dragover ? 'dragover' : ''" */}
        {/*     > */}
        {/*     拖拽文本、链接、文件到这里！ */}
        {/* 		<div style="pointer-events: none">测试子元素</div> */}
        {/*   <div className="dragover-border">将文件、链接、文本放到此处</div> */}
        {/* </div> */}
        <div>识别到的东西：{dragContent}</div>
        <h1 className="text-1xl font-bold underline underline-offset-4">
          Hello world! Tailwindcss
        </h1>
        <button className="btn-info btn-xs btn bg-violet-500 hover:bg-violet-600 focus:outline-none focus:ring focus:ring-violet-300 active:bg-violet-700">
          原生tailwind
        </button>
      </div>
    </div>
  );
}

export default PetDetail;

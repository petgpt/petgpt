import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DBList } from '../../common/enum';
import { ipcRenderer } from 'electron';
import { logger, sendToMain } from "../utils/common";
import image from '../assets/gif/1.gif'
import image2 from '../assets/gif/2.gif'

function useMove() {
  const [dragging, setDragging] = useState(false);
  const [wX, setWX] = useState(-1);
  const [wY, setWY] = useState(-1);
  const [screenX, setScreenX] = useState(-1);
  const [screenY, setScreenY] = useState(-1);
  const [mainW, setMainW] = useState(-1);
  const [mainH, setMainH] = useState(-1);

  function handleMouseDown(e: MouseEvent) {
    setDragging(true);
    setWX(e.pageX);
    setWY(e.pageY);
    setScreenX(e.screenX);
    setScreenY(e.screenY);
  }

  function handleMouseMove(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (dragging) {
      const xLoc = e.screenX - wX;
      const yLoc = e.screenY - wY;
      // logger(`xLoc: ${xLoc}, yLoc: ${yLoc}, wX: ${wX}, wY: ${wY}, screen.w:${window.screen.width}, screen.h:${window.screen.height}, screenX: ${e.screenX}, screenY: ${e.screenY}`)

      // if current window is edge of screen, then can't move out of screen
      // TODO: 这里的减去的值，和初始化的时候设置的PetWindow的大小有关。弄成配置项？
      if (
        xLoc < 0 ||
        yLoc < 0 ||
        xLoc > window.screen.width - 260 ||
        yLoc > window.screen.height - 250
      ) {
        // logger(`return`)
        return false;
      }

      sendToMain('Set_Main_Window_Pos', {
        x: xLoc,
        y: yLoc,
        width: mainW, // 移动的时候可以改变窗口大小的
        height: mainH,
      });

      // remote.BrowserWindow.getFocusedWindow()!.setBounds({
      //   x: xLoc,
      //   y: yLoc,
      //   width: 64,
      //   height: 64
      // })
    }
    return true;
  }

  function handleMouseUp(e: MouseEvent) {
    setDragging(false);
    if (screenX === e.screenX && screenY === e.screenY) {
      if (e.button === 0) {
        // left mouse
        // logger('click', e)
        // sendToMain(Mouse_Event_Click, {
        //   test: 1
        // })
      } else {
        // openContextMenu()
      }
    }
  }

  useEffect(() => {
    ipcRenderer
      .invoke('db-get', { db: DBList.Config_DB, key: 'Main_Window_Width' })
      .then((res) => setMainW(res));
    ipcRenderer
      .invoke('db-get', { db: DBList.Config_DB, key: 'Main_Window_Height' })
      .then((res) => setMainH(res));
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown, false);
    window.addEventListener('mousemove', handleMouseMove, false);
    window.addEventListener('mouseup', handleMouseUp, false);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });
}

function PetMain() {
  const [toolsVisible, setToolsVisible] = useState(false);
  // const [imageUrl, setImageUrl] = useState('./gif/1.gif');
  const [publicDir, setPublicDir] = useState('');
  const [platform, setPlatform] = useState('');

  const [imageUrl, setImageUrl] = useState(image);

  useMove();
  useEffect(() => {
    ipcRenderer.invoke('platform').then((p) => setPlatform(p));
    ipcRenderer.invoke('publicDir').then((dir) => {
      setPublicDir(dir);
      setImageUrl(`${dir}\\gif\\1.gif`);
      logger(
        `platform: ${platform}, publicDir: ${publicDir}， imageUrl: ${imageUrl}`,
      );
    });
  }, [imageUrl, platform, publicDir]);
  useEffect(() => {
    ipcRenderer.on('Change_Image_Replay', () => {
      // logger(`收到changeImage, args:`, args)
      if (imageUrl === image2) {
        setImageUrl(image);
      } else {
        setImageUrl(image2);
      }
    });
    return () => {
      ipcRenderer.removeAllListeners('Change_Image_Replay');
    };
  });
  function onMouseEnterHandler() {
    setToolsVisible(true);
  }

  function onMouseLeaveWindow() {
    setToolsVisible(false);
  }
  function openDetailWindow() {}
  function openChatWindow() {}
  function openSettingWindow() {}

  return (
    <div
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveWindow}
      className="pet h-fit"
    >
      <div className="pet-container flex-r-c m-4">
         {imageUrl !== '' ? (
           <div
             className="gif h-20 w-40"
             style={{
               background: `transparent url(${imageUrl}) no-repeat`,
             }}
           />
         ) : null}
      </div>
      {toolsVisible ? (
        <div className="pet-actions flex flex-row content-center items-center justify-center">
          <button className="btn-xs btn" onClick={openDetailWindow}>
            details
          </button>
          <button className="btn-xs btn" onClick={openChatWindow}>
            chat
          </button>
          <button className="btn-xs btn" onClick={openSettingWindow}>
            setting
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default PetMain;

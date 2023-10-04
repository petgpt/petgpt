import { useState } from 'react';
import ChatAside from './ChatAside';
import MenuDividerArrow from './MenuDividerArrow';
import ChatMain from './ChatMain';
import ChatSideBar from './ChatSideBar';

function Layout() {
  const [hideLeft, setHideLeft] = useState(false);
  const [hideRight, setHideRight] = useState(true);

  function hideMenuHandler() {
    setHideLeft(!hideLeft);
  }

  function hideSideBarHandler() {
    const myDrawer = document.getElementById('my-drawer-4');
    myDrawer?.click();
    setHideRight(!hideRight);
  }

  return (
    <div className="flex h-full flex-row justify-start">
      {!hideLeft ? <ChatAside /> : null}
      {hideLeft ? null : null}
      <div
        role="button"
        tabIndex={0}
        className="flex flex-col justify-center"
        onClick={() => hideMenuHandler()}
        onKeyDown={() => {}}
      >
        <div>{MenuDividerArrow({ rotate: !hideLeft })}</div>
      </div>
      <ChatMain />
      <div
        role="button"
        tabIndex={0}
        className="fixed right-2.5 top-1/2"
        onClick={() => hideSideBarHandler()}
        onKeyDown={() => {}}
      >
        {MenuDividerArrow({ initRotate: true })}
      </div>
      {ChatSideBar(hideRight, (h) => setHideRight(h))}
    </div>
  );
}

export default Layout;

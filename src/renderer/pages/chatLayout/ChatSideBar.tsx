function ChatSideBar(hidden: boolean, setHidden: (hidden: boolean) => void) {
  function captureCurrentPlugin() {
    // 用户输入一个名字，保存当前的插件的配置快照到本地，可以在用户命名面板进行快速设置与调用
  }

  return (
    <div className="drawer drawer-end w-0 p-0">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side rounded-md">
        <label
          htmlFor="my-drawer-4"
          className="drawer-overlay m-2 rounded-md"
          onClick={() => setHidden(!hidden)}
        />
        {hidden ? null : (
          <ul className="menu mr-2 mt-12 h-4/5 w-60 rounded-md bg-base-200 p-4 text-base-content">
            <button className="btn btn-outline btn-sm rounded-btn" onClick={captureCurrentPlugin}>capture</button>
          </ul>
        )}
      </div>
    </div>
  );
}

export default ChatSideBar;

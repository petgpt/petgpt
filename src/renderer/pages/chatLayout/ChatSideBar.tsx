function ChatSideBar(hidden: boolean, setHidden: (hidden: boolean) => void) {
  return (
    <div className="drawer drawer-end w-0 p-0">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side rounded-md">
        <label
          htmlFor="my-drawer-4"
          className="drawer-overlay"
          onClick={() => setHidden(!hidden)}
        />
        {hidden ? null : (
          <ul className="menu mr-2 mt-12 h-4/5 w-60 rounded-md bg-base-200 p-4 text-base-content">
            <li>
              <a>Sidebar Item 1</a>
            </li>
            <li>
              <a>Sidebar Item 2</a>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default ChatSideBar;

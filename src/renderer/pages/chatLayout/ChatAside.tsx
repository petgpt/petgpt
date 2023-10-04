import { useEffect } from 'react';

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

  return (
    <div className="hover:bg-base-300">
      <ul id="aside-menu" className="menu border-r-2 border-r-neutral-content">
        <li>1</li>
      </ul>
    </div>
  );
}

export default ChatAside;

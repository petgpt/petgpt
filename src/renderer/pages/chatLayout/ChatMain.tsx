import React from 'react';
import ChatFooter from './ChatFooter';
import ChatText from './ChatText';

function ChatMain() {
  return (
    <div className="main-and-footer-container flex w-fit flex-1 flex-col pb-1 pr-2">
      <div
        id="image-wrapper"
        className="el-main m-1 flex h-full w-[70] flex-col overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded"
      >
        <div className="el-scrollbar">
          <ChatText />
        </div>
      </div>
      <div className="el-footer flex flex-col content-center justify-end">
        <ChatFooter />
      </div>
    </div>
  );
}

export default ChatMain;

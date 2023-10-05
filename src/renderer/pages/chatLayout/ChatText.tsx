import { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ipcRenderer } from "electron";
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import rehypeKatex from "rehype-katex";

type ChatTextProps = {
  onChatUpdate?: () => void,
  onReloadLatestChat?: () => void,
  onContinueChat?: () => void
}

export function MarkdownToHtml(md: string) {
  return (
    <ReactMarkdown remarkPlugins={[gfm, rehypeKatex]}>{md}</ReactMarkdown>
  )
}

function ChatContinueSVG(props: { onClick: () => void }) {
  return <svg
    className="cursor-pointer"
    onClick={props.onClick}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M12 12.575q-.2 0-.375-.062T11.3 12.3L6.7 7.7q-.275-.275-.288-.688T6.7 6.3q.275-.275.7-.275t.7.275l3.9 3.875L15.9 6.3q.275-.275.688-.287t.712.287q.275.275.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062Zm0 6q-.2 0-.375-.062T11.3 18.3l-4.6-4.6q-.275-.275-.288-.687T6.7 12.3q.275-.275.7-.275t.7.275l3.9 3.875l3.9-3.875q.275-.275.688-.288t.712.288q.275.275.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062Z"
    />
  </svg>;
}

const ChatText = (props: ChatTextProps, ref: Ref<{
  upsertLatestText: (message: ChatItem) => void,
  clearChatContext: (isClearContext: boolean) => void,
  deleteLastText: () => void,
} | undefined>) => {
  const { onChatUpdate, onReloadLatestChat, onContinueChat } = props;

  // const [chatList, setChatList] = useState<ChatItem[]>([]);
  const chatListRef = useRef<ChatItem[]>([]);
  const [chatUpdated, setChatUpdated] = useState(0);

  useImperativeHandle(ref, () => ({ // 暴露给父组件的方法
    upsertLatestText: (message) => {
      upsertLatestText(message)
    },
    clearChatContext: (isClearContext) => {
      clearChatContext(isClearContext);
    },
    deleteLastText: () => {
      deleteLastText();
    }
  }))

  useEffect(() => {
    ipcRenderer.on('upsertLatestText', (event, message: ChatItem) => {
      upsertLatestText(message);
    })
  }, []);

  // function textToHtml(text: string) {
  //   return <div>1</div>;
  // }

  function deleteLastText() {
    // check chatList last item is user type
    if (chatListRef.current.length === 0) {
      return;
    }

    if (chatListRef.current[chatListRef.current.length - 1].type === 'system') {
      // setChatList(chatList.filter((item, index) => index !== chatList.length - 1));
      chatListRef.current = chatListRef.current.filter((item, index) => index !== chatListRef.current.length - 1)
      setChatUpdated(prevState => prevState + 1);
    }
  }

  function clearChatContext(isClearContext: boolean) {
    // clear chatList
    if (isClearContext) {
      // setChatList([]);
      chatListRef.current = []
      setChatUpdated(prevState => prevState + 1);
    }
  }

  function upsertLatestText(message: ChatItem) {
    if (message.type === 'user') {

    }

    if (chatListRef.current.length === 0) {
      // setChatList((prevState) => {
      //   return [
      //     ...prevState,
      //     {
      //       id: message.id,
      //       type: message.type,
      //       text: message.text,
      //     }
      //   ]
      // })
      chatListRef.current.push({
        id: message.id,
        type: message.type,
        text: message.text,
      })
      // console.log(`[first add] chatListRef.current: `, chatListRef.current)
    } else {
      if (chatListRef.current[chatListRef.current.length - 1].id === message.id) {
        // 如果和前面的id一样，就更新text就行
        const chatItemsToUpdate = chatListRef.current.map((item, index) => {
          if (index === chatListRef.current.length - 1) {
            item.text = message.text
          }
          return item
        });
        chatListRef.current = chatItemsToUpdate
        // setChatList(chatItemsToUpdate);
        // setChatList((prevState) => {
        //   // update latest item
        //   return prevState.map((item, index) => {
        //     if (index === chatList.length - 1) {
        //       item.text = message.text
        //     }
        //     return item;
        //   });
        // });
        // console.log(`[update] chatListRef.current: `, chatListRef.current)
      } else {
        // 如果和前面的不一样，就push进去，代表第一次收到这个id的消息
        // setChatList([
        //   ...chatList,
        //   {
        //     id: message.id,
        //     type: message.type,
        //     text: message.text,
        //     // time: getCurrentTime()
        //   }
        // ])
        chatListRef.current.push({
          id: message.id,
          type: message.type,
          text: message.text,
          // time: getCurrentTime()
        })
        // console.log(`[append] chatListRef.current: `, chatListRef.current)
      }
      // 对外emit事件，返回信息来了
      onChatUpdate && onChatUpdate();
    }
    setChatUpdated(prevState => prevState + 1);
  }

  function reloadCurrentChat() {
    onReloadLatestChat && onReloadLatestChat();
  }

  function continueChat() {
    onContinueChat && onContinueChat();
  }

  return (
    <>
      {chatListRef.current.map((item, index) => {
        return (
          <div
            className={
              item.type === 'user' ? 'chat chat-end' : 'chat chat-start'
            }
            key={index}
          >
            <div className="chat-bubble flex flex-col items-end justify-start">
              {item.type === 'user' ? (
                <div
                  style={{ width: '-webkit-fill-available', overflow: 'auto' }}
                  className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded"
                >
                  {item.text}
                </div>
              ) : (
                <div
                  // dangerouslySetInnerHTML={{ __html: textToHtml(item.text) }}
                  style={{ width: '-webkit-fill-available', overflow: 'auto' }}
                  className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded"
                >
                  {MarkdownToHtml(item.text)}
                </div>
              )}
              {(index === chatListRef.current.length - 2 ||
                index === chatListRef.current.length - 1) &&
              item.type === 'user' ? (
                <span
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer pl-1 text-2xl text-white"
                  onClick={reloadCurrentChat}
                  onKeyDown={() => {
                  }}
                >
                  &#10227;
                </span>
              ) : null}
              {index === chatListRef.current.length - 1 && item.type === 'system' ? (
                <ChatContinueSVG onClick={continueChat}/>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default forwardRef(ChatText);

import { useState } from 'react';

function ChatText() {
  const [chatList, setChatList] = useState<ChatItem[]>([]);

  function textToHtml(text: string) {
    return <div>1</div>;
  }

  function reloadCurrentChat() {}

  function continueChat() {}

  return (
    <>
      {chatList.map((item, index) => {
        return (
          <div
            className={
              item.type === 'user' ? 'chat chat-end' : 'chat chat-start'
            }
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
                  dangerouslySetInnerHTML={{ __html: textToHtml(item.text) }}
                  style={{ width: '-webkit-fill-available', overflow: 'auto' }}
                  className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded"
                />
              )}
              {(index === chatList.length - 2 ||
                index === chatList.length - 1) &&
              item.type === 'user' ? (
                <span
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer pl-1 text-2xl text-white"
                  onClick={reloadCurrentChat}
                  onKeyDown={() => {}}
                >
                  &#10227;
                </span>
              ) : null}
              {index === chatList.length - 1 && item.type === 'system' ? (
                <svg
                  className="cursor-pointer"
                  onClick={continueChat}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 12.575q-.2 0-.375-.062T11.3 12.3L6.7 7.7q-.275-.275-.288-.688T6.7 6.3q.275-.275.7-.275t.7.275l3.9 3.875L15.9 6.3q.275-.275.688-.287t.712.287q.275.275.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062Zm0 6q-.2 0-.375-.062T11.3 18.3l-4.6-4.6q-.275-.275-.288-.687T6.7 12.3q.275-.275.7-.275t.7.275l3.9 3.875l3.9-3.875q.275-.275.688-.288t.712.288q.275.275.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062Z"
                  />
                </svg>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default ChatText;

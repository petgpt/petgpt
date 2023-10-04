import { useRef, useState } from 'react';

function ChatFooter() {
  const [userInput, setUserInput] = useState<
    string | ReadonlyArray<string> | number | undefined
  >();
  const [placeHolder, setPlaceHolder] = useState('请输入聊天内容');
  const userInputRef = useRef(null);
  const clipBoardSvg = useRef(null);

  function chatTest() {
    // TODO: 检查是不是enter
  }

  function clearChat() {}

  function pasteToUserInput() {}

  function exportChatImage() {}

  return (
    <>
      <div className="footer-first mb-1 mt-1">
        <svg
          onClick={clearChat}
          style={{ cursor: 'pointer' }}
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
        >
          <path
            d="M448 448H224a32 32 0 0 0-32 32v64a32 32 0 0 0 32 32h576a32 32 0 0 0 32-32v-64a32 32 0 0 0-32-32h-224V160a32 32 0 0 0-32-32h-64a32 32 0 0 0-32 32v288z m-64-64V128a64 64 0 0 1 64-64h128a64 64 0 0 1 64 64v256h192a64 64 0 0 1 64 64v128a64 64 0 0 1-64 64v256a64 64 0 0 1-64 64H256a64 64 0 0 1-64-64v-256a64 64 0 0 1-64-64v-128a64 64 0 0 1 64-64h192z m384 256H256v224a32 32 0 0 0 32 32h448a32 32 0 0 0 32-32v-224z m-96 64a32 32 0 0 1 32 32v160h-64v-160a32 32 0 0 1 32-32z m-128 64a32 32 0 0 1 32 32v96h-64v-96a32 32 0 0 1 32-32z m-128 64a32 32 0 0 1 32 32v32h-64v-32a32 32 0 0 1 32-32z"
            fill="#000000"
          />
        </svg>
        <svg
          ref={clipBoardSvg}
          id="clipBoardSvg"
          onClick={pasteToUserInput}
          fill="url(#gradient-horizontal)"
          style={{ cursor: 'pointer' }}
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="17"
        >
          <defs>
            <linearGradient
              id="gradient-horizontal"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="var(--color-stop-1)" />
            </linearGradient>
          </defs>
          <path d="M241.664 93.090909C241.664 93.090909 139.636364 93.090909 139.636364 194.280727c0 292.910545 0 728.529455 0 728.529455C139.636364 1024 241.664 1024 241.664 1024l540.672 0c0 0 102.027636 0 102.027636-101.189818L884.363636 194.280727C884.363636 93.090909 782.336 93.090909 782.336 93.090909l-82.804364 0 0 95.790545c0 15.080727-12.474182 27.322182-27.601455 27.322182L352.069818 216.203636c-15.220364 0-27.554909-12.241455-27.554909-27.322182L324.514909 93.090909 241.664 93.090909z" />
          <path
            d="M605.090909 186.181818c0 0 46.545455 3.304727 46.545455-45.335273 0-48.64-46.545455-47.383273-46.545455-47.383273S606.813091 0 512 0C417.186909 0 418.909091 93.463273 418.909091 93.463273S372.363636 95.464727 372.363636 140.846545C372.363636 186.181818 418.909091 186.181818 418.909091 186.181818L605.090909 186.181818zM512 46.545455c25.693091 0 46.545455 20.852364 46.545455 46.545455S537.693091 139.636364 512 139.636364 465.454545 118.784 465.454545 93.090909 486.306909 46.545455 512 46.545455z"
            fill="#515151"
          />
        </svg>
        <svg
          style={{ cursor: 'pointer' }}
          onClick={exportChatImage}
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="17"
          viewBox="0 0 24 24"
        >
          <g fill="none">
            <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z" />
            <path
              fill="currentColor"
              d="M20 15a1 1 0 0 1 1 1v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a1 1 0 1 1 2 0v4h14v-4a1 1 0 0 1 1-1ZM12 2a1 1 0 0 1 1 1v10.243l2.536-2.536a1 1 0 1 1 1.414 1.414l-4.066 4.066a1.25 1.25 0 0 1-1.768 0L7.05 12.121a1 1 0 1 1 1.414-1.414L11 13.243V3a1 1 0 0 1 1-1Z"
            />
          </g>
        </svg>
      </div>
      <div className="footer-second">
        <textarea
          id="input-textarea"
          value={userInput}
          onKeyDown={chatTest}
          ref={userInputRef}
          className="textarea-bordered textarea textarea-xs w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded"
          placeholder={placeHolder}
        />
        <button className="btn-info btn-md btn ml-1" onClick={chatTest}>
          send
        </button>
      </div>
    </>
  );
}

export default ChatFooter;

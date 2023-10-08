import React from 'react';

export function FooterClearChatSVG(props: { onClick: () => void; }) {
  return (
    <svg
      onClick={props.onClick}
      style={{ cursor: 'pointer' }}
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
    >
      <path
        d="M448 448H224a32 32 0 0 0-32 32v64a32 32 0 0 0 32 32h576a32 32 0 0 0 32-32v-64a32 32 0 0 0-32-32h-224V160a32 32 0 0 0-32-32h-64a32 32 0 0 0-32 32v288z m-64-64V128a64 64 0 0 1 64-64h128a64 64 0 0 1 64 64v256h192a64 64 0 0 1 64 64v128a64 64 0 0 1-64 64v256a64 64 0 0 1-64 64H256a64 64 0 0 1-64-64v-256a64 64 0 0 1-64-64v-128a64 64 0 0 1 64-64h192z m384 256H256v224a32 32 0 0 0 32 32h448a32 32 0 0 0 32-32v-224z m-96 64a32 32 0 0 1 32 32v160h-64v-160a32 32 0 0 1 32-32z m-128 64a32 32 0 0 1 32 32v96h-64v-96a32 32 0 0 1 32-32z m-128 64a32 32 0 0 1 32 32v32h-64v-32a32 32 0 0 1 32-32z"
        fill="#000000" />
    </svg>
  );
}

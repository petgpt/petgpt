export function HeadPinSVG(props: { onClick: () => void; }) {
  return (
    <svg
      id="pin-icon"
      onClick={props.onClick}
      className="cursor-pointer"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <g fill="none" fillRule="evenodd">
        <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z" />
        <path
          fill="currentColor"
          d="M8.867 2a2 2 0 0 0-1.98 1.717l-.515 3.605a9 9 0 0 1-1.71 4.128l-1.318 1.758c-.443.59-.265 1.525.528 1.82c.746.278 2.839.88 7.128.963V22a1 1 0 1 0 2 0v-6.01c4.29-.082 6.382-.684 7.128-.962c.793-.295.97-1.23.528-1.82l-1.319-1.758a9 9 0 0 1-1.71-4.128l-.514-3.605A2 2 0 0 0 15.133 2H8.867Zm0 2h6.266l.515 3.605c.261 1.83.98 3.565 2.09 5.045l.606.808C17.209 13.71 15.204 14 12 14s-5.21-.29-6.344-.542l.607-.808a11 11 0 0 0 2.09-5.045L8.866 4Z" />
      </g>
    </svg>
  );
}

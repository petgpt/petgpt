import { useState } from "react";

function SlashToPop() {
  const [tips, setTips] = useState('')

  return <div>
    <label htmlFor="my_modal_7" className="btn hidden">open modal</label>

    <input type="checkbox" id="my_modal_7" className="modal-toggle" />
    <div className="modal">
      <div className="modal-box h-4/5">
        <input id="tips-input" type="text" placeholder="输入指令" className="input input-bordered input-xs w-full"
               value={tips}
               onChange={e => setTips(e.target.value)} autoFocus/>
      </div>
      <label className="modal-backdrop" htmlFor="my_modal_7">Close</label>
    </div>
  </div>
}

export default SlashToPop;

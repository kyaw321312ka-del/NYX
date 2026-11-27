import { useState } from "react"; // မသုံးတော့တဲ့ useRef ကို ဖယ်လိုက်ပါပြီ
import "./table-footer.css";

export const useTableFooter = (data) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [buttonStart, setButtonStart] = useState(1);

  const rownumber = data?.length ?? 0;
  const rowprepage = 10;
  const totalpages = Math.ceil(rownumber / rowprepage);

  const startnumber = (currentPage - 1) * rowprepage;
  const endnumber = currentPage * rowprepage;

  const showstartnumber = rownumber === 0 ? 0 : startnumber + 1;
  const showendnumber = endnumber > rownumber ? rownumber : endnumber;

  function increasenumber() {
    if (currentPage < totalpages) {
      setCurrentPage((prev) => prev + 1);
      setButtonStart((prev) => prev + 1);
    }
  }

  function decreasenumber() {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      setButtonStart((prev) => Math.max(1, prev - 1));
    }
  }

  function changetable(pageNumber) {
    setCurrentPage(pageNumber);
  }

  const TableFooterJsx = (
    <div className="globalfooter">
      <p>
        Showing {showstartnumber} to {showendnumber} of {rownumber} rows
      </p>
      <div className="globalfooterbtn">
        <button disabled={currentPage === 1} onClick={decreasenumber}>
          Previous
        </button>

        <button
          className={currentPage === buttonStart ? "active" : ""}
          onClick={() => changetable(buttonStart)}
        >
          {buttonStart}
        </button>
        <button
          className={currentPage === buttonStart + 1 ? "active" : ""}
          onClick={() => changetable(buttonStart + 1)}
        >
          {buttonStart + 1}
        </button>
        <button
          className={currentPage === buttonStart + 2 ? "active" : ""}
          onClick={() => changetable(buttonStart + 2)}
        >
          {buttonStart + 2}
        </button>

        <button disabled={currentPage >= totalpages} onClick={increasenumber}>
          Next
        </button>
      </div>
    </div>
  );

  return { TableFooterJsx, startnumber, endnumber };
};

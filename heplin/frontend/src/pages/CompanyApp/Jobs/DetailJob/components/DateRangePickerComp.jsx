import { useEffect, useRef, useState } from 'react'
import { DateRangePicker } from 'react-date-range'

import format from 'date-fns/format'
import { tr,enAU } from 'date-fns/locale'; 
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { useTranslation } from 'react-i18next';

const DateRangePickerComp = ({ setRange, range }) => {
  const [open, setOpen] = useState(false)
  const refOne = useRef(null)
  useEffect(() => {
    const hideOnEscape = (e) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    const hideOnClickOutside = (e) => {
      if (refOne.current && !refOne.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", hideOnEscape, true)
    document.addEventListener("click", hideOnClickOutside, true)

    return () => {
      document.removeEventListener("keydown", hideOnEscape, true)
      document.removeEventListener("click", hideOnClickOutside, true)
    }
  }, [])



  return (
    <div style={{position:"relative",width:"250px"}}>
<div className="calendarWrap" style={{
      border: "1px solid #d9d9d9",
      display: "flex",
      alignItems: "center",
      padding: "10px",
      borderRadius: "10px",
      flexDirection:"column",
      justifyContent:"center",
      position:"absolute",
      top:0,
      zIndex:999,
      height:open ? "":"100%",
      background:"white"
    }}>
      <input
        value={`${format(range[0].startDate, "MM/dd/yyyy")} to ${format(range[0].endDate, "MM/dd/yyyy")}`}
        readOnly
        className="inputBox"
        onClick={() => setOpen(open => !open)}
      />
      <div ref={refOne}>
        {open && (
          <DateRangePicker
            onChange={item => setRange([item.selection])}
            editableDateInputs={true}
            moveRangeOnFirstSelection={false}
            ranges={range}
            months={1}
            direction="vertical"
            className="calendarElement"
            locale={localStorage.getItem("i18n") == "tr"?tr:enAU}
          />
        )}
      </div>
    </div>
    </div>
    
  )
}

export default DateRangePickerComp

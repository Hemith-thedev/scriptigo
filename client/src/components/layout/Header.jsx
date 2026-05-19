import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiSolidCog } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
    <header className="header">
      <div className="wrapper">
        <div className="logo">
          <p>Scriptigo</p>
        </div>
        {/* <div className="settings">
          <button className="settings-toggle">
            <div className="cog">
              <BiSolidCog />
            </div>
            <div className="cross">
              <RxCross2 />
            </div>
          </button>
          <ul className="settings-menu">
            <li>
              
            </li>
          </ul>
        </div> */}
      </div>
    </header>
    </>
  )
}

export default Header;
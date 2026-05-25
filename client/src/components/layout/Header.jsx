import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiSolidCog } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { IoIosArrowBack } from "react-icons/io";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pageHeading, setPageHeading] = useState("");
  const PageHeadingElement = ({route}) => {
    let heading = "";
    if (route === "/stories") heading = "Stories";
    if (route === "/genres") heading = "Genres";
    if (route === "/tags") heading = "Tags";
    if (route === "/trash") heading = "Trash";
    return (
      <span> | <span className="highlight gradient">{heading}</span></span>
    )
  }
  return (
    <>
      <header className="flex justify-center items-center h-fit w-full shadow-2xl shadow-gold-20 z-50">
        <div className="flex flex-row justify-between items-center w-full max-w-7xl py-6 px-12">
          <div className="flex flex-row justify-center items-start gap-4">
            <div
              className={`flex ${location.pathname === "/" ? "w-0 overflow-hidden" : "w-fit overflow-visible"} transition-all duration-300`}
            >
              <button
                className="primary-button has-element-hover"
                onClick={() => window.history.back()}
              >
                <IoIosArrowBack className="text-3xl" />
              </button>
            </div>
            <p className="text-[2rem] h-fit w-fit font-medium">
              <span className="highlight gradient">Scriptigo</span>
              {(location.pathname === "/") ? <></> : <PageHeadingElement route={location.pathname} />}
            </p>
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
  );
};

export default Header;

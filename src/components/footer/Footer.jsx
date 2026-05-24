import website_name from "@/src/config/website.js";
import { Link } from "react-router-dom";
function Footer() {
  return <footer className="flex flex-col w-full mt-[100px] px-4 max-[500px]:px-4 relative">

      <div style={{
      borderBottom: "1px solid rgba(255, 255, 255, .075)"
    }} className="w-full text-left max-[500px]:hidden relative z-10">

        <Link to="/home" className="text-[45px] font-extrabold tracking-wide max-[520px]:text-[38px] max-[520px]:text-center">
          <img src="/logo.png" alt="Logo" className="h-20 w-auto" />
        </Link>

      </div>
      <div className="flex py-5 flex-col w-full space-y-4 max-md:items-center max-[500px]:bg-[#2a2c31]">
        <div className="flex w-fit items-center space-x-6 max-[500px]:hidden">
          <p className="text-2xl font-bold max-md:text-lg">A-Z LIST</p>
          <p style={{
          borderLeft: "1px solid rgba(255, 255, 255, 0.6)"
        }} className="text-md font-semibold pl-6">
            Searching anime order by alphabet name A to Z
          </p>
        </div>
        <div className="flex gap-x-[7px] flex-wrap justify-start gap-y-2 max-md:justify-start max-[500px]:hidden">
          {["All", "0-9", ...Array.from({
          length: 26
        }, (_, i) => String.fromCharCode(65 + i))].map((item, index) => <Link to={`az-list/${item === "All" ? "" : item}`} key={index} className="text-lg bg-[#33353c] px-2 rounded-md font-bold hover:text-black hover:bg-[#cae962] hover:cursor-pointer transition-all ease-out">
              {item}
            </Link>)}
        </div>
        <div className="flex flex-col w-full text-left space-y-2 pt-4 max-md:items-center max-[470px]:px-[5px]">
          <p className="text-[#9B9BA3] text-[16px] max-md:text-center max-md:text-[12px]">
            {website_name} does not host any files, it merely pulls streams from
            3rd party services. Legal issues should be taken up with the file
            hosts and providers. {website_name} is not responsible for any media
            files shown by the video providers.
          </p>
          <p className="text-[#9B9BA3] max-md:text-[14px]">
            © {website_name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
}
export default Footer;

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Spotlight.css";
import Banner from "../banner/Banner";
const Spotlight = ({
  spotlights
}) => {
  return <>
      <div className="relative h-[600px] max-xl:h-[520px] max-lg:h-[440px] max-md:h-[400px] max-sm:h-[320px] overflow-hidden">

        <div className="absolute right-4 bottom-8 hidden md:flex flex-col space-y-2 z-10">
          <div className="button-next rounded-[8px]"></div>
          <div className="button-prev rounded-[8px]"></div>
        </div>

        {spotlights && spotlights.length > 0 ? <>
            <Swiper spaceBetween={0} slidesPerView={1} loop={true} allowTouchMove={false} navigation={{
          nextEl: ".button-next",
          prevEl: ".button-prev"
        }} pagination={{
          el: ".spotlight-pagination",
          type: "bullets",
          clickable: true
        }} autoplay={{
          delay: 3000,
          disableOnInteraction: false
        }} modules={[Navigation, Autoplay, Pagination]} className="h-full" style={{
          "--swiper-pagination-bullet-inactive-color": "#ffffff",
          "--swiper-pagination-bullet-inactive-opacity": "1",
          "--swiper-pagination-color": "#cae962"
        }}>
              {spotlights.map((item, index) => <SwiperSlide className="text-black relative" key={index}>
                  <Banner item={item} index={index} />
                </SwiperSlide>)}
            </Swiper>

            <div className="spotlight-pagination z-10"></div>

          </> : <p>No spotlights to show.</p>}
      </div>
    </>;
};
export default Spotlight;

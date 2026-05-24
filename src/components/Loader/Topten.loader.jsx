import { Skeleton } from "../ui/Skeleton/Skeleton";
function ToptenLoader() {
  return <div className="flex flex-col space-y-6">
               <div className="flex justify-between items-center">
                    <Skeleton className="w-[130px] h-[22px]" />
                    <div className="flex gap-[2px] bg-[#2a2c31] rounded-[4px] overflow-hidden p-1">
                         <Skeleton className="w-[50px] h-[28px] rounded-sm" />
                         <Skeleton className="w-[50px] h-[28px] rounded-sm" />
                         <Skeleton className="w-[55px] h-[28px] rounded-sm" />
                    </div>
               </div>
               <div className="flex flex-col space-y-3">
                    {[...Array(10)].map((_, i) => <div key={i} className="flex items-center gap-x-3 pb-3" style={{
        borderBottom: "1px solid rgba(255,255,255,.07)"
      }}>
                              <Skeleton className="w-[18px] h-[18px] rounded-sm flex-shrink-0" />
                              <Skeleton className="w-[45px] h-[60px] rounded-sm flex-shrink-0" />
                              <div className="flex flex-col gap-y-2 flex-1 min-w-0">
                                   <Skeleton className="w-[90%] h-[13px]" />
                                   <div className="flex gap-x-1">
                                        <Skeleton className="w-[36px] h-[16px] rounded-[2px]" />
                                        <Skeleton className="w-[36px] h-[16px] rounded-[2px]" />
                                   </div>
                              </div>
                         </div>)}
               </div>
          </div>;
}
export default ToptenLoader;

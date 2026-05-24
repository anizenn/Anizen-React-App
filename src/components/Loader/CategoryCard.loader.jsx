import { Skeleton } from "../ui/Skeleton/Skeleton";
function CategoryCardLoader({
  className,
  showLabelSkeleton = true,
  showFilterSkeleton = false
}) {
  return <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {showLabelSkeleton && <Skeleton className="w-[200px] h-[22px] max-[320px]:w-[70px]" />}

        {showFilterSkeleton && <div className="flex items-center gap-x-1 ml-auto">
            {["All", "Sub", "Dub", "China"].map(t => <Skeleton key={t} className="w-[38px] h-[26px] rounded-sm" />)}
            <Skeleton className="w-7 h-7 rounded-sm ml-1" />
            <Skeleton className="w-7 h-7 rounded-sm" />
          </div>}
      </div>
      <div className="grid grid-cols-6 gap-x-3 gap-y-8 mt-6 max-[1400px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-2">
        {[...Array(12)].map((_, index) => <div key={index} className="flex flex-col" style={{
        height: "fit-content"
      }}>
            <div className="w-full relative">
              <Skeleton className="w-full h-[250px] object-cover max-[1200px]:h-[35vw] max-[758px]:h-[45vw] max-[478px]:h-[60vw] rounded-none" />
              <div className="absolute left-2 bottom-4 flex items-center justify-center w-fit space-x-1 z-20">
                <Skeleton className="w-[40px] h-[16px] rounded-[2px] bg-gray-600" />
                <Skeleton className="w-[40px] h-[16px] rounded-[2px] bg-gray-600" />
              </div>
            </div>
            <Skeleton className="mt-2 w-[90%] h-[14px]" />
            <div className="flex items-center gap-x-2 w-full mt-2">
              <Skeleton className="w-[35%] h-[12px]" />
              <Skeleton className="w-[35%] h-[12px]" />
            </div>
          </div>)}
      </div>
    </div>;
}
export default CategoryCardLoader;

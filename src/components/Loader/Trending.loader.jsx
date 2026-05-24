import { Skeleton } from "../ui/Skeleton/Skeleton";
function TrendingLoader() {
  const cols = typeof window !== "undefined" ? window.innerWidth >= 1280 ? 8 : window.innerWidth >= 1024 ? 6 : window.innerWidth >= 768 ? 4 : window.innerWidth >= 480 ? 3 : 2 : 8;
  return <div className="mt-8 max-[1200px]:px-4 max-md:px-0">
            <Skeleton className="w-[120px] h-[22px] mb-5" />
            <div className="grid gap-[14px]" style={{
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
    }}>
                {[...Array(cols)].map((_, i) => <div key={i} className="flex flex-col gap-2">
                        <div className="relative w-full rounded-md overflow-hidden" style={{
          paddingBottom: "145%"
        }}>
                            <Skeleton className="absolute inset-0 w-full h-full rounded-md" />
                            <div className="absolute top-2 left-2 w-7 h-7 rounded-full overflow-hidden">
                                <Skeleton className="w-full h-full" />
                            </div>
                        </div>
                        <Skeleton className="w-[90%] h-[12px]" />
                        <Skeleton className="w-[60%] h-[12px]" />
                    </div>)}
            </div>
        </div>;
}
export default TrendingLoader;

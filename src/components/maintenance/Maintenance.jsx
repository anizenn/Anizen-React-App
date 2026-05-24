import logoTitle from "@/src/config/logoTitle";
function Maintenance() {
  return <div className="bg-[#1c1c1f] min-h-screen grid text-white" style={{
    gridTemplateRows: "60px 1fr 48px",
    fontFamily: "Inter, system-ui, sans-serif"
  }}>
      <div className="flex items-center px-8 border-b border-white/[0.07]">
        <span className="text-[#cae962] font-bold text-[15px] tracking-[0.5px]">{logoTitle}</span>
      </div>

      <div className="flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[480px]">
          <p className="text-[11px] font-semibold tracking-[2px] uppercase text-white/30 mb-[14px]">
            Incident — May 19, 2026
          </p>

          <h1 className="text-[32px] font-semibold leading-[1.15] mb-4">
            We&apos;re <span className="text-[#cae962]">temporarily</span>
            <br />unavailable.
          </h1>

          <p className="text-[14px] text-white/45 leading-[1.7] mb-9">
            Railway, our hosting provider, is experiencing a{" "}
            <b className="text-white/65 font-medium">major infrastructure outage</b>{" "}
            caused by a Google Cloud issue. This is beyond our control. We&apos;ll be back as soon as they restore service.
          </p>

          <div className="border border-white/[0.08] rounded-[10px] overflow-hidden mb-7">
            <div className="flex items-start gap-[14px] px-4 py-[14px] border-b border-white/[0.05]">
              <span className="text-[11px] text-white/25 pt-[2px] tabular-nums min-w-[72px]">00:37 UTC</span>
              <div>
                <p className="text-[12px] font-semibold text-amber-400 mb-[3px]">Investigating</p>
                <p className="text-[12px] text-white/40 leading-[1.55]">Railway has identified the cause. Access to Google Cloud has been partially restored. Working to bring all services back online.</p>
              </div>
            </div>

            <div className="flex items-start gap-[14px] px-4 py-[14px] border-b border-white/[0.05]">
              <span className="text-[11px] text-white/25 pt-[2px] tabular-nums min-w-[72px]">23:37 UTC</span>
              <div>
                <p className="text-[12px] font-semibold text-red-400 mb-[3px]">Identified</p>
                <p className="text-[12px] text-white/40 leading-[1.55]">Google Cloud blocked Railway&apos;s account. All services hosted on Railway are affected globally.</p>
              </div>
            </div>

            <div className="flex items-start gap-[14px] px-4 py-[14px]">
              <span className="text-[11px] text-white/25 pt-[2px] tabular-nums min-w-[72px]">22:29 UTC</span>
              <div>
                <p className="text-[12px] font-semibold text-red-400 mb-[3px]">Outage detected</p>
                <p className="text-[12px] text-white/40 leading-[1.55]">Widespread disruption affecting Railway&apos;s edge network. Users experiencing errors and login failures.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[10px]">
            <a href="https://status.railway.com" target="_blank" rel="noreferrer" className="bg-[#cae962] text-black text-[13px] font-semibold px-[18px] py-[9px] rounded-[7px]">
              Railway Status ↗
            </a>
            <a href="/" className="text-white/45 text-[13px] font-medium px-[18px] py-[9px] rounded-[7px] border border-white/10">
              anizen.site
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-8 border-t border-white/[0.07] text-[11px] text-white/20">
        <span>anizen.site</span>
        <span>Updates via status.railway.com</span>
      </div>
    </div>;
}
export default Maintenance;

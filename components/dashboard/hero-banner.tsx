export function HeroBanner({
  userName,
  activeCustomers,
}: {
  userName: string;
  activeCustomers: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-petrol via-petrol-2 to-[#0b2e34] p-5 sm:p-6">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.1))",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.1))",
        }}
      />
      <div className="absolute -top-[38px] -right-[38px] size-[170px] rounded-full border-[1.5px] border-aqua/35">
        <div className="absolute inset-[22px] rounded-full border border-dashed border-brass/40" />
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-aqua">
          <span className="size-1.5 rounded-full bg-aqua" />
          Panel Operasional
        </span>
        <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
          Selamat datang, {userName}!
        </h2>
        <p className="max-w-[78%] text-[12.5px] leading-relaxed text-[#b9d4d0]">
          Pantau operasional dan pelayanan air bersih dengan mudah, langsung dari satu panel.
        </p>
        <div className="mt-1 flex w-fit items-center gap-2 rounded-full border border-white/14 bg-white/7 px-3 py-1.5">
          <span className="flex size-4 items-center justify-center rounded-full bg-green-light">
            <span className="size-1.5 rounded-full bg-green" />
          </span>
          <span className="font-mono text-[10.5px] tracking-wide text-[#ddefec]">
            {activeCustomers} PELANGGAN AKTIF · SISTEM NORMAL
          </span>
        </div>
      </div>
    </div>
  );
}
const markets = [
  { label: "USA", x: 90, y: 169, labelX: 64, labelY: 150 },
  { label: "UK", x: 182, y: 91, labelX: 161, labelY: 72 },
  { label: "Germany", x: 284, y: 76, labelX: 300, labelY: 61 },
  { label: "UAE", x: 133, y: 261, labelX: 87, labelY: 286 },
  { label: "Saudi Arabia", x: 215, y: 313, labelX: 159, labelY: 342 },
  { label: "Singapore", x: 383, y: 152, labelX: 396, labelY: 132 },
  { label: "Malaysia", x: 402, y: 251, labelX: 415, labelY: 275 },
  { label: "Australia", x: 337, y: 324, labelX: 352, labelY: 349 },
];

export function NetworkVisual() {
  return (
    <div className="join-network-visual">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-lg font-semibold text-white">Your Global Business Network</p><p className="mt-2 text-xs text-[#b7d5ed]">Connect &rarr; Match &rarr; Meet &rarr; Collaborate &rarr; Grow</p></div>
        <span className="mt-1 size-2 shrink-0 rounded-full bg-[#35be84]" aria-hidden="true" />
      </div>
      <svg viewBox="0 0 520 390" role="img" aria-labelledby="membership-network-title membership-network-desc" className="my-2 w-full">
        <title id="membership-network-title">India connected to eight international markets</title>
        <desc id="membership-network-desc">Illustrative global network connecting India with the UAE, Singapore, UK, Germany, USA, Malaysia, Australia and Saudi Arabia. This is not a live activity feed.</desc>
        <defs>
          <radialGradient id="join-sphere"><stop stopColor="#148ce0" stopOpacity=".23" /><stop offset="1" stopColor="#20b7d5" stopOpacity=".02" /></radialGradient>
          <linearGradient id="join-route"><stop stopColor="#20b7d5" /><stop offset="1" stopColor="#35be84" /></linearGradient>
        </defs>
        <g fill="none" stroke="#8ed8ef" strokeOpacity=".13">
          <circle cx="260" cy="202" r="155" fill="url(#join-sphere)" />
          <ellipse cx="260" cy="202" rx="85" ry="155" /><ellipse cx="260" cy="202" rx="32" ry="155" />
          <ellipse cx="260" cy="202" rx="155" ry="56" /><ellipse cx="260" cy="202" rx="155" ry="113" />
          <path d="M105 202H415M260 47V357" />
          <circle cx="260" cy="202" r="178" strokeDasharray="3 9" />
        </g>
        {markets.map((market, i) => (
          <g key={market.label}>
            <path className="join-route" style={{ animationDelay: `${i * -0.7}s` }} d={`M270 200 Q${(270 + market.x) / 2} ${Math.min(200, market.y) - 45} ${market.x} ${market.y}`} fill="none" stroke="url(#join-route)" strokeWidth="1.3" strokeOpacity=".65" />
            <circle cx={market.x} cy={market.y} r="10" fill="#20b7d5" fillOpacity=".1" />
            <circle cx={market.x} cy={market.y} r="3.5" fill={i % 2 ? "#35be84" : "#20b7d5"} />
            <text x={market.labelX} y={market.labelY} fill="#d3e7f7" fontSize="11" fontFamily="Arial, sans-serif">{market.label}</text>
          </g>
        ))}
        <circle className="join-hub" cx="270" cy="200" r="20" fill="#35be84" fillOpacity=".12" />
        <circle cx="270" cy="200" r="8" fill="#35be84" stroke="#b1f2db" strokeWidth="2" />
        <rect x="240" y="221" width="61" height="26" rx="13" fill="#0e4067" stroke="#35be84" strokeOpacity=".4" />
        <text x="270" y="238" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial, sans-serif">INDIA</text>
      </svg>
      <div className="flex flex-wrap gap-2">
        {["Buyers", "Suppliers", "Distributors", "B2B Meetings", "Business Opportunities", "Market Access"].map((label) => <span key={label} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-[#c5dfee]">{label}</span>)}
      </div>
      <p className="mt-5 text-[10px] tracking-wide text-[#9ebcd5]">ILLUSTRATIVE CONNECTIONS &middot; GLOBAL POSSIBILITIES</p>
    </div>
  );
}

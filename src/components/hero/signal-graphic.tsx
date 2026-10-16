/** Abstract illustration, not a chart of project results. */
export function SignalGraphic() {
  return (
    <div className="signal-graphic" aria-hidden="true">
      <div className="signal-label eyebrow">From curiosity to something useful</div>
      <svg viewBox="0 0 480 400" fill="none">
        <defs>
          <pattern id="signal-grid" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#71809c" opacity=".22" /></pattern>
          <linearGradient id="signal-color" x1="50" y1="280" x2="430" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#334868"/><stop offset="1" stopColor="#a6c7ff"/></linearGradient>
        </defs>
        <rect width="480" height="400" fill="url(#signal-grid)" />
        {[0,1,2,3,4,5,6].map((line) => <path key={line} d={`M 24 ${310-line*26} C 140 ${320-line*35}, 170 ${80+line*28}, 270 ${110+line*23} S 360 ${230-line*19}, 456 ${75+line*27}`} stroke="url(#signal-color)" strokeWidth={line===3 ? 2 : 1} opacity={line===3 ? 1 : .4} />)}
        <circle cx="270" cy="179" r="56" fill="#101722" stroke="#33425d"/>
        <circle cx="270" cy="179" r="44" stroke="#718bb2" strokeDasharray="2 7" opacity=".5"/>
        <path d="m257 166-13 13 13 13m26-26 13 13-13 13m-9-34-8 42" stroke="#b5cdff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="85" cy="257" r="4" fill="#88adf5"/>
        <circle cx="420" cy="144" r="4" fill="#b5cdff"/>
      </svg>
      <div className="signal-footer eyebrow"><span>Data</span><span>Ideas</span><span>Interfaces</span></div>
    </div>
  );
}

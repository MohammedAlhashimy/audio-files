type IntroScreenProps = { leaving: boolean };

export function IntroScreen({ leaving }: IntroScreenProps) {
  return (
    <section className={`intro-screen ${leaving ? "is-leaving" : ""}`} aria-label="Atefeh wird gestartet">
      <div className="intro-orb intro-orb-one" aria-hidden="true" />
      <div className="intro-orb intro-orb-two" aria-hidden="true" />
      <div className="intro-wordmark-wrap">
        <svg className="intro-wordmark" viewBox="0 0 900 320" role="img" aria-label="Atefeh">
          <defs>
            <linearGradient id="atefeh-glass" x1="0" x2="1" y1="0.1" y2="0.9"><stop offset="0" stopColor="#ffffff" /><stop offset="0.26" stopColor="#bfeeff" /><stop offset="0.52" stopColor="#a9b8ff" /><stop offset="0.75" stopColor="#f2bde7" /><stop offset="1" stopColor="#dffffb" /></linearGradient>
            <linearGradient id="atefeh-water-fill" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".58" /><stop offset="0.31" stopColor="#bfeeff" stopOpacity=".24" /><stop offset="0.62" stopColor="#b8c4ff" stopOpacity=".36" /><stop offset="1" stopColor="#f8caeb" stopOpacity=".22" /></linearGradient>
            <filter id="atefeh-glow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="atefeh-water" x="-16%" y="-28%" width="132%" height="156%"><feTurbulence type="fractalNoise" baseFrequency=".015 .09" numOctaves="2" seed="7" result="ripples" /><feDisplacementMap in="SourceGraphic" in2="ripples" scale="2.2" xChannelSelector="R" yChannelSelector="G" /></filter>
          </defs>
          <text className="intro-fill" x="450" y="214" textAnchor="middle">Atefeh</text>
          <text className="intro-trace" x="450" y="214" textAnchor="middle" filter="url(#atefeh-glow)">
            {(["A", "t", "e", "f", "e", "h"] as const).map((letter, index) => <tspan key={`${letter}-${index}`} style={{ "--letter-delay": `${[0, 390, 730, 1080, 1430, 1780][index]}ms` } as React.CSSProperties}>{letter}</tspan>)}
          </text>
          <text className="intro-sheen" x="450" y="214" textAnchor="middle">Atefeh</text>
        </svg>
      </div>
    </section>
  );
}

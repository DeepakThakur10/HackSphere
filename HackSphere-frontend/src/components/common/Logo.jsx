export default function Logo({ className = "h-9 w-auto", showText = false, ...props }) {
  return (
    <div className="inline-flex items-center gap-3">
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <defs>
          <linearGradient id="hs-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00B4DB" />
            <stop offset="45%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="hs-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>

        {/* Outer Sphere Ring */}
        <circle cx="100" cy="100" r="92" stroke="url(#hs-grad)" strokeWidth="4" opacity="0.95" />

        {/* Inner Network Lines & Mesh */}
        <g stroke="url(#hs-grad)" strokeWidth="1.75" opacity="0.75" strokeLinecap="round">
          {/* Vertical & Horizontal Axes */}
          <path d="M100 8 L100 48" />
          <path d="M100 192 L100 152" />
          <path d="M8 100 L48 100" />
          <path d="M192 100 L152 100" />

          {/* Top Web */}
          <path d="M100 48 L65 28" />
          <path d="M100 48 L135 28" />
          <path d="M65 28 L38 18" />
          <path d="M135 28 L162 18" />

          {/* Bottom Web */}
          <path d="M100 152 L65 172" />
          <path d="M100 152 L135 172" />
          <path d="M65 172 L38 182" />
          <path d="M135 172 L162 182" />

          {/* Left Web */}
          <path d="M48 100 L28 65" />
          <path d="M48 100 L28 135" />
          <path d="M28 65 L18 38" />
          <path d="M28 135 L18 162" />

          {/* Right Web */}
          <path d="M152 100 L172 65" />
          <path d="M152 100 L172 135" />
          <path d="M172 65 L182 38" />
          <path d="M172 135 L182 162" />
        </g>

        {/* Code Brackets </ > */}
        {/* Top-Left </ > */}
        <g stroke="url(#hs-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M40 46 L34 51 L40 56" />
          <path d="M46 45 L42 57" />
          <path d="M48 46 L54 51 L48 56" />
        </g>

        {/* Top-Right </ > */}
        <g stroke="url(#hs-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M146 46 L140 51 L146 56" />
          <path d="M152 45 L148 57" />
          <path d="M154 46 L160 51 L154 56" />
        </g>

        {/* Bottom-Left </ > */}
        <g stroke="url(#hs-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M40 144 L34 149 L40 154" />
          <path d="M46 143 L42 155" />
          <path d="M48 144 L54 149 L48 154" />
        </g>

        {/* Bottom-Right </ > */}
        <g stroke="url(#hs-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M146 144 L140 149 L146 154" />
          <path d="M152 143 L148 155" />
          <path d="M154 144 L160 149 L154 154" />
        </g>

        {/* Orbit Node Dots */}
        <g fill="url(#hs-grad)">
          <circle cx="100" cy="8" r="4.5" />
          <circle cx="100" cy="192" r="4.5" />
          <circle cx="8" cy="100" r="4.5" />
          <circle cx="192" cy="100" r="4.5" />

          <circle cx="38" cy="18" r="3.5" />
          <circle cx="162" cy="18" r="3.5" />
          <circle cx="38" cy="182" r="3.5" />
          <circle cx="162" cy="182" r="3.5" />

          <circle cx="18" cy="38" r="3.5" />
          <circle cx="182" cy="38" r="3.5" />
          <circle cx="18" cy="162" r="3.5" />
          <circle cx="182" cy="162" r="3.5" />

          <circle cx="65" cy="28" r="3.5" />
          <circle cx="135" cy="28" r="3.5" />
          <circle cx="65" cy="172" r="3.5" />
          <circle cx="135" cy="172" r="3.5" />

          <circle cx="28" cy="65" r="3.5" />
          <circle cx="172" cy="65" r="3.5" />
          <circle cx="28" cy="135" r="3.5" />
          <circle cx="172" cy="135" r="3.5" />

          <circle cx="100" cy="48" r="4" />
          <circle cx="100" cy="152" r="4" />
          <circle cx="48" cy="100" r="4" />
          <circle cx="152" cy="100" r="4" />
        </g>

        {/* Central Stylized "H" Emblem */}
        <g stroke="url(#hs-grad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left Pillar */}
          <path d="M72 60 L86 76 L72 100 L86 124 L72 140" />
          {/* Right Pillar */}
          <path d="M128 60 L114 76 L128 100 L114 124 L128 140" />
          {/* Crossbar */}
          <path d="M72 100 L128 100" />
        </g>

        {/* Node joints on central H */}
        <g fill="#FFFFFF" stroke="url(#hs-grad)" strokeWidth="2.5">
          <circle cx="72" cy="60" r="4" />
          <circle cx="86" cy="76" r="3.5" />
          <circle cx="72" cy="100" r="4.5" />
          <circle cx="86" cy="124" r="3.5" />
          <circle cx="72" cy="140" r="4" />

          <circle cx="128" cy="60" r="4" />
          <circle cx="114" cy="76" r="3.5" />
          <circle cx="128" cy="100" r="4.5" />
          <circle cx="114" cy="124" r="3.5" />
          <circle cx="128" cy="140" r="4" />
        </g>
      </svg>
      {showText && (
        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          HackSphere
        </span>
      )}
    </div>
  );
}

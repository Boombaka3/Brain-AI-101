import { useId } from 'react'

// Reference-matched neuron for Section C.
// Built as an inline SVG so every group remains addressable for future GSAP timelines.

export default function CleanNeuronSvg({
  level = 2,
  fillPercent = 52,
  isFiring = false,
  mirrored = false,
  showLabels = true,
  className = '',
}) {
  const clampedFill = Math.max(0, Math.min(100, fillPercent))
  const uid = useId().replace(/:/g, '-')
  const somaClipId = `soma-clip-${uid}`
  const fireGlowId = `soft-fire-glow-${uid}`
  const signalGlowId = `soft-signal-glow-${uid}`
  const shaftGlowId = `shaft-glow-${uid}`
  const fillGradientId = `fill-gradient-${uid}`
  const bodyGradientId = `body-gradient-${uid}`
  const pulseGradientId = `pulse-gradient-${uid}`

  const fillHeight = 130 * (clampedFill / 100)
  const fillY = 285 - fillHeight

  return (
    <svg
      className={['clean-neuron-svg', className].filter(Boolean).join(' ')}
      width="100%"
      viewBox="0 0 900 440"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={`cleanNeuronTitle-${uid} cleanNeuronDesc-${uid}`}
    >
      <title id={`cleanNeuronTitle-${uid}`}>Interactive neuron</title>
      <desc id={`cleanNeuronDesc-${uid}`}>
        A soft neuron diagram matching the reference image, with signal dots, soma fill,
        threshold, and axon pulse.
      </desc>

      <defs>
        <linearGradient id={bodyGradientId} x1="170" y1="210" x2="740" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f4f8ff" />
          <stop offset="100%" stopColor="#eef4fb" />
        </linearGradient>

        <linearGradient id={fillGradientId} x1="455" y1="140" x2="455" y2="288" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#cbecc6" />
          <stop offset="100%" stopColor="#b6e0b4" />
        </linearGradient>

        <linearGradient id={pulseGradientId} x1="230" y1="223" x2="465" y2="223" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffd15b" />
          <stop offset="100%" stopColor="#fff1bd" />
        </linearGradient>

        <clipPath id={somaClipId}>
          <path
            d="
              M452 142
              C493 137 533 148 566 166
              C597 182 625 183 646 169
              C662 158 673 132 672 106
              C671 81 651 63 655 45
              C660 22 683 13 689 30
              C695 47 684 68 683 89
              C682 114 693 137 716 144
              C743 152 772 138 798 113
              C815 97 834 78 851 84
              C868 90 864 107 852 113
              C826 126 797 151 783 172
              C813 160 850 157 864 166
              C876 174 872 190 859 191
              C837 192 806 188 791 184
              C812 198 823 219 821 240
              C819 260 806 277 786 285
              C812 284 839 287 855 299
              C870 310 866 326 850 325
              C831 324 804 313 785 299
              C798 315 807 338 805 360
              C803 380 788 396 769 398
              C776 421 763 432 750 421
              C739 412 743 387 732 368
              C721 348 693 340 670 343
              C642 347 626 369 634 393
              C642 416 638 440 624 436
              C608 432 607 398 596 375
              C588 360 573 345 551 341
              C516 335 484 342 459 341
              C428 339 402 329 379 312
              C348 289 331 264 307 244
              C287 227 258 222 225 223
              C188 225 153 225 117 222
              C98 220 83 212 72 198
              C56 179 43 162 27 152
              C13 143 10 126 25 121
              C42 115 64 128 88 151
              C74 129 62 102 40 90
              C24 80 28 61 45 61
              C61 61 78 78 94 102
              C83 76 73 49 83 31
              C92 15 113 19 117 35
              C121 53 106 76 102 103
              C100 124 110 145 130 156
              C148 165 176 166 208 166
              C241 166 271 166 302 165
              C344 163 376 151 400 129
              C414 116 431 108 452 142
              Z
            "
          />
        </clipPath>

        <path
          id={`signal-path-top-${uid}`}
          d="M848 125 C816 119 784 121 755 126 C731 130 705 130 679 128"
        />
        <path
          id={`signal-path-mid-${uid}`}
          d="M848 214 C820 221 793 225 764 224 C731 223 701 213 678 203"
        />
        <path
          id={`signal-path-low-${uid}`}
          d="M848 304 C815 309 784 304 758 291 C732 278 706 270 682 266"
        />

        <path
          id={`axon-shaft-path-${uid}`}
          d="
            M455 223
            C412 223 367 223 325 223
            C277 223 232 225 186 225
            C147 225 113 223 83 221
          "
        />

        <filter id={fireGlowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={signalGlowId} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={shaftGlowId} x="-40%" y="-120%" width="180%" height="340%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style>{`
        .clean-neuron-svg {
          --neuron-stroke: #5a7aa8;
          --neuron-body: #eff5ff;
          --neuron-fill: #b9e2b5;
          --neuron-fill-soft: #d9efd4;
          --neuron-signal: #2388f3;
          --neuron-threshold: #ffa625;
          --neuron-fire: #ffc44a;
          --neuron-label: #6d7f98;
        }

        .line-round {
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .outline {
          fill: none;
          stroke: var(--neuron-stroke);
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .label {
          font-family: Inter, Arial, Helvetica, sans-serif;
          font-size: 13px;
          fill: var(--neuron-label);
        }

        .signal-dot {
          fill: var(--neuron-signal);
          filter: url(#${signalGlowId});
          transform-box: fill-box;
          transform-origin: center;
        }

        .signal-dot-1 {
          animation: signalMoveTop 2.1s ease-in-out infinite;
        }

        .signal-dot-2 {
          animation: signalMoveMid 2.28s ease-in-out infinite;
          animation-delay: 0.18s;
        }

        .signal-dot-3 {
          animation: signalMoveLow 2.45s ease-in-out infinite;
          animation-delay: 0.36s;
        }

        .axon-pulse-active {
          opacity: 1;
          animation: axonPulse 0.95s ease-out forwards;
        }

        .soma-fire-active {
          opacity: 1;
          animation: somaFireGlow 0.72s ease-out forwards;
        }

        .soma-fill {
          transition: y 420ms ease, height 420ms ease;
        }

        @keyframes axonPulse {
          0% {
            stroke-dashoffset: 260;
            opacity: 0;
          }
          14% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }

        @keyframes somaFireGlow {
          0% {
            opacity: 0;
            transform: scale(0.985);
            transform-origin: 510px 220px;
          }
          28% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: scale(1.03);
            transform-origin: 510px 220px;
          }
        }

        @keyframes signalMoveTop {
          0% { transform: translate(0px, 0px) scale(0.8); opacity: 0.2; }
          18% { opacity: 1; }
          100% { transform: translate(-145px, 8px) scale(0.92); opacity: 0; }
        }

        @keyframes signalMoveMid {
          0% { transform: translate(0px, 0px) scale(0.8); opacity: 0.2; }
          18% { opacity: 1; }
          100% { transform: translate(-150px, -8px) scale(0.92); opacity: 0; }
        }

        @keyframes signalMoveLow {
          0% { transform: translate(0px, 0px) scale(0.8); opacity: 0.2; }
          18% { opacity: 1; }
          100% { transform: translate(-152px, -22px) scale(0.92); opacity: 0; }
        }
      `}</style>

      <rect x="0" y="0" width="900" height="440" rx="28" fill="#ffffff" />

      <g id="mirror-root" transform={mirrored ? 'translate(900 0) scale(-1 1)' : undefined}>
        <g id="level-basic-core" data-level="1">
          <g id="neuron-core">
            <g id="axon-core">
              <path
                d="
                  M455 223
                  C412 223 367 223 325 223
                  C277 223 232 225 186 225
                  C147 225 113 223 83 221
                "
                fill="none"
                stroke="#5a7aa8"
                strokeWidth="10"
                className="line-round"
              />
              <path
                d="
                  M455 223
                  C412 223 367 223 325 223
                  C277 223 232 225 186 225
                  C147 225 113 223 83 221
                "
                fill="none"
                stroke="url(#${pulseGradientId})"
                strokeWidth="4.8"
                className="line-round"
                opacity="0.92"
              />
            </g>

            <g id="axon-pulse-group" filter={`url(#${shaftGlowId})`}>
              <use
                href={`#axon-shaft-path-${uid}`}
                id="axon-pulse"
                className={isFiring ? 'axon-pulse-active' : ''}
                fill="none"
                stroke="url(#${pulseGradientId})"
                strokeWidth="7"
                strokeDasharray="34 230"
                strokeDashoffset="260"
                opacity="0"
                strokeLinecap="round"
              />
              <circle
                id="axon-pulse-dot"
                cx="242"
                cy="223"
                r="8.5"
                fill="#ffffff"
                stroke="#ffc44a"
                strokeWidth="4"
                opacity={isFiring ? '1' : '0.95'}
                filter={`url(#${fireGlowId})`}
              />
            </g>

            <g id="axon-terminals" className="outline" strokeWidth="6">
              <path d="M83 221 C71 200 58 184 40 170" />
              <path d="M83 221 C64 210 44 203 20 201" />
              <path d="M83 221 C60 221 41 223 21 230" />
              <path d="M83 221 C63 234 44 247 25 263" />
              <path d="M83 221 C70 246 59 270 45 293" />

              <circle cx="36" cy="165" r="7.5" fill="#ffffff" stroke="#5a7aa8" />
              <circle cx="20" cy="201" r="7.5" fill="#ffffff" stroke="#5a7aa8" />
              <circle cx="21" cy="230" r="7.5" fill="#ffffff" stroke="#5a7aa8" />
              <circle cx="25" cy="263" r="7.5" fill="#ffffff" stroke="#5a7aa8" />
              <circle cx="45" cy="293" r="7.5" fill="#ffffff" stroke="#5a7aa8" />
            </g>

            <g id="soma-core">
              <path
                id="soma-outline"
                d="
                  M452 142
                  C493 137 533 148 566 166
                  C597 182 625 183 646 169
                  C662 158 673 132 672 106
                  C671 81 651 63 655 45
                  C660 22 683 13 689 30
                  C695 47 684 68 683 89
                  C682 114 693 137 716 144
                  C743 152 772 138 798 113
                  C815 97 834 78 851 84
                  C868 90 864 107 852 113
                  C826 126 797 151 783 172
                  C813 160 850 157 864 166
                  C876 174 872 190 859 191
                  C837 192 806 188 791 184
                  C812 198 823 219 821 240
                  C819 260 806 277 786 285
                  C812 284 839 287 855 299
                  C870 310 866 326 850 325
                  C831 324 804 313 785 299
                  C798 315 807 338 805 360
                  C803 380 788 396 769 398
                  C776 421 763 432 750 421
                  C739 412 743 387 732 368
                  C721 348 693 340 670 343
                  C642 347 626 369 634 393
                  C642 416 638 440 624 436
                  C608 432 607 398 596 375
                  C588 360 573 345 551 341
                  C516 335 484 342 459 341
                  C428 339 402 329 379 312
                  C348 289 331 264 307 244
                  C287 227 258 222 225 223
                  C188 225 153 225 117 222
                  C98 220 83 212 72 198
                  C56 179 43 162 27 152
                  C13 143 10 126 25 121
                  C42 115 64 128 88 151
                  C74 129 62 102 40 90
                  C24 80 28 61 45 61
                  C61 61 78 78 94 102
                  C83 76 73 49 83 31
                  C92 15 113 19 117 35
                  C121 53 106 76 102 103
                  C100 124 110 145 130 156
                  C148 165 176 166 208 166
                  C241 166 271 166 302 165
                  C344 163 376 151 400 129
                  C414 116 431 108 452 142
                  Z
                "
                fill={`url(#${bodyGradientId})`}
                stroke="#5a7aa8"
                strokeWidth="5"
                className="line-round"
              />

              <g id="soma-fill-group" clipPath={`url(#${somaClipId})`}>
                <path
                  id="soma-fill"
                  className="soma-fill"
                  d={`
                    M484 ${fillY}
                    C514 ${fillY - 8} 551 ${fillY + 4} 573 ${fillY + 36}
                    C589 ${fillY + 61} 593 ${fillY + 96} 584 137
                    C576 178 555 226 529 267
                    C516 287 492 294 476 282
                    C465 274 467 257 468 241
                    C470 219 467 198 466 177
                    C464 151 466 ${fillY + 22} 484 ${fillY}
                    Z
                  `}
                  fill={`url(#${fillGradientId})`}
                  opacity="0.92"
                />
              </g>

              <path
                id="threshold-curve"
                d="M472 150 C490 172 500 196 500 223 C500 245 494 268 482 290"
                fill="none"
                stroke="#ffa625"
                strokeWidth="4.5"
                className="line-round"
              />

              <g
                id="soma-fire-group"
                className={isFiring ? 'soma-fire-active' : ''}
                opacity="0"
                filter={`url(#${fireGlowId})`}
              >
                <path
                  id="soma-fire-glow"
                  d="
                    M452 142
                    C493 137 533 148 566 166
                    C597 182 625 183 646 169
                    C662 158 673 132 672 106
                    C671 81 651 63 655 45
                    C660 22 683 13 689 30
                    C695 47 684 68 683 89
                    C682 114 693 137 716 144
                    C743 152 772 138 798 113
                    C815 97 834 78 851 84
                    C868 90 864 107 852 113
                    C826 126 797 151 783 172
                    C813 160 850 157 864 166
                    C876 174 872 190 859 191
                    C837 192 806 188 791 184
                    C812 198 823 219 821 240
                    C819 260 806 277 786 285
                    C812 284 839 287 855 299
                    C870 310 866 326 850 325
                    C831 324 804 313 785 299
                    C798 315 807 338 805 360
                    C803 380 788 396 769 398
                    C776 421 763 432 750 421
                    C739 412 743 387 732 368
                    C721 348 693 340 670 343
                    C642 347 626 369 634 393
                    C642 416 638 440 624 436
                    C608 432 607 398 596 375
                    C588 360 573 345 551 341
                    C516 335 484 342 459 341
                    C428 339 402 329 379 312
                    C348 289 331 264 307 244
                    C287 227 258 222 225 223
                    C188 225 153 225 117 222
                    C98 220 83 212 72 198
                    C56 179 43 162 27 152
                    C13 143 10 126 25 121
                    C42 115 64 128 88 151
                    C74 129 62 102 40 90
                    C24 80 28 61 45 61
                    C61 61 78 78 94 102
                    C83 76 73 49 83 31
                    C92 15 113 19 117 35
                    C121 53 106 76 102 103
                    C100 124 110 145 130 156
                    C148 165 176 166 208 166
                    C241 166 271 166 302 165
                    C344 163 376 151 400 129
                    C414 116 431 108 452 142
                    Z
                  "
                  fill="none"
                  stroke="#ffd15c"
                  strokeWidth="6.2"
                  className="line-round"
                />
              </g>

              <path
                d="M432 223 L445 209 L458 223 L445 236 Z"
                fill="#ffffff"
                opacity="0.72"
              />
            </g>
          </g>

          <g id="stimulus-source">
            <circle cx="848" cy="125" r="6.5" className="signal-dot" />
            <circle cx="848" cy="214" r="6.5" className="signal-dot" />
            <circle cx="848" cy="304" r="6.5" className="signal-dot" />
          </g>

          <g id="incoming-signals-core">
            <g id="signal-path-top" fill="#2388f3">
              <circle id="signal-dot-top" className="signal-dot signal-dot-1" cx="732" cy="136" r="5.9" />
              <circle cx="747" cy="137" r="2.8" opacity="0.95" />
              <circle cx="760" cy="138" r="2.4" opacity="0.9" />
              <circle cx="772" cy="139" r="2.2" opacity="0.86" />
              <circle cx="785" cy="139" r="2.1" opacity="0.82" />
              <circle cx="799" cy="140" r="2.2" opacity="0.78" />
              <circle cx="813" cy="139" r="2.6" opacity="0.82" />
              <circle cx="827" cy="134" r="3.1" opacity="0.9" />
            </g>

            <g id="signal-path-mid" fill="#2388f3">
              <circle id="signal-dot-mid" className="signal-dot signal-dot-2" cx="738" cy="202" r="5.9" />
              <circle cx="752" cy="208" r="2.8" opacity="0.95" />
              <circle cx="766" cy="213" r="2.5" opacity="0.9" />
              <circle cx="779" cy="217" r="2.3" opacity="0.86" />
              <circle cx="792" cy="221" r="2.2" opacity="0.82" />
              <circle cx="805" cy="223" r="2.2" opacity="0.8" />
              <circle cx="818" cy="223" r="2.6" opacity="0.84" />
              <circle cx="833" cy="219" r="3.2" opacity="0.9" />
            </g>

            <g id="signal-path-low" fill="#2388f3">
              <circle id="signal-dot-low" className="signal-dot signal-dot-3" cx="744" cy="282" r="5.9" />
              <circle cx="758" cy="288" r="2.8" opacity="0.95" />
              <circle cx="771" cy="294" r="2.5" opacity="0.9" />
              <circle cx="784" cy="299" r="2.3" opacity="0.86" />
              <circle cx="798" cy="303" r="2.2" opacity="0.82" />
              <circle cx="811" cy="305" r="2.2" opacity="0.8" />
              <circle cx="824" cy="305" r="2.6" opacity="0.84" />
              <circle cx="838" cy="304" r="3.2" opacity="0.9" />
            </g>
          </g>
        </g>

        {level >= 2 && (
          <g id="level-structure" data-level="2" opacity={showLabels ? 1 : 0}>
            <g id="structure-labels">
              <text x="95" y="145" className="label">
                axon
              </text>
              <text x="468" y="117" className="label">
                soma
              </text>
              <text x="705" y="92" className="label">
                dendrites
              </text>
            </g>
          </g>
        )}

        {level >= 3 && (
          <g id="level-advanced-mechanism" data-level="3" opacity={showLabels ? 1 : 0}>
            <g id="excitatory-inputs-group">
              <circle cx="711" cy="135" r="4.2" fill="#2388f3" />
              <circle cx="707" cy="203" r="4.2" fill="#2388f3" />
              <circle cx="710" cy="266" r="4.2" fill="#2388f3" />
            </g>

            <g id="inhibitory-inputs-group">
              <circle cx="687" cy="162" r="4.2" fill="#9d8cff" />
              <circle cx="686" cy="289" r="4.2" fill="#9d8cff" />
            </g>

            <g id="axon-myelin-group" opacity="0" />
            <g id="nodes-of-ranvier-group" opacity="0" />
            <g id="synapse-hint-group" opacity="0" />

            {showLabels && (
              <g id="advanced-labels">
                <text x="516" y="145" className="label">
                  threshold
                </text>
              </g>
            )}
          </g>
        )}
      </g>
    </svg>
  )
}

import type { PointMarkerProps } from "./types";

export function PointMarker({ style }: PointMarkerProps) {
  return (
    <div className="point-marker" style={style}>
      <PointMarkerIcon />
      <PointMarkerIcon />
    </div>
  );
}

function PointMarkerIcon() {
  return (
    /** biome-ignore lint/a11y/noSvgWithoutTitle: Image hidden from screen readers */
    <svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="currentColor">
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <line x1="50" y1="6" x2="50" y2="26" stroke-width="6" stroke-linecap="round" />
        <line x1="50" y1="74" x2="50" y2="94" stroke-width="6" stroke-linecap="round" />
        <line x1="6" y1="50" x2="26" y2="50" stroke-width="6" stroke-linecap="round" />
        <line x1="74" y1="50" x2="94" y2="50" stroke-width="6" stroke-linecap="round" />
      </g>
    </svg>
  );
}

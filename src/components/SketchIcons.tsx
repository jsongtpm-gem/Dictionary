/**
 * Hand-drawn sketch-style SVG icons.
 * All paths use round linecaps/joins and slight bezier wobbles
 * so they feel drawn rather than generated.
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

/** Open book with page-lines — for the Dictionary tab */
export function BookIcon({ size = 24, color = '#000' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Left page */}
      <Path
        d="M12 19.5 C9.5 18.5 6.5 18.2 4 19 L4 6 C6.5 5.3 9.5 5.4 12 6.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right page */}
      <Path
        d="M12 19.5 C14.5 18.5 17.5 18.2 20 19 L20 6 C17.5 5.3 14.5 5.4 12 6.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Spine */}
      <Path
        d="M12 6.5 L12 19.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Wobbly text lines — left page */}
      <Path d="M5.5 10 C7.5 9.6 9.5 9.5 11 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />
      <Path d="M5.5 13 C7.5 12.6 9.5 12.5 11 13" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />
      <Path d="M5.5 16 C7.5 15.6 9.5 15.5 11 16" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />
      {/* Wobbly text lines — right page */}
      <Path d="M13 10 C15 9.6 17 9.5 18.5 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />
      <Path d="M13 13 C15 12.6 17 12.5 18.5 13" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />
      <Path d="M13 16 C15 15.6 17 15.5 18.5 16" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

/** Stacked cards with a back card tilted — for the Practice tab */
export function CardsIcon({ size = 24, color = '#000' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Back card — slightly rotated, offset */}
      <Path
        d="M6 8 L18.5 7 L19 15.5 L6.5 16.5 Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.4}
      />
      {/* Front card */}
      <Path
        d="M4 10 L20 10 L20 21 L4 21 Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Word lines on front card */}
      <Path d="M7 14.5 C11 14 15 14 17 14.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />
      <Path d="M7 17.5 C10 17 13 17 15.5 17.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

/**
 * Sketch-style checkbox.
 * `checked=false` → empty wobbly box
 * `checked=true`  → box + quick checkmark stroke
 */
export function CheckboxIcon({
  size = 20,
  color = '#000',
  checked = false,
}: Props & { checked?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {/* Slightly imperfect box — corners don't sit perfectly flat */}
      <Path
        d="M3.5 3.5 L16 3 L16.5 16.5 L3 17 Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {checked && (
        <Path
          d="M5.5 10 L8.5 13.5 L15 6.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

import React from 'react';

// Wordmark only (brand guide: no pictorial logo yet). "Sangka" in petrol 600,
// "Learn" in ink, IBM Plex Sans medium, flat color, no gradient.
export default function ApplicationLogo({ className = "", width = "180", height = "48", variant = "light", ...props }) {
    // "dark" variant is for Petrol 900 sections (footers).
    const dark = variant === "dark";
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 180 48"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="SangkaLearn"
            {...props}
        >
            <text
                x="0"
                y="30"
                fontFamily='"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif'
                fontSize="26"
                fontWeight="500"
                letterSpacing="-0.5"
            >
                <tspan fill={dark ? "#85BABD" : "#0D5C63"}>Sangka</tspan>
                <tspan fill={dark ? "#FCFCFB" : "#17181A"}>Learn</tspan>
            </text>
            <rect x="1" y="37" width="24" height="1.5" fill={dark ? "#E2CDB0" : "#8A5A2B"} />
        </svg>
    );
}

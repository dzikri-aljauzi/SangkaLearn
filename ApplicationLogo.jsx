import React from 'react';

export default function ApplicationLogo({ className = "", width = "180", height = "48", ...props }) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 180 48"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <defs>
                {/* Gradient for modern look */}
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor:"#1e40af", stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"#3b82f6", stopOpacity:1}} />
                </linearGradient>
                
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor:"#f59e0b", stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"#fbbf24", stopOpacity:1}} />
                </linearGradient>

                <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor:"#1e40af", stopOpacity:1}} />
                    <stop offset="50%" style={{stopColor:"#3b82f6", stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"#1e40af", stopOpacity:1}} />
                </linearGradient>
            </defs>
            
            {/* Logo Icon (Left Side) */}
            <g id="logoIcon">
                {/* Background Circle */}
                <circle cx="24" cy="24" r="20" fill="url(#blueGradient)" stroke="#3b82f6" strokeWidth="1"/>
                
                {/* Book Base */}
                <rect x="14" y="16" width="12" height="16" rx="1.5" fill="#ffffff" opacity="0.95"/>
                
                {/* Book Pages */}
                <rect x="15.5" y="17.5" width="9" height="0.8" fill="#1e40af" opacity="0.3"/>
                <rect x="15.5" y="19.5" width="8" height="0.8" fill="#1e40af" opacity="0.3"/>
                <rect x="15.5" y="21.5" width="9" height="0.8" fill="#1e40af" opacity="0.3"/>
                <rect x="15.5" y="23.5" width="7" height="0.8" fill="#1e40af" opacity="0.3"/>
                
                {/* Graduation Cap */}
                <polygon points="28,14 36,16.5 28,19 20,16.5" fill="url(#goldGradient)"/>
                <rect x="27" y="19" width="2" height="6" fill="#92400e"/>
                <circle cx="28.5" cy="25" r="1" fill="#92400e"/>
                
                {/* Academic Symbol (Small Diploma) */}
                <rect x="30" y="20" width="6" height="4" rx="0.5" fill="#ffffff" opacity="0.9"/>
                <rect x="30.5" y="21" width="5" height="0.4" fill="#1e40af" opacity="0.5"/>
                <rect x="30.5" y="22.5" width="4" height="0.4" fill="#1e40af" opacity="0.5"/>
                
                {/* Digital Elements (Binary dots) */}
                <circle cx="10" cy="12" r="0.8" fill="#06b6d4" opacity="0.7"/>
                <circle cx="38" cy="32" r="0.8" fill="#06b6d4" opacity="0.7"/>
                <circle cx="8" cy="36" r="0.8" fill="#06b6d4" opacity="0.7"/>
                
                {/* Knowledge Rays */}
                <path d="M24 8 L25.5 12 L22.5 12 Z" fill="url(#goldGradient)" opacity="0.8"/>
                <path d="M24 40 L25.5 36 L22.5 36 Z" fill="url(#goldGradient)" opacity="0.8"/>
                <path d="M8 24 L12 25.5 L12 22.5 Z" fill="url(#goldGradient)" opacity="0.8"/>
                <path d="M40 24 L36 25.5 L36 22.5 Z" fill="url(#goldGradient)" opacity="0.8"/>
            </g>
            
            {/* LeadNEX Text */}
            <g id="logoText">
                {/* Lead */}
                <text 
                    x="52" 
                    y="20" 
                    fontFamily="system-ui, -apple-system, sans-serif" 
                    fontSize="18" 
                    fontWeight="700" 
                    fill="url(#textGradient)"
                >
                    Lead
                </text>
                
                {/* NEX */}
                <text 
                    x="96" 
                    y="20" 
                    fontFamily="system-ui, -apple-system, sans-serif" 
                    fontSize="18" 
                    fontWeight="700" 
                    fill="url(#goldGradient)"
                >
                    NEX
                </text>
                
                {/* Tagline */}
                <text 
                    x="52" 
                    y="32" 
                    fontFamily="system-ui, -apple-system, sans-serif" 
                    fontSize="8" 
                    fontWeight="600" 
                    fill="#64748b" 
                    letterSpacing="1.5px"
                >
                    LEARNING PLATFORM
                </text>
                
                {/* Decorative underline */}
                <rect x="52" y="34" width="88" height="2" rx="1" fill="url(#blueGradient)" opacity="0.3"/>
                <rect x="52" y="36" width="45" height="1" rx="0.5" fill="url(#goldGradient)" opacity="0.6"/>
            </g>
            
            {/* Modern accent elements */}
            <g id="accents">
                {/* Small dots for modern touch */}
                <circle cx="144" cy="12" r="1.5" fill="url(#goldGradient)" opacity="0.7"/>
                <circle cx="150" cy="16" r="1" fill="url(#blueGradient)" opacity="0.6"/>
                <circle cx="155" cy="10" r="0.8" fill="#06b6d4" opacity="0.8"/>
                
                {/* Stylish line elements */}
                <path d="M148 40 Q152 38 156 40" stroke="url(#goldGradient)" strokeWidth="1.5" fill="none" opacity="0.7"/>
                <path d="M162 20 Q166 18 170 20" stroke="url(#blueGradient)" strokeWidth="1" fill="none" opacity="0.6"/>
            </g>
        </svg>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { Award, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LSPCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef(null);
    const intervalRef = useRef(null);

    const lspData = [
        {
            name: 'BSMR',
            fullName: 'LSP BSMR',
            logo: '/images/bsmr.JPG',
            hasLogo: true
        },
        {
            name: 'LSPKS',
            fullName: 'LSP Keuangan Syariah',
            logo: '/images/lspks.PNG',
            hasLogo: true
        },
        {
            name: 'LSPPM',
            fullName: 'LSP PM',
            logo: '/images/lsppm.png',
            hasLogo: true
        },
        {
            name: 'LSP TRK',
            fullName: 'LSP TRK',
            logo: '/images/lsptrk.PNG',
            hasLogo: true
        },
        {
            name: 'LSP MSDM Apindo Jaya',
            fullName: 'LSP MSDM Apindo Jaya',
            logo: '/images/apindo.png',
            hasLogo: true
        },
        {
            name: 'LSP Bisnis Digital Indonesia',
            fullName: 'LSP Bisnis Digital Indonesia',
            logo: '/images/lspbisdi.png',
            hasLogo: true
        }
    ];

    // Calculate items per view based on screen size
    const getItemsPerView = () => {
        if (typeof window === 'undefined') return 3;
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    };

    const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

    useEffect(() => {
        const handleResize = () => {
            setItemsPerView(getItemsPerView());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = lspData.length - itemsPerView;

    // Auto-scroll functionality - Optimized: 3000ms
    useEffect(() => {
        if (!isPaused) {
            intervalRef.current = setInterval(() => {
                handleNext();
            }, 3000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, currentIndex, itemsPerView]);

    const handleNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        setTimeout(() => setIsTransitioning(false), 800);
    };

    const handlePrev = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
        setTimeout(() => setIsTransitioning(false), 800);
    };

    return (
        <div
            className="w-full overflow-hidden bg-blue-50 py-8 rounded-2xl relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <style>{`
                @keyframes shimmer {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }
                .shimmer {
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.3) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    background-size: 1000px 100%;
                    animation: shimmer 3s infinite;
                }
            `}</style>

            {/* Navigation Buttons */}
            <button
                onClick={handlePrev}
                disabled={isTransitioning}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 border-2 border-yellow-300 hover:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous"
            >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </button>
            <button
                onClick={handleNext}
                disabled={isTransitioning}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 border-2 border-yellow-300 hover:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next"
            >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </button>

            {/* Carousel Container */}
            <div className="relative h-64 sm:h-72 overflow-hidden px-4">
                <div
                    ref={containerRef}
                    className="flex transition-transform duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] h-full"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                        willChange: 'transform'
                    }}
                >
                    {lspData.map((lsp, index) => (
                        <div
                            key={`${lsp.name}-${index}`}
                            className="flex-shrink-0 px-3 sm:px-4"
                            style={{ width: `${100 / itemsPerView}%` }}
                        >
                            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden h-full relative group/card">
                                {/* Shimmer effect on hover */}
                                <div className="absolute inset-0 shimmer opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>

                                {/* LSP Logo Container */}
                                <div className="h-40 sm:h-44 flex items-center justify-center p-4 bg-white relative">
                                    {lsp.hasLogo ? (
                                        <img
                                            src={lsp.logo}
                                            alt={lsp.fullName}
                                            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover/card:scale-110"
                                            loading="lazy"
                                            onError={(e) => {
                                                const container = e.target.parentElement;
                                                container.innerHTML = `
                                                    <div class="w-full h-full flex flex-col items-center justify-center">
                                                        <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                                                            <span class="text-white font-bold text-lg">${lsp.name.substring(0, 3)}</span>
                                                        </div>
                                                    </div>
                                                `;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-2 animate-pulse">
                                                <Award className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Certified Badge */}
                                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                </div>

                                {/* LSP Info */}
                                <div className="p-3 sm:p-4 bg-blue-600 text-white">
                                    <h4 className="font-bold text-sm sm:text-base mb-1 text-center leading-tight">
                                        {lsp.name}
                                    </h4>
                                    {lsp.name !== 'LSP Bisnis Digital Indonesia' && (
                                        <div className="flex items-center justify-center space-x-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <p className="text-xs text-blue-100 font-medium">
                                                Berlisensi BNSP
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (!isTransitioning) {
                                setIsTransitioning(true);
                                setCurrentIndex(index);
                                setTimeout(() => setIsTransitioning(false), 800);
                            }
                        }}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            currentIndex === index
                                ? 'w-8 bg-blue-600'
                                : 'w-2 bg-blue-300 hover:bg-blue-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
}

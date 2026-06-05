import React, { useState, useEffect, useRef } from 'react';
import { Building2, GraduationCap, Landmark, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PartnerCarousel() {
    const [currentIndex1, setCurrentIndex1] = useState(0);
    const [currentIndex2, setCurrentIndex2] = useState(0);
    const [isTransitioning1, setIsTransitioning1] = useState(false);
    const [isTransitioning2, setIsTransitioning2] = useState(false);
    const [isPaused1, setIsPaused1] = useState(false);
    const [isPaused2, setIsPaused2] = useState(false);
    const intervalRef1 = useRef(null);
    const intervalRef2 = useRef(null);

    // Row 1: Bank Partners (scroll left to right)
    const bankPartners = [
        { name: 'Bank Jateng', logo: '/images/bankjateng.png', category: 'bank' },
        { name: 'Bank BPD Bali', logo: '/images/bankbpdbali.png', category: 'bank' },
        { name: 'Bank SumselBabel', logo: '/images/banksumsel.png', category: 'bank' },
        { name: 'Bankaltimtara', logo: '/images/Bankaltimtara.png', category: 'bank' },
        { name: 'Bank BPD DIY', logo: '/images/BankBPDDIY.png', category: 'bank' },
        { name: 'Bank Bengkulu', logo: '/images/BankBengkulu.png', category: 'bank' },
        { name: 'BSI', logo: '/images/bsi.png', category: 'bank' },
        { name: 'Bank Aceh', logo: '/images/bankaceh.png', category: 'bank' },
        { name: 'Bank Jatim', logo: '/images/bankjatim.png', category: 'bank' },
    ];

    // Row 2: Corporate & Education Partners (scroll right to left)
    const corporatePartners = [
        { name: 'BNI', logo: '/images/bni.png', category: 'bank' },
        { name: 'Mandiri', logo: '/images/mandiri.png', category: 'bank' },
        { name: 'BJB Syariah', logo: '/images/bankbjpsyariah.jpg', category: 'bank' },
        { name: 'Dirgantara Indonesia', logo: '/images/Dirgantara Indonesia.jpg', category: 'corporate' },
        { name: 'NTP', logo: '/images/ntp.png', category: 'corporate' },
        { name: 'Universitas Mulawarman', logo: '/images/UniversitasMulawarman.png', category: 'education' },
        { name: 'STIE YKPN', logo: '/images/STIEYKPN.png', category: 'education' },
        { name: 'Universitas BPD', logo: '/images/UniversitasBPD.png', category: 'education' },
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

    const maxIndex1 = bankPartners.length - itemsPerView;
    const maxIndex2 = corporatePartners.length - itemsPerView;

    // Auto-scroll Row 1 (left to right) - Optimized: 2800ms
    useEffect(() => {
        if (!isPaused1) {
            intervalRef1.current = setInterval(() => {
                handleNext1();
            }, 2800);
        }

        return () => {
            if (intervalRef1.current) {
                clearInterval(intervalRef1.current);
            }
        };
    }, [isPaused1, currentIndex1, itemsPerView]);

    // Auto-scroll Row 2 (right to left) - Optimized: 3200ms
    useEffect(() => {
        if (!isPaused2) {
            intervalRef2.current = setInterval(() => {
                handlePrev2();
            }, 3200);
        }

        return () => {
            if (intervalRef2.current) {
                clearInterval(intervalRef2.current);
            }
        };
    }, [isPaused2, currentIndex2, itemsPerView]);

    const handleNext1 = () => {
        if (isTransitioning1) return;
        setIsTransitioning1(true);
        setCurrentIndex1((prev) => (prev >= maxIndex1 ? 0 : prev + 1));
        setTimeout(() => setIsTransitioning1(false), 800);
    };

    const handlePrev1 = () => {
        if (isTransitioning1) return;
        setIsTransitioning1(true);
        setCurrentIndex1((prev) => (prev <= 0 ? maxIndex1 : prev - 1));
        setTimeout(() => setIsTransitioning1(false), 800);
    };

    const handleNext2 = () => {
        if (isTransitioning2) return;
        setIsTransitioning2(true);
        setCurrentIndex2((prev) => (prev >= maxIndex2 ? 0 : prev + 1));
        setTimeout(() => setIsTransitioning2(false), 800);
    };

    const handlePrev2 = () => {
        if (isTransitioning2) return;
        setIsTransitioning2(true);
        setCurrentIndex2((prev) => (prev <= 0 ? maxIndex2 : prev - 1));
        setTimeout(() => setIsTransitioning2(false), 800);
    };

    const getCategoryIcon = (category) => {
        switch(category) {
            case 'bank':
                return <Landmark className="w-4 h-4 text-blue-500" />;
            case 'corporate':
                return <Building2 className="w-4 h-4 text-purple-500" />;
            case 'education':
                return <GraduationCap className="w-4 h-4 text-green-500" />;
            default:
                return null;
        }
    };

    const PartnerCard = ({ partner }) => (
        <div className="w-64 h-40 bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-400 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl overflow-hidden group relative">
            {/* Category Badge */}
            <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
                {getCategoryIcon(partner.category)}
            </div>

            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Logo Container */}
            <div className="w-full h-full flex items-center justify-center p-6 relative z-0">
                <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain filter grayscale-0 group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                        const container = e.target.parentElement;
                        container.innerHTML = `
                            <div class="w-full h-full flex flex-col items-center justify-center">
                                <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
                                    <span class="text-white font-bold text-lg">${partner.name.substring(0, 3).toUpperCase()}</span>
                                </div>
                                <span class="text-sm text-gray-700 font-semibold text-center px-2">${partner.name}</span>
                            </div>
                        `;
                    }}
                />
            </div>

            {/* Partner Name on Hover */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-xs font-semibold text-center truncate">{partner.name}</p>
            </div>
        </div>
    );

    return (
        <div className="w-full overflow-hidden py-8 space-y-6 relative">
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .fade-in {
                    animation: fadeIn 0.8s ease-out;
                }
            `}</style>

            {/* Row 1: Banks - Auto Scroll Right */}
            <div
                className="relative fade-in group"
                onMouseEnter={() => setIsPaused1(true)}
                onMouseLeave={() => setIsPaused1(false)}
            >
                {/* Navigation Buttons */}
                <button
                    onClick={handlePrev1}
                    disabled={isTransitioning1}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 border-2 border-blue-200 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous Bank"
                >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </button>
                <button
                    onClick={handleNext1}
                    disabled={isTransitioning1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 border-2 border-blue-200 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next Bank"
                >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </button>

                <div className="relative h-48 overflow-hidden px-4">
                    <div
                        className="flex transition-transform duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] h-full items-center"
                        style={{
                            transform: `translateX(-${currentIndex1 * (100 / itemsPerView)}%)`,
                            willChange: 'transform'
                        }}
                    >
                        {bankPartners.map((partner, index) => (
                            <div
                                key={`bank-${partner.name}-${index}`}
                                className="flex-shrink-0 px-4 flex items-center justify-center"
                                style={{ width: `${100 / itemsPerView}%` }}
                            >
                                <PartnerCard partner={partner} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 2: Corporate & Education - Auto Scroll Left */}
            <div
                className="relative fade-in group"
                style={{ animationDelay: '0.2s' }}
                onMouseEnter={() => setIsPaused2(true)}
                onMouseLeave={() => setIsPaused2(false)}
            >
                {/* Navigation Buttons */}
                <button
                    onClick={handlePrev2}
                    disabled={isTransitioning2}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 border-2 border-purple-200 hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous Partner"
                >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </button>
                <button
                    onClick={handleNext2}
                    disabled={isTransitioning2}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 border-2 border-purple-200 hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next Partner"
                >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </button>

                <div className="relative h-48 overflow-hidden px-4">
                    <div
                        className="flex transition-transform duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] h-full items-center"
                        style={{
                            transform: `translateX(-${currentIndex2 * (100 / itemsPerView)}%)`,
                            willChange: 'transform'
                        }}
                    >
                        {corporatePartners.map((partner, index) => (
                            <div
                                key={`corporate-${partner.name}-${index}`}
                                className="flex-shrink-0 px-4 flex items-center justify-center"
                                style={{ width: `${100 / itemsPerView}%` }}
                            >
                                <PartnerCard partner={partner} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

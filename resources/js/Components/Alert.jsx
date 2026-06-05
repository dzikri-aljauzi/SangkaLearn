import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, ShoppingCart, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function Alert({ 
    type = 'success', 
    title, 
    message, 
    show = false, 
    onClose, 
    autoClose = true, 
    duration = 4000,
    position = 'top-right',
    icon: CustomIcon,
    className = ""
}) {
    const [isVisible, setIsVisible] = useState(show);

    useEffect(() => {
        setIsVisible(show);
        
        if (show && autoClose) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            
            return () => clearTimeout(timer);
        }
    }, [show, autoClose, duration]);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) {
            setTimeout(onClose, 300); // Wait for animation to complete
        }
    };

    const typeStyles = {
        success: {
            bg: 'bg-green-50 border-green-200',
            text: 'text-green-800',
            titleText: 'text-green-900',
            icon: CheckCircle,
            iconColor: 'text-green-400',
            closeButton: 'text-green-400 hover:text-green-600'
        },
        error: {
            bg: 'bg-red-50 border-red-200',
            text: 'text-red-800',
            titleText: 'text-red-900',
            icon: AlertCircle,
            iconColor: 'text-red-400',
            closeButton: 'text-red-400 hover:text-red-600'
        },
        warning: {
            bg: 'bg-yellow-50 border-yellow-200',
            text: 'text-yellow-800',
            titleText: 'text-yellow-900',
            icon: AlertTriangle,
            iconColor: 'text-yellow-400',
            closeButton: 'text-yellow-400 hover:text-yellow-600'
        },
        info: {
            bg: 'bg-blue-50 border-blue-200',
            text: 'text-blue-800',
            titleText: 'text-blue-900',
            icon: Info,
            iconColor: 'text-blue-400',
            closeButton: 'text-blue-400 hover:text-blue-600'
        }
    };

    const positionStyles = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    const currentStyle = typeStyles[type];
    const IconComponent = CustomIcon || currentStyle.icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`fixed z-50 ${positionStyles[position]} max-w-sm w-full mx-4`}
                >
                    <div className={`rounded-lg border p-4 shadow-lg backdrop-blur-sm ${currentStyle.bg} ${className}`}>
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <IconComponent className={`h-6 w-6 ${currentStyle.iconColor}`} />
                            </div>
                            <div className="ml-3 flex-1">
                                {title && (
                                    <h3 className={`text-sm font-semibold ${currentStyle.titleText} mb-1`}>
                                        {title}
                                    </h3>
                                )}
                                <p className={`text-sm ${currentStyle.text}`}>
                                    {message}
                                </p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                                <button
                                    onClick={handleClose}
                                    className={`inline-flex ${currentStyle.closeButton} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600 rounded-md p-1 hover:bg-white/10 transition-colors`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Progress bar for auto close */}
                        {autoClose && (
                            <motion.div
                                className="mt-3 h-1 bg-black/10 rounded-full overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <motion.div
                                    className={`h-full ${currentStyle.iconColor.replace('text-', 'bg-')}`}
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: duration / 1000, ease: "linear" }}
                                />
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Pre-configured cart success alert
export function CartSuccessAlert({ show, onClose, courseName }) {
    return (
        <Alert
            type="success"
            title="Berhasil Ditambahkan!"
            message={`${courseName} telah ditambahkan ke keranjang Anda`}
            show={show}
            onClose={onClose}
            icon={ShoppingCart}
            duration={3000}
            position="top-right"
        />
    );
}
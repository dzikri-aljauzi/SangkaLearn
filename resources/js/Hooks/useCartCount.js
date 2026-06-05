import { useState, useEffect } from 'react';
import axios from 'axios';

export function useCartCount() {
    const [cartCount, setCartCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCartCount = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/cart/count');
            setCartCount(response.data.count);
        } catch (error) {
            console.error('Failed to fetch cart count:', error);
            setCartCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCartCount();
    }, []);

    const incrementCount = () => setCartCount(prev => prev + 1);
    const decrementCount = () => setCartCount(prev => Math.max(0, prev - 1));
    const resetCount = () => setCartCount(0);

    return {
        cartCount,
        isLoading,
        fetchCartCount,
        incrementCount,
        decrementCount,
        resetCount
    };
}
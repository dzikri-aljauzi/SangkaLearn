import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error silently, don't show to user
        // In production, you might want to send this to an error reporting service
    }

    render() {
        if (this.state.hasError) {
            // Return null to render nothing instead of error UI
            return null;
        }

        return this.props.children;
    }
}

const ErrorHandler = ({ children }) => {
    // Global error boundary untuk menangkap semua error
    React.useEffect(() => {
        const handleError = (event) => {
            // Prevent default error display - silent handling
            event.preventDefault();
            
            // Only show errors in development
            if (import.meta.env.DEV) {
                console.error('Uncaught error:', event.error);
            }
        };

        const handleUnhandledRejection = (event) => {
            // Prevent default error display - silent handling
            event.preventDefault();
            
            // Only show errors in development
            if (import.meta.env.DEV) {
                console.error('Unhandled promise rejection:', event.reason);
            }
        };

        // Add global error listeners
        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        // Cleanup
        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    return (
        <ErrorBoundary>
            {children}
        </ErrorBoundary>
    );
};

export default ErrorHandler;
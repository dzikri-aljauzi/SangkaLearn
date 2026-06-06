import React from 'react';
import { Head } from '@inertiajs/react';

export default function StudentsTest({ message }) {
    return (
        <>
            <Head title="Students Test" />
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1>Students Test Page (Inertia)</h1>
                <p>{message}</p>
                <p>If you can see this page, Inertia is working correctly.</p>
                
                <div style={{ marginTop: '20px' }}>
                    <a href="/admin/users/students-test" style={{ 
                        padding: '10px 15px', 
                        background: '#007bff', 
                        color: 'white', 
                        textDecoration: 'none', 
                        borderRadius: '5px',
                        marginRight: '10px'
                    }}>
                        Back to HTML Test
                    </a>
                    
                    <a href="/admin/users/students" style={{ 
                        padding: '10px 15px', 
                        background: '#28a745', 
                        color: 'white', 
                        textDecoration: 'none', 
                        borderRadius: '5px'
                    }}>
                        Try Real Students Page
                    </a>
                </div>
            </div>
        </>
    );
}
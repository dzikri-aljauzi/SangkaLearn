import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen } from 'lucide-react';

const SimpleChart = ({ type, data, title, className = "" }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const renderBarChart = () => {
        if (!data || data.length === 0) return <div className="text-gray-500 text-center py-8">No data available</div>;
        
        const maxValue = Math.max(...data.map(item => item.value));
        
        return (
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        <div className="w-20 text-sm text-gray-600 font-medium">
                            {item.label}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                            <div 
                                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                                    index % 4 === 0 ? 'bg-blue-500' :
                                    index % 4 === 1 ? 'bg-green-500' :
                                    index % 4 === 2 ? 'bg-purple-500' : 'bg-yellow-500'
                                }`}
                                style={{ 
                                    width: `${(item.value / maxValue) * 100}%`,
                                    minWidth: item.value > 0 ? '8px' : '0px'
                                }}
                            ></div>
                        </div>
                        <div className="w-12 text-sm font-semibold text-gray-900 text-right">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderLineChart = () => {
        if (!data || data.length === 0) return <div className="text-gray-500 text-center py-8">No data available</div>;
        
        const maxValue = Math.max(...data.map(item => item.value));
        const minValue = Math.min(...data.map(item => item.value));
        const range = maxValue - minValue || 1;

        const handleMouseEnter = (item, index, event) => {
            setHoveredPoint({ ...item, index });
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            });
        };

        const handleMouseLeave = () => {
            setHoveredPoint(null);
        };
        
        return (
            <div className="relative h-40">
                {/* Tooltip */}
                {hoveredPoint && (
                    <div 
                        className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none transform -translate-x-1/2 -translate-y-full"
                        style={{
                            left: tooltipPosition.x,
                            top: tooltipPosition.y
                        }}
                    >
                        <div className="font-medium">{hoveredPoint.label}</div>
                        <div className="text-blue-300">{hoveredPoint.value.toLocaleString()} pengguna</div>
                        <div 
                            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
                        ></div>
                    </div>
                )}

                <svg className="w-full h-full" viewBox="0 0 400 160">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                        <line 
                            key={i}
                            x1="40" 
                            y1={30 + (i * 25)} 
                            x2="380" 
                            y2={30 + (i * 25)}
                            stroke="#F2F3F1" 
                            strokeWidth="1"
                        />
                    ))}
                    
                    {/* Y-axis labels */}
                    {[0, 1, 2, 3, 4].map(i => {
                        const value = Math.round(maxValue - (i * (range / 4)));
                        return (
                            <text
                                key={i}
                                x="35"
                                y={35 + (i * 25)}
                                textAnchor="end"
                                className="text-xs fill-gray-500"
                            >
                                {value}
                            </text>
                        );
                    })}
                    
                    {/* Data line */}
                    <polyline
                        fill="none"
                        stroke="#2A7C82"
                        strokeWidth="3"
                        points={data.map((item, index) => {
                            const x = 40 + (index * (340 / (data.length - 1)));
                            const y = 130 - ((item.value - minValue) / range) * 100;
                            return `${x},${y}`;
                        }).join(' ')}
                    />
                    
                    {/* Data points */}
                    {data.map((item, index) => {
                        const x = 40 + (index * (340 / (data.length - 1)));
                        const y = 130 - ((item.value - minValue) / range) * 100;
                        return (
                            <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r={hoveredPoint?.index === index ? "6" : "4"}
                                fill="#2A7C82"
                                className="transition-all cursor-pointer hover:fill-blue-700"
                                onMouseEnter={(e) => handleMouseEnter(item, index, e)}
                                onMouseLeave={handleMouseLeave}
                            />
                        );
                    })}
                    
                    {/* Labels */}
                    {data.map((item, index) => {
                        const x = 40 + (index * (340 / (data.length - 1)));
                        return (
                            <text
                                key={index}
                                x={x}
                                y="155"
                                textAnchor="middle"
                                className="text-xs fill-gray-600"
                            >
                                {item.label}
                            </text>
                        );
                    })}
                </svg>
            </div>
        );
    };

    const renderDonutChart = () => {
        if (!data || data.length === 0) return <div className="text-gray-500 text-center py-8">No data available</div>;
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;
        const colors = ['#2A7C82', '#10b981', '#2A7C82', '#f59e0b', '#ef4444'];
        
        return (
            <div className="flex items-center justify-center space-x-6">
                <div className="relative">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="#F2F3F1"
                            strokeWidth="8"
                        />
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const strokeDasharray = `${percentage * 3.14} 314`;
                            const strokeDashoffset = -currentAngle * 3.14;
                            currentAngle += percentage;
                            
                            return (
                                <circle
                                    key={index}
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke={colors[index % colors.length]}
                                    strokeWidth="8"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    transform="rotate(-90 60 60)"
                                    className="transition-all duration-1000"
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{total}</div>
                            <div className="text-xs text-gray-500">Total</div>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            ></div>
                            <span className="text-sm text-gray-600">{item.label}</span>
                            <span className="text-sm font-semibold text-gray-900">({item.value})</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const getIcon = () => {
        switch (type) {
            case 'bar': return <BarChart3 className="w-5 h-5 text-blue-600" />;
            case 'line': return <TrendingUp className="w-5 h-5 text-green-600" />;
            case 'donut': return <Users className="w-5 h-5 text-purple-600" />;
            default: return <BarChart3 className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {getIcon()}
            </div>
            
            <div className="mt-4">
                {type === 'bar' && renderBarChart()}
                {type === 'line' && renderLineChart()}
                {type === 'donut' && renderDonutChart()}
            </div>
        </div>
    );
};

export default SimpleChart;
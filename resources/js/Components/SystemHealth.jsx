import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Server, 
    Database, 
    Wifi, 
    HardDrive,
    Cpu,
    MemoryStick,
    Activity,
    CheckCircle,
    AlertTriangle,
    XCircle,
    RefreshCw,
    Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function SystemHealth({ className = '', autoRefresh = true }) {
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Sample system health data
    const [healthData, setHealthData] = useState({
        server: {
            status: 'healthy',
            uptime: '99.9%',
            response_time: '45ms',
            last_restart: '2024-01-10T08:00:00Z'
        },
        database: {
            status: 'healthy',
            connections: 12,
            query_time: '2.3ms',
            storage_used: '78%'
        },
        network: {
            status: 'healthy',
            bandwidth: '125 Mbps',
            latency: '12ms',
            packet_loss: '0.1%'
        },
        storage: {
            status: 'warning',
            disk_usage: '85%',
            available_space: '2.4 GB',
            backup_status: 'completed'
        },
        performance: {
            cpu_usage: '34%',
            memory_usage: '67%',
            load_average: '0.8',
            active_users: 147
        }
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
                return { 
                    icon: CheckCircle, 
                    color: 'text-green-600', 
                    bg: 'bg-green-100',
                    border: 'border-green-200'
                };
            case 'warning':
                return { 
                    icon: AlertTriangle, 
                    color: 'text-yellow-600', 
                    bg: 'bg-yellow-100',
                    border: 'border-yellow-200'
                };
            case 'critical':
                return { 
                    icon: XCircle, 
                    color: 'text-red-600', 
                    bg: 'bg-red-100',
                    border: 'border-red-200'
                };
            default:
                return { 
                    icon: Activity, 
                    color: 'text-gray-600', 
                    bg: 'bg-gray-100',
                    border: 'border-gray-200'
                };
        }
    };

    const refreshHealth = async () => {
        setIsRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setLastUpdated(new Date());
            setIsRefreshing(false);
        }, 1000);
    };

    // Auto refresh every 30 seconds
    useEffect(() => {
        if (!autoRefresh) return;
        
        const interval = setInterval(() => {
            setLastUpdated(new Date());
        }, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const systemComponents = [
        {
            name: 'Server',
            icon: Server,
            data: healthData.server,
            metrics: [
                { label: 'Uptime', value: healthData.server.uptime },
                { label: 'Response Time', value: healthData.server.response_time }
            ]
        },
        {
            name: 'Database',
            icon: Database,
            data: healthData.database,
            metrics: [
                { label: 'Connections', value: healthData.database.connections },
                { label: 'Storage Used', value: healthData.database.storage_used }
            ]
        },
        {
            name: 'Network',
            icon: Wifi,
            data: healthData.network,
            metrics: [
                { label: 'Bandwidth', value: healthData.network.bandwidth },
                { label: 'Latency', value: healthData.network.latency }
            ]
        },
        {
            name: 'Storage',
            icon: HardDrive,
            data: healthData.storage,
            metrics: [
                { label: 'Disk Usage', value: healthData.storage.disk_usage },
                { label: 'Available', value: healthData.storage.available_space }
            ]
        }
    ];

    const overallStatus = () => {
        const statuses = Object.values(healthData).map(component => component.status);
        if (statuses.includes('critical')) return 'critical';
        if (statuses.includes('warning')) return 'warning';
        return 'healthy';
    };

    const { icon: OverallIcon, color: overallColor, bg: overallBg } = getStatusColor(overallStatus());

    return (
        <motion.div 
            className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 p-6", className)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className={cn("p-2 rounded-lg", overallBg)}>
                        <Monitor className={cn("w-5 h-5", overallColor)} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                        <p className="text-sm text-gray-500">
                            Last updated: {lastUpdated.toLocaleTimeString('id-ID')}
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={refreshHealth}
                    disabled={isRefreshing}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
                </button>
            </div>

            {/* Overall Status */}
            <div className={cn("p-4 rounded-lg mb-6 border-2", overallBg, getStatusColor(overallStatus()).border)}>
                <div className="flex items-center space-x-3">
                    <OverallIcon className={cn("w-6 h-6", overallColor)} />
                    <div>
                        <h4 className={cn("font-semibold", overallColor)}>
                            System Status: {overallStatus().charAt(0).toUpperCase() + overallStatus().slice(1)}
                        </h4>
                        <p className="text-sm text-gray-600">
                            {overallStatus() === 'healthy' && 'All systems operating normally'}
                            {overallStatus() === 'warning' && 'Some components need attention'}
                            {overallStatus() === 'critical' && 'Critical issues detected'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Cpu className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{healthData.performance.cpu_usage}</div>
                    <div className="text-xs text-gray-500">CPU Usage</div>
                </div>
                
                <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                        <MemoryStick className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{healthData.performance.memory_usage}</div>
                    <div className="text-xs text-gray-500">Memory</div>
                </div>
                
                <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{healthData.performance.load_average}</div>
                    <div className="text-xs text-gray-500">Load Avg</div>
                </div>
                
                <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Monitor className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{healthData.performance.active_users}</div>
                    <div className="text-xs text-gray-500">Active Users</div>
                </div>
            </div>

            {/* Component Status */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Component Status</h4>
                {systemComponents.map((component, index) => {
                    const ComponentIcon = component.icon;
                    const { icon: StatusIcon, color, bg, border } = getStatusColor(component.data.status);
                    
                    return (
                        <motion.div
                            key={component.name}
                            className={cn("p-3 rounded-lg border", bg, border)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <ComponentIcon className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <h5 className="font-medium text-gray-900 text-sm">{component.name}</h5>
                                        <div className="flex items-center space-x-4 mt-1">
                                            {component.metrics.map((metric, metricIndex) => (
                                                <span key={metricIndex} className="text-xs text-gray-600">
                                                    {metric.label}: <span className="font-semibold">{metric.value}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <StatusIcon className={cn("w-4 h-4", color)} />
                                    <span className={cn("text-xs font-medium capitalize", color)}>
                                        {component.data.status}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex space-x-3">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    View Details
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Export Report
                </button>
            </div>
        </motion.div>
    );
}
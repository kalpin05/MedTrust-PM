import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const SecurityDashboard = () => {
    const [stats, setStats] = useState({
        activeAlerts: 0,
        blockedIps: 0,
        systemHealth: 'Unknown'
    });
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trafficData, setTrafficData] = useState([]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, alertsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/security/stats'),
                axios.get('http://localhost:5000/api/security/alerts')
            ]);

            setStats(statsRes.data);
            setAlerts(alertsRes.data);

            // Simulate traffic data for the chart
            setTrafficData(prev => {
                const newData = [...prev, { time: new Date().toLocaleTimeString(), requests: Math.floor(Math.random() * 50) + (statsRes.data.activeAlerts > 0 ? 100 : 0) }];
                if (newData.length > 20) newData.shift();
                return newData;
            });

            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch security data", err);
            setLoading(false);
        }
    };

    const resolveAlert = async (id) => {
        try {
            await axios.post(`http://localhost:5000/api/security/alerts/${id}/resolve`);
            fetchData();
        } catch (err) {
            console.error("Failed to resolve alert", err);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Critical': return '#ff4d4f';
            case 'High': return '#faad14';
            case 'Medium': return '#1890ff';
            default: return '#52c41a';
        }
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#141414', minHeight: '100vh', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>🛡️ Cyber-Resilient Infrastructure Monitor</h1>
                <div style={{
                    padding: '10px 20px',
                    borderRadius: '5px',
                    backgroundColor: stats.systemHealth === 'Critical' ? '#ff4d4f' : stats.systemHealth === 'Warning' ? '#faad14' : '#52c41a',
                    fontWeight: 'bold'
                }}>
                    System Status: {stats.systemHealth}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                <div style={cardStyle}>
                    <h3>Active Threats</h3>
                    <div style={{ fontSize: '48px', color: stats.activeAlerts > 0 ? '#ff4d4f' : '#52c41a' }}>
                        {stats.activeAlerts}
                    </div>
                </div>
                <div style={cardStyle}>
                    <h3>Blocked IPs</h3>
                    <div style={{ fontSize: '48px', color: '#faad14' }}>
                        {stats.blockedIps}
                    </div>
                </div>
                <div style={cardStyle}>
                    <h3>Network Traffic (Req/s)</h3>
                    <div style={{ height: '100px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trafficData}>
                                <Line type="monotone" dataKey="requests" stroke="#1890ff" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <h2>Recent Security Alerts</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Time</th>
                            <th style={{ padding: '10px' }}>Severity</th>
                            <th style={{ padding: '10px' }}>Type</th>
                            <th style={{ padding: '10px' }}>Source IP</th>
                            <th style={{ padding: '10px' }}>Message</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map(alert => (
                            <tr key={alert.id} style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ padding: '10px' }}>{new Date(alert.created_at).toLocaleTimeString()}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        backgroundColor: getSeverityColor(alert.severity),
                                        color: '#000',
                                        fontSize: '12px'
                                    }}>
                                        {alert.severity}
                                    </span>
                                </td>
                                <td style={{ padding: '10px' }}>{alert.type}</td>
                                <td style={{ padding: '10px' }}>{alert.source_ip}</td>
                                <td style={{ padding: '10px' }}>{alert.message}</td>
                                <td style={{ padding: '10px', color: alert.status === 'Resolved' ? '#52c41a' : '#ff4d4f' }}>{alert.status}</td>
                                <td style={{ padding: '10px' }}>
                                    {alert.status === 'Active' && (
                                        <button
                                            onClick={() => resolveAlert(alert.id)}
                                            style={{ cursor: 'pointer', padding: '5px 10px', backgroundColor: '#1890ff', border: 'none', borderRadius: '4px', color: 'white' }}
                                        >
                                            Resolve
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const cardStyle = {
    backgroundColor: '#1f1f1f',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
};

export default SecurityDashboard;

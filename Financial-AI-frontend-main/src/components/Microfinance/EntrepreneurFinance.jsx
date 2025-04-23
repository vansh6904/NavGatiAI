// EntrepreneurFinance.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Button from './Button';
import { cn } from '../ui/utils';
import { toast } from 'sonner';

const EntrepreneurFinance = () => {
    const [applications, setApplications] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);
    const user = useSelector(state => state.auth.userData);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/application/all`, 
                    { withCredentials: true }
                );
                setApplications(response.data.data);
            } catch (error) {
                toast.error('Failed to fetch applications', {
                    style: { background: '#dc2626', color: 'white' }
                });
            }
        };
        fetchApplications();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        setUpdatingId(id);
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_BASE_URL}/application/${id}/status`,
                { status },
                { withCredentials: true }
            );

            setApplications(prevApps => prevApps.map(app => 
                app._id === id ? { ...app, ...response.data, status, processedBy: user } : app
            ));
            toast.success(`Application ${status} successfully`, {
                style: { background: '#059669', color: 'white' }
            });
        } catch (error) {
            toast.error('Update failed', {
                style: { background: '#dc2626', color: 'white' }
            });
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-8">
                    Funding Applications
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applications.map(app => (
                        <Card key={app._id} className="bg-gray-700/30 border border-gray-700/50 hover:border-teal-400/30 transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-100">{app.businessName}</h3>
                                        <p className="text-sm text-teal-300 mt-1">
                                            {app.applicant?.username || "Unknown"}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-1 rounded text-sm",
                                        app.status === 'accepted' && "bg-green-900/30 text-green-400",
                                        app.status === 'rejected' && "bg-red-900/30 text-red-400",
                                        app.status === 'pending' && "bg-yellow-900/30 text-yellow-400"
                                    )}>
                                        {app.status}
                                    </span>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="text-sm space-y-2 text-gray-300">
                                <p><strong>Type:</strong> {app.businessType}</p>
                                <p><strong>Stage:</strong> {app.businessStage}</p>
                                <p><strong>Purpose:</strong> {app.fundingPurpose}</p>
                            </CardContent>

                            {app.status === 'pending' && (
                                <CardFooter className="flex gap-2 p-4 border-t border-gray-700/50">
                                    <Button 
                                        onClick={() => handleStatusUpdate(app._id, 'accepted')}
                                        className="w-full bg-green-600/30 hover:bg-green-600/40 border border-green-500/30"
                                        disabled={updatingId === app._id}
                                    >
                                        {updatingId === app._id ? (
                                            <span className="animate-pulse">Processing...</span>
                                        ) : 'Accept'}
                                    </Button>
                                    <Button 
                                        onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                        className="w-full bg-red-600/30 hover:bg-red-600/40 border border-red-500/30"
                                        disabled={updatingId === app._id}
                                    >
                                        {updatingId === app._id ? (
                                            <span className="animate-pulse">Processing...</span>
                                        ) : 'Reject'}
                                    </Button>
                                </CardFooter>
                            )}

                            {app.status !== 'pending' && app.processedBy && (
                                <CardFooter className="p-4 border-t border-gray-700/50 text-sm text-teal-400">
                                    Processed by: {app.processedBy.username}
                                </CardFooter>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EntrepreneurFinance;
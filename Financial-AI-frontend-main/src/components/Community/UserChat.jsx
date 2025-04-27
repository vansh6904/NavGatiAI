// UserChat.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import CommunityChat from "./CommunityChat";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { toast } from "sonner";

const UserChat = () => {
    const [communities, setCommunities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [joinedCommunities, setJoinedCommunities] = useState([]);
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/communities`);
                setCommunities(response.data.data);
            } catch (error) {
                toast.error("Failed to fetch communities", { 
                    style: { background: "#dc2626", color: "white" } 
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchCommunities();
    }, []);

    const handleJoinCommunity = async (communityId) => {
        try {
            await axios.post(`
                ${import.meta.env.VITE_BASE_URL}/communities/${communityId}/join`,
                {},
                { withCredentials: true }
            );
            setJoinedCommunities((prev) => [...prev, communityId]);
            toast.success("Community joined successfully", {
                style: { background: "#059669", color: "white" }
            });
        } catch (error) {
            toast.error("Failed to join community", {
                style: { background: "#dc2626", color: "white" }
            });
        }
    };

    const hasUserJoinedCommunity = (community) => {
        return (
            joinedCommunities.includes(community._id) ||
            community.members.some(member => member.username === userData.username)
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-8">
                    Community Hub
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communities.map((community) => (
                        <Card 
                            key={community._id}
                            className={cn(
                                "bg-gray-700/30 border border-gray-700/50 hover:border-teal-400/30 transition-all",
                                hasUserJoinedCommunity(community) && "cursor-pointer"
                            )}
                            onClick={() => hasUserJoinedCommunity(community) && setSelectedCommunity(community._id)}
                        >
                            <CardHeader>
                                <CardTitle className="text-gray-100">{community.name}</CardTitle>
                                <p className="text-sm text-teal-300">{community.description}</p>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <p className="text-gray-400">
                                    Created by: {community.createdBy?.username || "Unknown"}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-teal-400 text-sm">
                                        {community.members.length} members
                                    </span>
                                    {!hasUserJoinedCommunity(community) && (
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleJoinCommunity(community._id);
                                            }}
                                            className="bg-teal-600/30 hover:bg-teal-600/40 border border-teal-500/30"
                                        >
                                            Join Community
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {selectedCommunity && (
                    <CommunityChat
                        communityId={selectedCommunity}
                        onClose={() => setSelectedCommunity(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default UserChat;
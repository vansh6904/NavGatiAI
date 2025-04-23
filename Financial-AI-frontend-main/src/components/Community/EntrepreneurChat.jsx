// EntrepreneurChat.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import CommunityChat from "./CommunityChat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../Microfinance/label";
import { Button } from "../ui/button";
import { toast } from "sonner";

function EntrepreneurChat() {
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const userData = useSelector((state) => state.auth.userData);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/communities/create`,
                data,
                { withCredentials: true }
            );
            setCommunities((prev) => [...prev, response.data]);
            toast.success("Community created successfully", {
                style: { background: "#059669", color: "white" }
            });
            reset();
        } catch (error) {
            toast.error("Failed to create community", {
                style: { background: "#dc2626", color: "white" }
            });
        }
    };

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/communities`);
                const filteredCommunities = response.data.data.filter(
                    (community) => community.createdBy.username === userData.username
                );
                setCommunities(filteredCommunities);
            } catch (error) {
                toast.error("Failed to fetch communities", {
                    style: { background: "#dc2626", color: "white" }
                });
            }
        };
        fetchCommunities();
    }, [userData.username]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        Your Communities
                    </h1>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-teal-600 hover:bg-teal-500">
                                Create Community
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700 [&>button]:text-white [&>button:hover]:text-gray-200 [&>button:hover]:bg-gray-700">
                            <DialogHeader>
                                <DialogTitle className="text-gray-100">Create New Community</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-teal-300">Community Name</Label>
                                    <Input
                                        {...register("name", { required: "Name is required" })}
                                        className="bg-gray-700 border-gray-600 text-gray-100"
                                    />
                                    {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-teal-300">Description</Label>
                                    <Input
                                        {...register("description", { required: "Description is required" })}
                                        className="bg-gray-700 border-gray-600 text-gray-100"
                                    />
                                    {errors.description && <p className="text-red-400 text-sm">{errors.description.message}</p>}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="submit" className="bg-teal-600 hover:bg-teal-500">
                                        Create
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communities.map((community) => (
                        <div key={community._id} className="space-y-4">
                            <Card
                                className="bg-gray-700/30 border border-gray-700/50 hover:border-teal-400/30 cursor-pointer"
                                onClick={() => setSelectedCommunity(community._id)}
                            >
                                <CardHeader>
                                    <CardTitle className="text-gray-100">{community.name}</CardTitle>
                                    <p className="text-sm text-teal-300">{community.description}</p>
                                </CardHeader>
                                <CardContent className="text-sm text-gray-400">
                                    {community.members?.length || 0} members
                                </CardContent>
                            </Card>
                        </div>
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
}

export default EntrepreneurChat;
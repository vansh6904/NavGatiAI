// CommunityChat.jsx
import { useEffect, useState, useContext,useRef } from "react";
import { SocketContext } from "../../SocketContext";
import axios from "axios";
import { useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";
import { toast } from "sonner";

const CommunityChat = ({ communityId, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const socket = useContext(SocketContext);
    const userData = useSelector((state) => state.auth.userData);

    const messagesEndRef = useRef(null);
    
    useEffect(() => {
        // Auto-scroll when messages change
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      }, [messages]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/messages/${communityId}/messages`,
                    { withCredentials: true }
                );
                setMessages(response.data.data);
            } catch (err) {
                toast.error("Failed to load messages", {
                    style: { background: "#dc2626", color: "white" }
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchMessages();
    }, [communityId]);

    useEffect(() => {
        if (socket) {
            socket.emit("joinCommunity", communityId);
            socket.on("receiveMessage", (message) => {
                setMessages((prev) => [...prev, message]);
            });
            return () => socket.off("receiveMessage");
        }
    }, [socket, communityId]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const message = {
            community: communityId,
            sender: { username: userData?.username },
            content: newMessage,
            createdAt: new Date().toISOString()
        };

        socket.emit("sendMessage", message);

        try {
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/messages/${communityId}/send`,
                { content: newMessage },
                { withCredentials: true }
            );
            setNewMessage("");
        } catch (err) {
            toast.error("Failed to send message", {
                style: { background: "#dc2626", color: "white" }
            });
        }
    };

    return (
        <Dialog open={!!communityId} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl h-[80vh] flex flex-col [&>button]:hidden">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-100">Community Chat</h2>
                        <Button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 hover:bg-gray-700"
                            variant="ghost"
                        >
                            ✕
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 p-4 custom-scrollbar">
                    {messages.map((msg, index) => (
                        // In the message bubble component
                        <div 
                            key={index}
                            className={cn(
                                "flex",
                                msg.sender?.username === userData?.username ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "max-w-[75%] rounded-xl p-3 flex flex-col",
                                msg.sender?.username === userData?.username 
                                    ? "bg-teal-600/30 border border-teal-500/30 ml-8" 
                                    : "bg-gray-700/30 border border-gray-600/30 mr-8"
                            )}>
                                <p className={cn(
                                    "text-sm font-medium",
                                    msg.sender?.username === userData?.username 
                                        ? "text-teal-300" 
                                        : "text-cyan-300"
                                )}>
                                    {msg.sender?.username || "Anonymous"}
                                </p>
                                <p className="text-gray-100 mt-1">{msg.content}</p>
                                <div className="text-xs text-gray-400 mt-2 text-right">
                                    {msg.createdAt ? (
                                        new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                    ) : (
                                        'Just now'
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                     <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2 p-4 border-t border-gray-700">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        className="bg-gray-700 border-gray-600 text-gray-100 flex-1"
                        placeholder="Type your message..."
                    />
                    <Button
                        onClick={sendMessage}
                        className="bg-teal-600 hover:bg-teal-500"
                    >
                        Send
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CommunityChat;
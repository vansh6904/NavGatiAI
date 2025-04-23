import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const url = import.meta.env.VITE_BASE_URL;
        const baseURL = url.split("/api")[0];

        const newSocket = io(baseURL); // Replace with your backend URL
        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
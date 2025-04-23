import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomePage, Dashboard, ChatBot, CommonFinance,Protected,Register,Login,NewsLetter, Community } from './components/index.js';
import { Provider } from "react-redux";
import store from './Store/store.js';
import { SocketProvider } from "./SocketContext.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: "/register",
        element: <Protected authentication={false}> <Register /></Protected>,
      },
      {
        path: "/login",
        element: <Protected authentication={false}> <Login /> </Protected>,
      },
      {
        path: '/',
        element: <Protected authentication={false} > <HomePage /> </Protected>,
      },
      {
        path: '/dashboard',
        element: <Protected authentication> <Dashboard /> </Protected>,
      },
      {
        path: '/chatbot',
        element: <Protected authentication> <ChatBot /> </Protected>,
      },
      {
        path: '/microfinance',
        element: <Protected authentication> <CommonFinance /> </Protected>,
      },
      {
        path: '/newsletter',
        element: <Protected authentication> <NewsLetter /> </Protected>,
      },
      {
        path: '/community',
        element: <Protected authentication> <Community /> </Protected>,
      },
    ]
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SocketProvider>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
    </SocketProvider>
  </StrictMode>,
)

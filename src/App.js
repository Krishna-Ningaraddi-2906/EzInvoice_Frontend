import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Invoice from './components/invoice/Invoice';
import CreateInvoice from './components/invoice/CreateInvoice';
import InvoiceHistory from './components/invoice/InvoiceHistory';
import InvoiceDetail from './components/invoice/InvoiceDetail';
import { isAuthenticated } from './utils/auth';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : React.createElement(Navigate, { to: '/login', replace: true });
};

const App = () => {
    return React.createElement(Router, null,
        React.createElement(Routes, null,
            // Default route - redirect to login
            React.createElement(Route, {
                path: '/',
                element: React.createElement(Navigate, { to: '/login', replace: true })
            }),
            
            // Login route
            React.createElement(Route, {
                path: '/login',
                element: React.createElement(Login)
            }),
            
            // Signup route
            React.createElement(Route, {
                path: '/signup',
                element: React.createElement(Signup)
            }),
            
            // Protected Invoice routes
            React.createElement(Route, {
                path: '/invoice',
                element: React.createElement(ProtectedRoute, null,
                    React.createElement(CreateInvoice)
                )
            }),
            
            // Invoice History route
            React.createElement(Route, {
                path: '/invoice/history',
                element: React.createElement(ProtectedRoute, null,
                    React.createElement(InvoiceHistory)
                )
            }),
            
            // Invoice Detail route
            React.createElement(Route, {
                path: '/invoice/detail/:invoiceId',
                element: React.createElement(ProtectedRoute, null,
                    React.createElement(InvoiceDetail)
                )
            }),
            
            React.createElement(Route, {
                path: '/dashboard',
                element: React.createElement(ProtectedRoute, null,
                    React.createElement(Invoice)
                )
            }),
            
            // Catch all route - redirect to login
            React.createElement(Route, {
                path: '*',
                element: React.createElement(Navigate, { to: '/login', replace: true })
            })
        )
    );
};

export default App;
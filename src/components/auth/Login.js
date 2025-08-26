import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { setToken, setUserData } from '../../utils/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setMessage('Please fill in all fields');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const result = await loginUser(email, password);
            
            if (result.success && result.data) {
                const { message: responseMessage, token, userName, email: userEmail } = result.data;
                
                if (responseMessage === 'Success' && token) {
                    // Store token and user data
                    setToken(token);
                    setUserData({
                        userName,
                        email: userEmail
                    });
                    
                    setMessage('Login Successful! Redirecting...');
                    setMessageType('success');
                    
                    // Redirect to invoice page after 1 second
                    setTimeout(() => {
                        navigate('/invoice');
                    }, 1000);
                } else {
                    setMessage(responseMessage || 'Login failed');
                    setMessageType('error');
                }
            } else {
                setMessage(result.message || 'Login failed');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
            setMessageType('error');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignupRedirect = () => {
        navigate('/signup');
    };

    return React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'title' }, 
            React.createElement('div', { 
                style: { 
                    display: 'inline-block', 
                    backgroundColor: '#8b5cf6', 
                    color: 'white', 
                    padding: '10px', 
                    borderRadius: '50%', 
                    marginBottom: '10px',
                    fontSize: '24px'
                } 
            }, '📄'),
            React.createElement('div', null, 'Invoice Generator')
        ),
        React.createElement('p', { 
            style: { 
                textAlign: 'center', 
                color: '#666', 
                marginBottom: '30px' 
            } 
        }, 'Sign in to your account'),
        
        // Message display
        message && React.createElement('div', {
            className: `message ${messageType}`
        }, message),
        
        // Login form
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'email' }, 'Username'),
                React.createElement('input', {
                    type: 'email',
                    id: 'email',
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    placeholder: 'Enter your email',
                    disabled: loading
                })
            ),
            
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'password' }, 'Password'),
                React.createElement('input', {
                    type: 'password',
                    id: 'password',
                    value: password,
                    onChange: (e) => setPassword(e.target.value),
                    placeholder: 'Enter your password',
                    disabled: loading
                })
            ),
            
            React.createElement('button', {
                type: 'submit',
                className: 'btn',
                disabled: loading
            }, loading ? React.createElement('span', { className: 'loading' }) : 'Sign In')
        ),
        
        // Sign up link
        React.createElement('p', { 
            className: 'text-center',
            style: { marginTop: '20px' }
        },
            "Don't have an account? ",
            React.createElement('a', {
                href: '#',
                className: 'link',
                onClick: (e) => {
                    e.preventDefault();
                    handleSignupRedirect();
                }
            }, 'Sign up')
        )
    );
};

export default Login;
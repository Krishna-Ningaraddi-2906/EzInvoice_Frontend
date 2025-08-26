import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../../services/api';

const Signup = () => {
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        email: '',
        contactNo: '',
        companyName: ''
    });
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    
    const navigate = useNavigate();

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setLogo(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        const { userName, password, email, contactNo, companyName } = formData;
        if (!userName || !password || !email || !contactNo || !companyName) {
            setMessage('Please fill in all required fields');
            setMessageType('error');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage('Please enter a valid email address');
            setMessageType('error');
            return;
        }

        // Validate contact number
        if (!/^\d{10}$/.test(contactNo)) {
            setMessage('Please enter a valid 10-digit contact number');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const result = await signupUser(formData, logo);
            
            if (result.success) {
                setMessage('SignUp Successful! Redirecting to login...');
                setMessageType('success');
                
                // Clear form
                setFormData({
                    userName: '',
                    password: '',
                    email: '',
                    contactNo: '',
                    companyName: ''
                });
                setLogo(null);
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage(result.message || 'Signup failed. Please try again.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
            setMessageType('error');
            console.error('Signup error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
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
        }, 'Create your account'),
        
        // Message display
        message && React.createElement('div', {
            className: `message ${messageType}`
        }, message),
        
        // Signup form
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'userName' }, 'Username *'),
                React.createElement('input', {
                    type: 'text',
                    id: 'userName',
                    value: formData.userName,
                    onChange: (e) => handleInputChange('userName', e.target.value),
                    placeholder: 'Enter username',
                    disabled: loading
                })
            ),
            
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'email' }, 'Email *'),
                React.createElement('input', {
                    type: 'email',
                    id: 'email',
                    value: formData.email,
                    onChange: (e) => handleInputChange('email', e.target.value),
                    placeholder: 'Enter email address',
                    disabled: loading
                })
            ),
            
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'password' }, 'Password *'),
                React.createElement('input', {
                    type: 'password',
                    id: 'password',
                    value: formData.password,
                    onChange: (e) => handleInputChange('password', e.target.value),
                    placeholder: 'Enter password',
                    disabled: loading
                })
            ),
            
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'contactNo' }, 'Contact Number *'),
                React.createElement('input', {
                    type: 'tel',
                    id: 'contactNo',
                    value: formData.contactNo,
                    onChange: (e) => handleInputChange('contactNo', e.target.value),
                    placeholder: 'Enter 10-digit contact number',
                    disabled: loading
                })
            ),
            
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'companyName' }, 'Company Name *'),
                React.createElement('input', {
                    type: 'text',
                    id: 'companyName',
                    value: formData.companyName,
                    onChange: (e) => handleInputChange('companyName', e.target.value),
                    placeholder: 'Enter company name',
                    disabled: loading
                })
            ),
            
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { htmlFor: 'logo' }, 'Company Logo (Optional)'),
                React.createElement('input', {
                    type: 'file',
                    id: 'logo',
                    accept: 'image/*',
                    onChange: handleFileChange,
                    disabled: loading
                })
            ),
            
            React.createElement('button', {
                type: 'submit',
                className: 'btn',
                disabled: loading
            }, loading ? React.createElement('span', { className: 'loading' }) : 'Sign Up')
        ),
        
        // Login link
        React.createElement('p', { 
            className: 'text-center',
            style: { marginTop: '20px' }
        },
            "Already have an account? ",
            React.createElement('a', {
                href: '#',
                className: 'link',
                onClick: (e) => {
                    e.preventDefault();
                    handleLoginRedirect();
                }
            }, 'Sign in')
        )
    );
};

export default Signup;
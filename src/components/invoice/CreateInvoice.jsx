import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../../services/api';
import { logout, getUserData } from '../../utils/auth';
import styles from './CreateInvoice.module.css';

const CreateInvoice = () => {
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [products, setProducts] = useState([
        { productName: '', price: '', quantity: 1, total: 0 }
    ]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    
    const navigate = useNavigate();
    const userData = getUserData();

    // Calculate total for a product
    const calculateProductTotal = (price, quantity) => {
        const numPrice = parseFloat(price) || 0;
        const numQuantity = parseInt(quantity) || 0;
        return numPrice * numQuantity;
    };

    // Calculate overall total
    const calculateOverallTotal = () => {
        return products.reduce((sum, product) => {
            return sum + calculateProductTotal(product.price, product.quantity);
        }, 0);
    };

    // Handle product changes
    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...products];
        updatedProducts[index][field] = value;
        
        // Recalculate total for this product
        if (field === 'price' || field === 'quantity') {
            updatedProducts[index].total = calculateProductTotal(
                updatedProducts[index].price,
                updatedProducts[index].quantity
            );
        }
        
        setProducts(updatedProducts);
    };

    // Add new product row
    const addProduct = () => {
        setProducts([...products, { productName: '', price: '', quantity: 1, total: 0 }]);
    };

    // Remove product row
    const removeProduct = (index) => {
        if (products.length > 1) {
            const updatedProducts = products.filter((_, i) => i !== index);
            setProducts(updatedProducts);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!customerName.trim() || !customerEmail.trim()) {
            setMessage('Please fill in customer name and email');
            setMessageType('error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            setMessage('Please enter a valid email address');
            setMessageType('error');
            return;
        }

        const validProducts = products.filter(
            p => p.productName.trim() && p.price && p.quantity
        );
        if (validProducts.length === 0) {
            setMessage('Please add at least one product');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const result = await createInvoice(customerName, customerEmail, validProducts);

            if (result.success) {
                setMessage('Invoice created successfully!');
                setMessageType('success');

                setTimeout(() => {
                    setCustomerName('');
                    setCustomerEmail('');
                    setProducts([{ productName: '', price: '', quantity: 1, total: 0 }]);
                    setMessage('');
                }, 2000);
            } else {
                setMessage(result.message || 'Failed to create invoice');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('An error occurred while creating invoice');
            setMessageType('error');
            console.error('Create invoice error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleViewHistory = () => {
        navigate('/invoice/history');
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <div className={styles.brandContainer}>
                            <div className={styles.brandIcon}>📄</div>
                            <span className={styles.brandTitle}>Invoice Generator</span>
                        </div>
                        <button
                            onClick={() => navigate('/invoice')}
                            className={`${styles.navButton} ${styles.navButtonActive}`}
                        >
                            Create Invoice
                        </button>
                        <button
                            onClick={handleViewHistory}
                            className={`${styles.navButton} ${styles.navButtonInactive}`}
                        >
                            🕒 History
                        </button>
                    </div>
                    <div className={styles.headerRight}>
                        <span className={styles.welcomeText}>
                            Welcome, {userData?.userName || 'User'}
                        </span>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            ↗ Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Left Panel - Form */}
                <div className={styles.leftPanel}>
                    {/* Message display */}
                    {message && (
                        <div className={`${styles.message} ${styles[`message${messageType.charAt(0).toUpperCase() + messageType.slice(1)}`]}`}>
                            {message}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Customer Name */}
                        <div className={styles.formGroup}>
                            <label htmlFor="customerName" className={styles.formLabel}>
                                👤 Customer Name
                            </label>
                            <input
                                type="text"
                                id="customerName"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter customer name"
                                disabled={loading}
                                className={styles.formInput}
                            />
                        </div>

                        {/* Customer Email */}
                        <div className={styles.formGroup}>
                            <label htmlFor="customerEmail" className={styles.formLabel}>
                                ✉️ Customer Email
                            </label>
                            <input
                                type="email"
                                id="customerEmail"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                placeholder="Enter customer email"
                                disabled={loading}
                                className={styles.formInput}
                            />
                        </div>

                        {/* Products Section */}
                        <div className={styles.formGroup}>
                            <div className={styles.productsHeader}>
                                <label className={styles.formLabel}>⚙️ Products</label>
                                <button
                                    type="button"
                                    onClick={addProduct}
                                    className={styles.addProductButton}
                                >
                                    + Add Product
                                </button>
                            </div>

                            {/* Products List */}
                            {products.map((product, index) => (
                                <div key={index} className={styles.productRow}>
                                    <input
                                        type="text"
                                        placeholder="Product name"
                                        value={product.productName}
                                        onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                                        disabled={loading}
                                        className={styles.productInput}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={product.price}
                                        onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                        disabled={loading}
                                        min="0"
                                        step="0.01"
                                        className={styles.productInput}
                                    />
                                    <input
                                        type="number"
                                        value={product.quantity}
                                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                        disabled={loading}
                                        min="1"
                                        className={styles.productInput}
                                    />
                                    <div className={styles.productTotal}>
                                        ${calculateProductTotal(product.price, product.quantity).toFixed(2)}
                                    </div>
                                    {products.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProduct(index)}
                                            className={styles.removeButton}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Total */}
                            <div className={styles.totalSection}>
                                💰 Total: ${calculateOverallTotal().toFixed(2)}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className={styles.actionButtons}>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`${styles.submitButton} ${styles.saveButton}`}
                            >
                                {loading ? '💾 Saving...' : '💾 Save Invoice'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`${styles.submitButton} ${styles.saveAndSendButton}`}
                            >
                                {loading ? '📧 Sending...' : '📧 Save & Send Invoice'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Panel - Live Preview */}
                <div className={styles.rightPanel}>
                    <h3 className={styles.previewTitle}>Live Preview</h3>
                    
                    {customerName || customerEmail || products.some(p => p.productName) ? (
                        <div className={styles.previewContent}>
                            <div className={styles.invoiceHeader}>
                                <h2 className={styles.invoiceTitle}>INVOICE</h2>
                            </div>
                            {customerName && (
                                <p className={styles.customerInfo}>
                                    <strong>Customer: </strong>{customerName}
                                </p>
                            )}
                            {customerEmail && (
                                <p className={styles.customerInfo}>
                                    <strong>Email: </strong>{customerEmail}
                                </p>
                            )}
                            {products.filter(p => p.productName).length > 0 && (
                                <div className={styles.productsSection}>
                                    <h4 className={styles.productsTitle}>Products:</h4>
                                    {products.filter(p => p.productName).map((product, index) => (
                                        <div key={index} className={styles.productItem}>
                                            <span className={styles.productName}>
                                                {product.productName} ({product.quantity}x)
                                            </span>
                                            <span className={styles.productPrice}>
                                                ${calculateProductTotal(product.price, product.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className={styles.invoiceTotal}>
                                        <span>TOTAL:</span>
                                        <span>${calculateOverallTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.emptyPreview}>
                            <div className={styles.emptyPreviewIcon}>📄</div>
                            <p className={styles.emptyPreviewText}>
                                Invoice preview will appear here as you fill the form
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateInvoice;
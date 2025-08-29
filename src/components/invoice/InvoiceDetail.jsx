import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getInvoicesByCustomer, deleteInvoice, updateInvoice } from '../../services/api';
import { logout, getUserData } from '../../utils/auth';
import EditInvoiceModal from './EditInvoiceModal'; // Add this import
import styles from './InvoiceDetail.module.css';

const InvoiceDetail = () => {
    const [invoice, setInvoice] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editModalOpen, setEditModalOpen] = useState(false); // Add modal state
    const navigate = useNavigate();
    const { invoiceId } = useParams();
    const location = useLocation();
    const userData = getUserData();

useEffect(() => {
    const fetchInvoiceDetails = async () => {
        try {
            console.log('=== INVOICE DETAIL DEBUG START ===');
            console.log('Location state:', location.state);
            const invoiceFromState = location.state?.invoice;
            
            if (invoiceFromState) {
                console.log('Invoice from state:', invoiceFromState);
                console.log('Products in state invoice:', invoiceFromState.products);
                setInvoice(invoiceFromState);
                
                // Set products if they exist in the invoice data from state
                if (invoiceFromState.products && Array.isArray(invoiceFromState.products)) {
                    console.log('Setting products from state:', invoiceFromState.products);
                    setProducts(invoiceFromState.products);
                } else {
                    console.log('No products in state or not an array');
                }
                
                // Fetch fresh data from API to get updated product information
                try {
                    console.log('Fetching from API...');
                    const result = await getInvoicesByCustomer(invoiceFromState.customerEmail);
                    console.log('Full API response:', result);
                    
                    if (result.success && result.data) {
                        console.log('API data array:', result.data);
                        const specificInvoice = result.data.find(inv => inv.id === invoiceId);
                        console.log('Found specific invoice:', specificInvoice);
                        
                        if (specificInvoice) {
                            console.log('Products in specific invoice:', specificInvoice.products);
                            setInvoice(specificInvoice);
                            // Update products from the fresh API response
                            if (specificInvoice.products && Array.isArray(specificInvoice.products)) {
                                console.log('Setting products from API:', specificInvoice.products);
                                setProducts(specificInvoice.products);
                            } else {
                                console.log('No products in API response or not an array');
                            }
                        }
                    } else {
                        console.log('API call unsuccessful or no data');
                    }
                } catch (apiError) {
                    console.error('API call failed:', apiError);
                }
            } else {
                setError('Invoice data not found. Please navigate from the invoice history page.');
            }
            setLoading(false);
            console.log('=== INVOICE DETAIL DEBUG END ===');
        } catch (error) {
            console.error('Error fetching invoice details:', error);
            setError('Failed to fetch invoice details');
            setLoading(false);
        }
    };

    fetchInvoiceDetails();
}, [invoiceId, location.state]);

    const handleDeleteInvoice = async () => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                const result = await deleteInvoice(invoice.id);
                if (result.success) {
                    alert('Invoice deleted successfully!');
                    navigate('/invoice/history');
                } else {
                    alert(result.message || 'Failed to delete invoice');
                }
            } catch (error) {
                console.error('Error deleting invoice:', error);
                alert('An error occurred while deleting invoice');
            }
        }
    };

    // Updated edit handler to open modal instead of using prompts
    const handleEditInvoice = () => {
        setEditModalOpen(true);
    };

    // Modal save handler
    const handleModalSave = async (invoiceId, customerName, customerEmail, updatedProducts) => {
        try {
            const result = await updateInvoice(invoiceId, customerName, customerEmail, updatedProducts);
            
            if (result.success) {
                alert('Invoice updated successfully!');
                setEditModalOpen(false);
                // Update local state with new data
                setInvoice({ 
                    ...invoice, 
                    customerName: customerName, 
                    customerEmail: customerEmail 
                });
                setProducts(updatedProducts);
            } else {
                alert(result.message || 'Failed to update invoice');
            }
        } catch (error) {
            console.error('Error updating invoice:', error);
            alert('An error occurred while updating invoice');
        }
    };

    // Modal close handler
    const handleModalClose = () => {
        setEditModalOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
        let date;
        
        // Handle different date formats from backend
        if (Array.isArray(dateValue)) {
            // Handle array format [year, month, day, hour, minute, second, nanoseconds?]
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
            date = new Date(year, month - 1, day, hour, minute, second);
        } else if (typeof dateValue === 'string') {
            // Handle ISO string format
            date = new Date(dateValue);
        } else if (typeof dateValue === 'number') {
            // Handle timestamp
            date = new Date(dateValue);
        } else {
            return 'N/A';
        }
        
        if (isNaN(date.getTime())) return 'N/A';
        
        // Use toLocaleString instead of toLocaleDateString to include time
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true  // Use 12-hour format with AM/PM
        });
    } catch (error) {
        console.error('Date formatting error:', error, 'Input:', dateValue);
        return 'N/A';
    }
};

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    Loading invoice details...
                </div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <h3>Error</h3>
                    <p>{error || 'Invoice not found'}</p>
                    <button onClick={() => navigate('/invoice/history')} className={styles.backButton}>
                        Back to History
                    </button>
                </div>
            </div>
        );
    }

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
                            className={styles.navButton}
                        >
                            Create Invoice
                        </button>
                        <button
                            onClick={() => navigate('/invoice/history')}
                            className={styles.navButton}
                        >
                            History
                        </button>
                        <button
                            onClick={() => navigate('/invoice/history')}
                            className={styles.backButton}
                        >
                            ← Back
                        </button>
                    </div>
                    <div className={styles.headerRight}>
                        <span className={styles.welcomeText}>
                            Welcome, {userData?.userName || 'User'}
                        </span>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                <h1 className={styles.pageTitle}>Invoice Details</h1>

                <div className={styles.invoiceContainer}>
                    {/* Invoice Header */}
                    <div className={styles.invoiceHeader}>
                        <h2 className={styles.invoiceTitle}>INVOICE</h2>
                        <p className={styles.invoiceId}>#{invoice.id.substring(0, 8)}...</p>
                    </div>

                    {/* Invoice Body */}
                    <div className={styles.invoiceBody}>
                        {/* Info Grid */}
                        <div className={styles.infoGrid}>
                            {/* Customer Information */}
                            <div className={styles.infoSection}>
                                <h3 className={styles.sectionTitle}>Customer Information</h3>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Name:</span>
                                    <span className={styles.infoValue}>{invoice.customerName || 'N/A'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Email:</span>
                                    <span className={styles.infoValue}>{invoice.customerEmail || 'N/A'}</span>
                                </div>
                                {invoice.companyOrIndividual && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Type:</span>
                                        <span className={`${styles.companyType} ${
                                            invoice.companyOrIndividual.toLowerCase() === 'company' 
                                                ? styles.company 
                                                : styles.individual
                                        }`}>
                                            {invoice.companyOrIndividual}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Invoice Information */}
                            <div className={styles.infoSection}>
                                <h3 className={styles.sectionTitle}>Invoice Information</h3>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Created:</span>
                                    <span className={styles.infoValue}>{formatDate(invoice.createdAt)}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Updated:</span>
                                    <span className={styles.infoValue}>{formatDate(invoice.updatedAt)}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Total Amount:</span>
                                    <span className={styles.infoValue}>
                                        ${invoice.totalAmount ? invoice.totalAmount.toFixed(2) : '0.00'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className={styles.productsSection}>
                            <h3 className={styles.productsTitle}>Products & Services</h3>
                            
                            {products.length > 0 ? (
                                <table className={styles.productsTable}>
                                    <thead className={styles.tableHeader}>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product, index) => {
                                            const price = parseFloat(product.price) || 0;
                                            const quantity = parseInt(product.quantity) || 0;
                                            const total = price * quantity;
                                            
                                            return (
                                                <tr key={index} className={styles.tableRow}>
                                                    <td className={styles.tableCell}>{product.productName}</td>
                                                    <td className={styles.tableCell}>${price.toFixed(2)}</td>
                                                    <td className={styles.tableCell}>{quantity}</td>
                                                    <td className={styles.tableCell}>${total.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                        <tr className={`${styles.tableRow} ${styles.totalRow}`}>
                                            <td className={styles.tableCell} colSpan="3">TOTAL</td>
                                            <td className={styles.tableCell}>
                                                ${products.reduce((sum, product) => {
                                                    const price = parseFloat(product.price) || 0;
                                                    const quantity = parseInt(product.quantity) || 0;
                                                    return sum + (price * quantity);
                                                }, 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                <div className={styles.noProducts}>
                                    No products found for this invoice.
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className={styles.actionButtons}>
                            <button
                                onClick={handleEditInvoice}
                                className={`${styles.actionButton} ${styles.editButton}`}
                            >
                                Edit Invoice
                            </button>
                            <button
                                onClick={handleDeleteInvoice}
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                            >
                                Delete Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditInvoiceModal
                isOpen={editModalOpen}
                onClose={handleModalClose}
                invoice={{ ...invoice, products }}
                onSave={handleModalSave}
            />
        </div>
    );
};

export default InvoiceDetail;
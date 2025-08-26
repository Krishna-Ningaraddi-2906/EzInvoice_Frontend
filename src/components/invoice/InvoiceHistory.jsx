import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllInvoices, deleteInvoice, updateInvoice } from '../../services/api';
import { logout, getUserData } from '../../utils/auth';
import styles from './InvoiceHistory.module.css';

const InvoiceHistory = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const userData = getUserData();

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        setError('');
        
        try {
            const result = await getAllInvoices();
            if (result.success) {
                setInvoices(result.data || []);
            } else {
                setError(result.message || 'Failed to fetch invoices');
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setError('An error occurred while fetching invoices');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleCardClick = (invoice) => {
        console.log('Card clicked, invoice:', invoice);
        console.log('Navigating to:', `/invoice/detail/${invoice.id}`);
        navigate(`/invoice/detail/${invoice.id}`, { state: { invoice } });
    };

    const handleDeleteInvoice = async (e, invoiceId) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                const result = await deleteInvoice(invoiceId);
                if (result.success) {
                    setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
                    alert('Invoice deleted successfully!');
                } else {
                    alert(result.message || 'Failed to delete invoice');
                }
            } catch (error) {
                console.error('Error deleting invoice:', error);
                alert('An error occurred while deleting invoice');
            }
        }
    };

    const handleEditInvoice = async (e, invoice) => {
        e.stopPropagation(); // Prevent card click
        const newCustomerName = prompt('Enter new customer name:', invoice.customerName);
        const newCustomerEmail = prompt('Enter new customer email:', invoice.customerEmail);
        
        if (newCustomerName && newCustomerEmail) {
            try {
                const result = await updateInvoice(
                    invoice.id,
                    newCustomerName,
                    newCustomerEmail,
                    []
                );
                
                if (result.success) {
                    alert('Invoice updated successfully!');
                    fetchInvoices();
                } else {
                    alert(result.message || 'Failed to update invoice');
                }
            } catch (error) {
                console.error('Error updating invoice:', error);
                alert('An error occurred while updating invoice');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray)) return 'N/A';
        try {
            const [year, month, day, hour, minute, second] = dateArray;
            const date = new Date(year, month - 1, day, hour, minute, second);
            
            if (isNaN(date.getTime())) return 'N/A';
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'N/A';
        }
    };

    const calculateStats = () => {
        const totalInvoices = invoices.length;
        const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
        return { totalInvoices, totalAmount };
    };

    const { totalInvoices, totalAmount } = calculateStats();

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
                            className={`${styles.navButton} ${styles.navButtonInactive}`}
                        >
                            Create Invoice
                        </button>
                        <button
                            onClick={() => navigate('/invoice/history')}
                            className={`${styles.navButton} ${styles.navButtonActive}`}
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
                <h1 className={styles.pageTitle}>Invoice History</h1>

                {/* Stats Cards */}
                {!loading && !error && invoices.length > 0 && (
                    <div className={styles.statsContainer}>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>{totalInvoices}</div>
                            <div className={styles.statLabel}>Total Invoices</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>${totalAmount.toFixed(2)}</div>
                            <div className={styles.statLabel}>Total Amount</div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className={styles.loadingContainer}>
                        <div>📊 Loading invoices...</div>
                    </div>
                )}

                {error && (
                    <div className={styles.errorContainer}>
                        <h3>⚠️ Error</h3>
                        <p>{error}</p>
                        <button onClick={fetchInvoices} className={styles.createButton}>
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && invoices.length === 0 && (
                    <div className={styles.emptyContainer}>
                        <div className={styles.emptyIcon}>📄</div>
                        <h2 className={styles.emptyTitle}>No Invoices Found</h2>
                        <p className={styles.emptyDescription}>
                            You haven't created any invoices yet. Start by creating your first invoice!
                        </p>
                        <button 
                            onClick={() => navigate('/invoice')}
                            className={styles.createButton}
                        >
                            Create Your First Invoice
                        </button>
                    </div>
                )}

                {!loading && !error && invoices.length > 0 && (
                    <div className={styles.invoiceGrid}>
                        {invoices.map((invoice) => (
                            <div 
                                key={invoice.id} 
                                className={styles.invoiceCard}
                                onClick={() => handleCardClick(invoice)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardDate}>
                                        {formatDate(invoice.createdAt)}
                                    </span>
                                </div>

                                {invoice.companyOrIndividual && (
                                    <span className={`${styles.companyType} ${
                                        invoice.companyOrIndividual.toLowerCase() === 'company' 
                                            ? styles.company 
                                            : styles.individual
                                    }`}>
                                        {invoice.companyOrIndividual}
                                    </span>
                                )}

                                <h3 className={styles.customerName}>
                                    {invoice.customerName || 'Unknown Customer'}
                                </h3>
                                
                                <p className={styles.customerEmail}>
                                    {invoice.customerEmail || 'No email provided'}
                                </p>

                                <div className={styles.cardFooter}>
                                    <div className={styles.totalAmount}>
                                        ${invoice.totalAmount ? invoice.totalAmount.toFixed(2) : '0.00'}
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button
                                            onClick={(e) => handleEditInvoice(e, invoice)}
                                            className={`${styles.actionButton} ${styles.editButton}`}
                                            title="Edit Invoice"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteInvoice(e, invoice.id)}
                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                            title="Delete Invoice"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceHistory;
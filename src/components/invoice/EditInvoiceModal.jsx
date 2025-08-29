import React, { useState, useEffect } from 'react';
import styles from './EditInvoiceModal.module.css';

const EditInvoiceModal = ({ isOpen, onClose, invoice, onSave }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        companyOrIndividual: 'Individual',
        products: []
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && invoice) {
            setFormData({
                customerName: invoice.customerName || '',
                customerEmail: invoice.customerEmail || '',
                companyOrIndividual: invoice.companyOrIndividual || 'Individual',
                products: invoice.products?.map(product => ({
                    productName: product.productName || '',
                    price: product.price || '',
                    quantity: product.quantity || '1'
                })) || []
            });
            setErrors({});
        }
    }, [isOpen, invoice]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Customer name is required';
        }

        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = 'Customer email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
            newErrors.customerEmail = 'Please enter a valid email address';
        }

        const validProducts = formData.products.filter(
            p => p.productName.trim() && p.price && p.quantity
        );
        if (validProducts.length === 0) {
            newErrors.products = 'At least one product is required';
        }

        formData.products.forEach((product, index) => {
            if (product.productName.trim() && (!product.price || !product.quantity)) {
                newErrors[`product_${index}`] = 'Price and quantity are required for all products';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...formData.products];
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            products: updatedProducts
        }));

        // Clear product-specific errors
        if (errors[`product_${index}`]) {
            setErrors(prev => ({
                ...prev,
                [`product_${index}`]: ''
            }));
        }
        if (errors.products) {
            setErrors(prev => ({
                ...prev,
                products: ''
            }));
        }
    };

    const addProduct = () => {
        setFormData(prev => ({
            ...prev,
            products: [...prev.products, { productName: '', price: '', quantity: '1' }]
        }));
    };

    const removeProduct = (index) => {
        if (formData.products.length > 1) {
            const updatedProducts = formData.products.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                products: updatedProducts
            }));
        }
    };

    const calculateProductTotal = (price, quantity) => {
        const numPrice = parseFloat(price) || 0;
        const numQuantity = parseInt(quantity) || 0;
        return numPrice * numQuantity;
    };

    const calculateOverallTotal = () => {
        return formData.products.reduce((sum, product) => {
            return sum + calculateProductTotal(product.price, product.quantity);
        }, 0);
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const validProducts = formData.products.filter(
                p => p.productName.trim() && p.price && p.quantity
            );

            await onSave(
                invoice.id,
                formData.customerName.trim(),
                formData.customerEmail.trim(),
                validProducts
            );
        } catch (error) {
            console.error('Error saving invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className={styles.header}>
                        <h2 className={styles.title}>Edit Invoice</h2>
                        <button 
                            className={styles.closeButton} 
                            onClick={onClose}
                            disabled={loading}
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className={styles.content}>
                        {/* Customer Information */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Customer Information</h3>
                            
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Customer Name *</label>
                                <input
                                    type="text"
                                    value={formData.customerName}
                                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                                    className={`${styles.input} ${errors.customerName ? styles.inputError : ''}`}
                                    placeholder="Enter customer name"
                                    disabled={loading}
                                />
                                {errors.customerName && (
                                    <span className={styles.errorText}>{errors.customerName}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Customer Email *</label>
                                <input
                                    type="email"
                                    value={formData.customerEmail}
                                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                                    className={`${styles.input} ${errors.customerEmail ? styles.inputError : ''}`}
                                    placeholder="Enter customer email"
                                    disabled={loading}
                                />
                                {errors.customerEmail && (
                                    <span className={styles.errorText}>{errors.customerEmail}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Type</label>
                                <select
                                    value={formData.companyOrIndividual}
                                    onChange={(e) => handleInputChange('companyOrIndividual', e.target.value)}
                                    className={styles.input}
                                    disabled={loading}
                                >
                                    <option value="Individual">Individual</option>
                                    <option value="Company">Company</option>
                                </select>
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className={styles.section}>
                            <div className={styles.productsHeader}>
                                <h3 className={styles.sectionTitle}>Products & Services</h3>
                                <button
                                    type="button"
                                    onClick={addProduct}
                                    className={styles.addButton}
                                    disabled={loading}
                                >
                                    + Add Product
                                </button>
                            </div>

                            {errors.products && (
                                <span className={styles.errorText}>{errors.products}</span>
                            )}

                            {formData.products.map((product, index) => (
                                <div key={index} className={styles.productRow}>
                                    <input
                                        type="text"
                                        placeholder="Product name"
                                        value={product.productName}
                                        onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                                        className={styles.productInput}
                                        disabled={loading}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={product.price}
                                        onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                        className={styles.productInput}
                                        min="0"
                                        step="0.01"
                                        disabled={loading}
                                    />
                                    <input
                                        type="number"
                                        value={product.quantity}
                                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                        className={styles.productInput}
                                        min="1"
                                        disabled={loading}
                                    />
                                    <div className={styles.productTotal}>
                                        ${calculateProductTotal(product.price, product.quantity).toFixed(2)}
                                    </div>
                                    {formData.products.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProduct(index)}
                                            className={styles.removeButton}
                                            disabled={loading}
                                        >
                                            ×
                                        </button>
                                    )}
                                    {errors[`product_${index}`] && (
                                        <span className={styles.errorText}>{errors[`product_${index}`]}</span>
                                    )}
                                </div>
                            ))}

                            {/* Total */}
                            <div className={styles.totalSection}>
                                <strong>Total: ${calculateOverallTotal().toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.footer}>
                        <button
                            onClick={onClose}
                            className={styles.cancelButton}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className={styles.saveButton}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditInvoiceModal;
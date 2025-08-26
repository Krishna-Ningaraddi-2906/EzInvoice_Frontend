import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getUserData } from '../../utils/auth';
import styles from './Invoice.module.css';

const Invoice = () => {
    const navigate = useNavigate();
    const userData = getUserData();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={styles.container}>
            {/* Header with user info and logout */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>Login Successful!</h1>
                    {userData && (
                        <p className={styles.welcomeText}>
                            Welcome, {userData.userName}!
                        </p>
                    )}
                </div>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Logout
                </button>
            </div>
            
            {/* Welcome message */}
            <div className={styles.welcomeSection}>
                <div className={styles.welcomeIcon}>🎉</div>
                <h2 className={styles.successTitle}>Authentication Successful!</h2>
                <p className={styles.successDescription}>
                    You have successfully logged into the Invoice Generator system.
                </p>
            </div>
            
            {/* Information section */}
            <div className={styles.infoSection}>
                <h3 className={styles.infoTitle}>What's Next?</h3>
                <p className={styles.infoDescription}>
                    This is the Invoice Dashboard where you will be able to create, manage, 
                    and track your invoices. The full invoice management features will be 
                    implemented in the next phase of development.
                </p>
            </div>
            
            {/* User details if available */}
            {userData && (
                <div className={styles.userDetailsSection}>
                    <h3 className={styles.userDetailsTitle}>Your Account Details:</h3>
                    <p className={styles.userDetail}>
                        <strong>Username: </strong>{userData.userName}
                    </p>
                    <p className={styles.userDetail}>
                        <strong>Email: </strong>{userData.email}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Invoice;
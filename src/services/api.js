// API Base URL - Make sure this matches your Spring Boot server
const API_BASE_URL = 'http://localhost:8081';

// API Endpoints
const ENDPOINTS = {
    SIGNUP: `${API_BASE_URL}/home/signup`,
    LOGIN: `${API_BASE_URL}/home/login`,
    CREATE_INVOICE: `${API_BASE_URL}/invoice/create-invoice`,
    GET_ALL_INVOICES: `${API_BASE_URL}/invoice/get-all-invoice`,
    GET_INVOICES_BY_CUSTOMER: `${API_BASE_URL}/invoice/by-customer`,
    UPDATE_INVOICE: `${API_BASE_URL}/invoice/update`,
    DELETE_INVOICE: `${API_BASE_URL}/invoice/delete`
};

// Signup API call - FIXED VERSION
export const signupUser = async (userData, logoFile) => {
    try {
        console.log('Sending signup request to:', ENDPOINTS.SIGNUP);
        console.log('User data:', userData);
        
        const formData = new FormData();
        
        // Add user data as a JSON blob with correct Content-Type
        const userBlob = new Blob([JSON.stringify(userData)], {
            type: 'application/json'
        });
        formData.append('user', userBlob);
        
        // Add logo file if provided
        if (logoFile) {
            console.log('Logo file:', logoFile.name, logoFile.size);
            formData.append('logo', logoFile);
        }
        
        const response = await fetch(ENDPOINTS.SIGNUP, {
            method: 'POST',
            body: formData
            // Don't set Content-Type header - let browser set it automatically for multipart/form-data
        });
        
        console.log('Signup response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Signup error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.json(); // Parse as JSON since backend returns JSON
        console.log('Signup success response:', result);
        return { success: true, message: result.message || 'Signup successful!' };
        
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, message: error.message || 'Signup failed. Please try again.' };
    }
};

// Login API call
export const loginUser = async (email, password) => {
    try {
        console.log('Sending login request to:', ENDPOINTS.LOGIN);
        console.log('Login credentials:', { email, password: '***' });
        
        const response = await fetch(ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('Login response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Login error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Login success response:', result);
        
        // Store the auth token if provided in the response
        if (result.token || result.accessToken || result.authToken) {
            const token = result.token || result.accessToken || result.authToken;
            localStorage.setItem('authToken', token);
            console.log('Auth token stored successfully');
        }
        
        return { success: true, data: result };
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
};

// Get authentication headers with JWT token
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.warn('No auth token found. User may need to login again.');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Create Invoice
export const createInvoice = async (customerName, customerEmail, products, companyOrIndividual = 'Individual') => {
  try {
    console.log("=== CREATE INVOICE DEBUG START ===");
    console.log("customerName:", customerName);
    console.log("customerEmail:", customerEmail);
    console.log("companyOrIndividual:", companyOrIndividual);
    console.log("products received:", products);

    if (!products || products.length === 0) {
      throw new Error("No products provided");
    }

    // Calculate total amount from all products
    const totalAmount = products.reduce((sum, product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = parseInt(product.quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    // Prepare products data
    const productsData = products.map(product => ({
      productName: product.productName,
      price: String(product.price || 0),
      quantity: String(product.quantity || 1)
    }));

    const invoiceData = {
      createInvoiceDto: {
        customerName,
        customerEmail,
        companyOrIndividual: companyOrIndividual,
        totalAmount: totalAmount,
        invoiceDate: new Date().toISOString().split('T')[0]
      },
      addProductsDto: productsData
    };

    console.log("Final payload to send:", JSON.stringify(invoiceData, null, 2));

    const response = await fetch(ENDPOINTS.CREATE_INVOICE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      
      if (response.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      }
      if (response.status === 403) {
        throw new Error("Access denied. You are not authorized to create invoices.");
      }

      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.text();
    console.log("Success response:", result);

    return { success: true, message: "Invoice created successfully", data: result };
  } catch (error) {
    console.error("=== CREATE INVOICE ERROR ===", error);
    return {
      success: false,
      message: error.message || "Failed to create invoice. Please try again.",
    };
  }
};

// Alternative createInvoice function if you prefer to pass the entire form data object
export const createInvoiceFromFormData = async (formData) => {
    try {
        const { customerName, customerEmail, products } = formData;
        return await createInvoice(customerName, customerEmail, products);
    } catch (error) {
        console.error('Create invoice from form data error:', error);
        return { 
            success: false, 
            message: error.message || 'Failed to create invoice. Please try again.' 
        };
    }
};

// Get All Invoices API call
export const getAllInvoices = async () => {
    try {
        console.log('Sending get all invoices request to:', ENDPOINTS.GET_ALL_INVOICES);
        
        const response = await fetch(ENDPOINTS.GET_ALL_INVOICES, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        console.log('Get all invoices response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed. Please login again.');
            }
            
            const errorText = await response.text();
            console.error('Get all invoices error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Get all invoices success response:', result);
        return { success: true, data: result };
        
    } catch (error) {
        console.error('Get all invoices error:', error);
        return { 
            success: false, 
            message: error.message || 'Failed to fetch invoices. Please try again.' 
        };
    }
};

// Get Invoices by Customer Email
export const getInvoicesByCustomer = async (customerEmail) => {
    try {
        console.log('Sending get invoices by customer request to:', ENDPOINTS.GET_INVOICES_BY_CUSTOMER);
        
        const response = await fetch(ENDPOINTS.GET_INVOICES_BY_CUSTOMER, {
            method: 'POST', // Change this to POST
            headers: getAuthHeaders(),
            body: JSON.stringify({ customerEmail })
        });
        
        console.log('Get invoices by customer response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed. Please login again.');
            }
            
            const errorText = await response.text();
            console.error('Get invoices by customer error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Get invoices by customer success response:', result);
        return { success: true, data: result };
        
    } catch (error) {
        console.error('Get invoices by customer error:', error);
        return { 
            success: false, 
            message: error.message || 'Failed to fetch customer invoices. Please try again.' 
        };
    }
};

// Update Invoice
export const updateInvoice = async (invoiceId, customerName, customerEmail, products) => {
    try {
        console.log('=== UPDATE INVOICE DEBUG START ===');
        console.log('invoiceId:', invoiceId);
        console.log('customerName:', customerName);
        console.log('customerEmail:', customerEmail);
        console.log('products received:', products);
        
        if (!products || products.length === 0) {
            throw new Error("No products provided");
        }

        // Calculate total amount from all products
        const totalAmount = products.reduce((sum, product) => {
            const price = parseFloat(product.price) || 0;
            const quantity = parseInt(product.quantity) || 0;
            return sum + (price * quantity);
        }, 0);

        // Keep products as strings to match backend DTO expectations
        const transformedProducts = products.map(product => ({
            productName: product.productName || '',
            price: String(product.price || '0'),      // Keep as String
            quantity: String(product.quantity || '1') // Keep as String
        }));

        const invoiceData = {
            createInvoiceDto: {
                customerName: customerName,
                customerEmail: customerEmail,
                companyOrIndividual: "Individual", // Add this field
                totalAmount: totalAmount,
                invoiceDate: new Date().toISOString().split('T')[0]
            },
            addProductsDto: transformedProducts // Array of products with String types
        };

        console.log('Final payload to send:', JSON.stringify(invoiceData, null, 2));
        console.log('Request URL:', `${ENDPOINTS.UPDATE_INVOICE}/${invoiceId}`);
        
        const response = await fetch(`${ENDPOINTS.UPDATE_INVOICE}/${invoiceId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(invoiceData)
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            
            if (response.status === 401) {
                throw new Error('Authentication failed. Please login again.');
            }
            if (response.status === 404) {
                throw new Error('Invoice not found or access denied.');
            }
            
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.text();
        console.log('Success response:', result);
        console.log('=== UPDATE INVOICE DEBUG END ===');
        
        return { success: true, message: result };
        
    } catch (error) {
        console.error('=== UPDATE INVOICE ERROR ===');
        console.error('Error message:', error.message);
        console.error('=== UPDATE INVOICE ERROR END ===');
        return { 
            success: false, 
            message: error.message || 'Failed to update invoice. Please try again.' 
        };
    }
};

// Delete Invoice
export const deleteInvoice = async (invoiceId) => {
    try {
        console.log('Sending delete invoice request to:', `${ENDPOINTS.DELETE_INVOICE}/${invoiceId}`);
        
        const response = await fetch(`${ENDPOINTS.DELETE_INVOICE}/${invoiceId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed. Please login again.');
            }
            if (response.status === 404) {
                throw new Error('Invoice not found or access denied.');
            }
            
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.text();
        return { success: true, message: result };
        
    } catch (error) {
        console.error('Delete invoice error:', error);
        return { 
            success: false, 
            message: error.message || 'Failed to delete invoice. Please try again.' 
        };
    }
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return !!token;
};

// Utility function to logout user
export const logout = () => {
    localStorage.removeItem('authToken');
    console.log('User logged out successfully');
};
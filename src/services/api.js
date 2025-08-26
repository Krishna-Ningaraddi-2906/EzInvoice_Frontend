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

// Signup API call
export const signupUser = async (userData, logoFile) => {
    try {
        console.log('Sending signup request to:', ENDPOINTS.SIGNUP);
        console.log('User data:', userData);
        
        const formData = new FormData();
        
        // Add user data as JSON string
        formData.append('user', JSON.stringify(userData));
        
        // Add logo file if provided
        if (logoFile) {
            console.log('Logo file:', logoFile.name, logoFile.size);
            formData.append('logo', logoFile);
        }
        
        const response = await fetch(ENDPOINTS.SIGNUP, {
            method: 'POST',
            body: formData
        });
        
        console.log('Signup response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Signup error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.text(); // Assuming backend returns text response
        console.log('Signup success response:', result);
        return { success: true, message: result };
        
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
export const createInvoice = async (customerName, customerEmail, products) => {
  try {
    console.log("=== CREATE INVOICE DEBUG START ===");
    console.log("customerName:", customerName);
    console.log("customerEmail:", customerEmail);
    console.log("products received:", products);

    // Since your backend only handles one product at a time, 
    // we'll send the first product only for now
    const firstProduct = products[0];
    
    if (!firstProduct) {
      throw new Error("No products provided");
    }

    // Match your backend DTO structure exactly - only fields that exist in your DTOs
    const invoiceData = {
      createInvoiceDto: {
        customerName,
        customerEmail,
        companyOrIndividual: "Individual" // Only include fields that exist in your CreateInvoiceDto
      },
      addProductsDto: {
        productName: firstProduct.productName || firstProduct.name,
        price: String(firstProduct.price || 0), // Convert to String as backend expects
        quantity: String(firstProduct.quantity || 1) // Convert to String as backend expects
      }
    };

    console.log("Final payload to send:", JSON.stringify(invoiceData, null, 2));
    console.log("Request URL:", ENDPOINTS.CREATE_INVOICE);

    const response = await fetch(ENDPOINTS.CREATE_INVOICE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(invoiceData),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

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

    const result = await response.text(); // Your backend returns text, not JSON
    console.log("Success response:", result);
    console.log("=== CREATE INVOICE DEBUG END ===");

    return { success: true, message: "Invoice created successfully", data: result };
  } catch (error) {
    console.error("=== CREATE INVOICE ERROR ===");
    console.error("Error message:", error.message);
    console.error("=== CREATE INVOICE ERROR END ===");
    
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
        console.log('Preparing updated invoice data...');
        
        // Transform products data
        const transformedProducts = products.map(product => ({
            productName: product.productName || product.name,
            price: parseFloat(product.price) || 0,
            quantity: parseInt(product.quantity) || 1,
            totalAmount: parseFloat(product.totalAmount) || (parseFloat(product.price || 0) * parseInt(product.quantity || 1))
        }));
        
        const totalInvoiceAmount = transformedProducts.reduce((sum, product) => sum + product.totalAmount, 0);
        
        const invoiceData = {
            createInvoiceDto: {
                customerName: customerName,
                customerEmail: customerEmail,
                totalAmount: totalInvoiceAmount,
                invoiceDate: new Date().toISOString().split('T')[0],
            },
            addProductsDto: transformedProducts
        };
        
        console.log('Sending update invoice request to:', `${ENDPOINTS.UPDATE_INVOICE}/${invoiceId}`);
        
        const response = await fetch(`${ENDPOINTS.UPDATE_INVOICE}/${invoiceId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(invoiceData)
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
        console.error('Update invoice error:', error);
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
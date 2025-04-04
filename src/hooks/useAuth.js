import { useState, useEffect } from 'react';

/**
 * A custom hook for handling user authentication
 * For simplicity, this uses localStorage for persistence
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check for existing logged in user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('buffstacker_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem('buffstacker_user');
      }
    }
    setLoading(false);
  }, []);
  
  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('buffstacker_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('buffstacker_user');
    }
  }, [user]);
  
  /**
   * Register a new user
   * @param {string} username - The username
   * @param {string} password - The password
   * @returns {Object} The result with success status and message
   */
  const register = (username, password) => {
    if (!username || !password) {
      return { success: false, message: "Username and password are required" };
    }
    
    // Get existing users
    const usersJson = localStorage.getItem('buffstacker_users') || '{}';
    let users;
    
    try {
      users = JSON.parse(usersJson);
    } catch (error) {
      console.error("Error parsing users:", error);
      users = {};
    }
    
    // Check if username already exists
    if (users[username]) {
      return { success: false, message: "Username already exists" };
    }
    
    // Create new user
    users[username] = {
      username,
      password,
      createdAt: new Date().toISOString()
    };
    
    // Save users
    localStorage.setItem('buffstacker_users', JSON.stringify(users));
    
    // Auto-login after registration
    setUser({ username });
    
    return { success: true, message: "Registration successful" };
  };
  
  /**
   * Login a user
   * @param {string} username - The username
   * @param {string} password - The password
   * @returns {Object} The result with success status and message
   */
  const login = (username, password) => {
    if (!username || !password) {
      return { success: false, message: "Username and password are required" };
    }
    
    // Get existing users
    const usersJson = localStorage.getItem('buffstacker_users') || '{}';
    let users;
    
    try {
      users = JSON.parse(usersJson);
    } catch (error) {
      console.error("Error parsing users:", error);
      return { success: false, message: "Login failed" };
    }
    
    // Check if user exists and password matches
    const userRecord = users[username];
    if (!userRecord || userRecord.password !== password) {
      return { success: false, message: "Invalid username or password" };
    }
    
    // Set user state (don't include password in the state)
    setUser({ username });
    
    return { success: true, message: "Login successful" };
  };
  
  /**
   * Logout the current user
   */
  const logout = () => {
    setUser(null);
  };
  
  return {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };
};

export default useAuth;
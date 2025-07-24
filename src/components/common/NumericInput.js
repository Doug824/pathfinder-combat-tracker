import React, { useState, useEffect, useRef } from 'react';

/**
 * A controlled numeric input component that allows temporarily empty values
 * but ensures numeric values are saved to state
 */
const NumericInput = ({
  value,
  onChange,
  min = null,
  max = null,
  placeholder = '0',
  className = '',
  ...restProps
}) => {
  // Keep track of the actual input string (could be empty temporarily)
  const [inputValue, setInputValue] = useState(value?.toString() || '0');
  
  // Debounce timer to prevent excessive onChange calls during fast typing
  const debounceTimer = useRef(null);
  
  // Update input value when the prop changes
  useEffect(() => {
    setInputValue(value?.toString() || '0');
  }, [value]);
  
  // Handle input changes - allow empty string temporarily
  const handleChange = (e) => {
    const newInputValue = e.target.value;
    
    // Only allow digits, empty string, or single minus for negative numbers
    if (newInputValue !== '' && !/^-?\d*$/.test(newInputValue)) {
      return; // Don't update if invalid characters
    }
    
    setInputValue(newInputValue);
    
    // If the input is empty, don't update parent state yet
    if (newInputValue === '' || newInputValue === '-') {
      return;
    }
    
    // Convert to number and validate
    const numValue = parseInt(newInputValue, 10);
    
    // Handle non-numeric input - should not happen with regex check above
    if (isNaN(numValue)) {
      return;
    }
    
    // Apply min/max constraints if specified
    if (min !== null && numValue < min) {
      // Don't auto-correct while typing, let them finish
      if (newInputValue.length <= 2) {
        return; // Allow them to continue typing
      }
      onChange(min);
      return;
    }
    
    if (max !== null && numValue > max) {
      // Don't auto-correct while typing, let them finish  
      if (newInputValue.length <= 2) {
        return; // Allow them to continue typing
      }
      onChange(max);
      return;
    }
    
    // Debounce the onChange call to prevent excessive updates during fast typing
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      onChange(numValue);
    }, 150); // 150ms delay
  };
  
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);
  
  // When input loses focus, ensure it has a valid numeric value
  const handleBlur = (e) => {
    // Clear any pending debounced onChange
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    
    const currentValue = inputValue;
    
    // If empty or just a minus sign, revert to default value
    if (currentValue === '' || currentValue === '-') {
      const defaultValue = min !== null ? Math.max(0, min) : 0;
      setInputValue(defaultValue.toString());
      onChange(defaultValue);
      return;
    }
    
    // Validate the current value and apply constraints
    const numValue = parseInt(currentValue, 10);
    if (!isNaN(numValue)) {
      let finalValue = numValue;
      
      // Apply min/max constraints
      if (min !== null && finalValue < min) {
        finalValue = min;
      }
      if (max !== null && finalValue > max) {
        finalValue = max;
      }
      
      // Update both display and parent if value changed
      if (finalValue !== numValue) {
        setInputValue(finalValue.toString());
      }
      onChange(finalValue);
    }
    
    // Call original onBlur if provided
    if (restProps.onBlur) {
      restProps.onBlur(e);
    }
  };
  
  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`input-fantasy max-w-24 ${className}`}
      placeholder={placeholder}
      {...restProps}
    />
  );
};

export default NumericInput;
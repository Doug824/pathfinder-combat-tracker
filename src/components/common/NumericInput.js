import React, { useState, useEffect } from 'react';

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
  
  // Update input value when the prop changes
  useEffect(() => {
    setInputValue(value?.toString() || '0');
  }, [value]);
  
  // Handle input changes - allow empty string temporarily
  const handleChange = (e) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);
    
    // If the input is empty, don't update parent state yet
    if (newInputValue === '') {
      return;
    }
    
    // Convert to number and validate
    const numValue = parseInt(newInputValue);
    
    // Handle non-numeric input
    if (isNaN(numValue)) {
      return;
    }
    
    // Apply min/max constraints if specified
    if (min !== null && numValue < min) {
      onChange(min);
      return;
    }
    
    if (max !== null && numValue > max) {
      onChange(max);
      return;
    }
    
    // Pass the valid value to parent
    onChange(numValue);
  };
  
  // When input loses focus, ensure it has a valid numeric value
  const handleBlur = (e) => {
    const currentValue = inputValue;
    
    // If empty, revert to 0 or min value
    if (currentValue === '') {
      const defaultValue = min !== null ? Math.max(0, min) : 0;
      setInputValue(defaultValue.toString());
      onChange(defaultValue);
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
      className={`form-control ${className}`}
      placeholder={placeholder}
      {...restProps}
    />
  );
};

export default NumericInput;
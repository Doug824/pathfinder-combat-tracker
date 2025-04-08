import React from 'react';

/**
 * A wrapper component for select elements to add custom styling
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - The select element
 * @returns {JSX.Element} The wrapped select element
 */
const SelectWrapper = ({ children, className = '' }) => {
  // Clone the child element (select) and add our custom class
  const enhancedSelect = React.cloneElement(
    React.Children.only(children),
    { 
      className: `form-control-select ${children.props.className || ''}`
    }
  );
  
  return (
    <div className={`select-wrapper ${className}`}>
      {enhancedSelect}
    </div>
  );
};

export default SelectWrapper;
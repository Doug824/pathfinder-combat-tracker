/**
 * Utility functions for handling creature sizes
 */

/**
 * Get the CMB/CMD size modifier based on creature size
 * @param {string} size - The size category of the character
 * @returns {number} The size modifier value
 */
export const getSizeModifier = (size) => {
    const sizeModifiers = {
      'fine': -8,
      'diminutive': -4,
      'tiny': -2,
      'small': -1,
      'medium': 0,
      'large': 1,
      'huge': 2,
      'gargantuan': 4,
      'colossal': 8
    };
    
    return sizeModifiers[size?.toLowerCase()] || 0; // Default to 0 (medium) if size is undefined
  };
  
  /**
   * Get size-based AC modifier
   * @param {string} size - The size category of the character
   * @returns {number} The size modifier to AC
   */
  export const getSizeACModifier = (size) => {
    const sizeACModifiers = {
      'fine': 8,
      'diminutive': 4,
      'tiny': 2,
      'small': 1,
      'medium': 0,
      'large': -1,
      'huge': -2,
      'gargantuan': -4,
      'colossal': -8
    };
    
    return sizeACModifiers[size?.toLowerCase()] || 0;
  };
  
  /**
   * Get display name for size category
   * @param {string} size - The size category of the character
   * @returns {string} The formatted display name
   */
  export const getSizeDisplayName = (size) => {
    const displayNames = {
      'fine': 'Fine',
      'diminutive': 'Diminutive',
      'tiny': 'Tiny',
      'small': 'Small',
      'medium': 'Medium',
      'large': 'Large',
      'huge': 'Huge',
      'gargantuan': 'Gargantuan',
      'colossal': 'Colossal'
    };
    
    return displayNames[size?.toLowerCase()] || 'Medium';
  };
  
  /**
   * Get size categories with their display names
   * @returns {Array} Array of size options
   */
  export const getSizeOptions = () => {
    return [
      { value: 'fine', label: 'Fine' },
      { value: 'diminutive', label: 'Diminutive' },
      { value: 'tiny', label: 'Tiny' },
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'huge', label: 'Huge' },
      { value: 'gargantuan', label: 'Gargantuan' },
      { value: 'colossal', label: 'Colossal' }
    ];
  };
  
  export default {
    getSizeModifier,
    getSizeACModifier,
    getSizeDisplayName,
    getSizeOptions
  };

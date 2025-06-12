
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, Check, Plus, X } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  onChange: (value: string) => void;
  value?: string;
  placeholder?: string;
  label?: string;
  id?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  onChange,
  value = '',
  placeholder = "Search or type to add...",
  label,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show selected value when not searching, search term when searching
  const displayValue = isOpen ? searchTerm : value;

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasExactMatch = options.some(option => 
    option.toLowerCase() === searchTerm.toLowerCase()
  );

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 240; // max-h-60 = 240px
      
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownDirection('up');
      } else {
        setDropdownDirection('down');
      }
    }
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleAddCustom = () => {
    if (searchTerm.trim() && !hasExactMatch) {
      onChange(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (value) {
      setSearchTerm('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim() && !hasExactMatch) {
      e.preventDefault();
      handleAddCustom();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={value ? value : placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="pr-16"
        />
        <div className="absolute right-0 top-0 h-full flex items-center">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-full px-2"
              onClick={handleClear}
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-full px-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>
      
      {isOpen && (
        <div 
          ref={dropdownRef}
          className={`absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${
            dropdownDirection === 'up' ? 'bottom-full mb-1 mt-0' : ''
          }`}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between group"
                onClick={() => handleSelect(option)}
              >
                <span>{option}</span>
                {value === option && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </button>
            ))
          ) : null}
          
          {/* Add custom option if search term doesn't match exactly */}
          {searchTerm.trim() && !hasExactMatch && (
            <button
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 border-t border-gray-200 bg-blue-50"
              onClick={handleAddCustom}
            >
              <Plus className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600">Add "{searchTerm.trim()}"</span>
            </button>
          )}
          
          {filteredOptions.length === 0 && !searchTerm.trim() && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              Start typing to search or add a custom manufacturer...
            </div>
          )}
        </div>
      )}
      
      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

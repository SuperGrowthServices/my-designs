export const cleanVehicleData = (vehicle: any) => {
  if (!vehicle) {
    return {
      make: 'Unknown',
      model: 'Unknown',
      year: 0,
      isCorrupted: true
    };
  }

  // Check if make contains an email (corrupted data)
  const emailRegex = /\S+@\S+\.\S+/;
  const phoneRegex = /[\+]?[1-9][\d]{3,14}/;
  
  let make = vehicle.make;
  let model = vehicle.model;
  let year = vehicle.year;
  let isCorrupted = false;

  // Only clean if the data is obviously corrupted
  if (make && (emailRegex.test(make) || phoneRegex.test(make))) {
    make = 'Unknown';
    isCorrupted = true;
  }

  if (model && (emailRegex.test(model) || phoneRegex.test(model))) {
    model = 'Unknown';
    isCorrupted = true;
  }

  // Clean year field - only if it's obviously invalid
  const currentYear = new Date().getFullYear();
  if (year && (year < 1900 || year > currentYear + 2)) {
    year = 0;
    isCorrupted = true;
  }

  // If any field is missing or empty, mark as corrupted but preserve other fields
  if (!make || make.trim().length === 0) {
    make = 'Unknown';
    isCorrupted = true;
  }

  if (!model || model.trim().length === 0) {
    model = 'Unknown';
    isCorrupted = true;
  }

  if (!year) {
    year = 0;
    isCorrupted = true;
  }

  return { 
    make: make.trim(), 
    model: model.trim(), 
    year, 
    isCorrupted 
  };
};

export const formatVehicleDisplay = (vehicle: any) => {
  const cleaned = cleanVehicleData(vehicle);
  
  if (cleaned.make === 'Unknown' && cleaned.model === 'Unknown') {
    return 'Vehicle info unavailable';
  }
  
  if (cleaned.year === 0) {
    return `${cleaned.make} ${cleaned.model}`;
  }
  
  return `${cleaned.make} ${cleaned.model} ${cleaned.year}`;
};

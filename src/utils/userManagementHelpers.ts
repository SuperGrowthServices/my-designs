
interface User {
  profile?: {
    full_name?: string;
    whatsapp_number?: string;
    location?: string;
  };
  raw_user_meta_data?: any;
}

export const getUserDisplayName = (user: User) => {
  if (user.profile?.full_name) {
    return user.profile.full_name;
  }
  if (user.raw_user_meta_data?.full_name) {
    return user.raw_user_meta_data.full_name;
  }
  if (user.raw_user_meta_data?.name) {
    return user.raw_user_meta_data.name;
  }
  return 'No name provided';
};

export const getUserPhone = (user: User) => {
  if (user.profile?.whatsapp_number) {
    return user.profile.whatsapp_number;
  }
  if (user.raw_user_meta_data?.whatsapp_number) {
    return user.raw_user_meta_data.whatsapp_number;
  }
  if (user.raw_user_meta_data?.phone) {
    return user.raw_user_meta_data.phone;
  }
  return 'Not provided';
};

export const getUserLocation = (user: User) => {
  if (user.profile?.location) {
    return user.profile.location;
  }
  if (user.raw_user_meta_data?.location) {
    return user.raw_user_meta_data.location;
  }
  return 'Not provided';
};

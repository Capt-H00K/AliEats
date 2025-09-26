import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageUpload } from './ImageUpload';
import { 
  Save, 
  Loader2, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Plus,
  Trash2,
  Star,
  Heart,
  CreditCard
} from 'lucide-react';

// Validation schema
const customerProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().optional(),
  addresses: z.array(z.object({
    id: z.string().optional(),
    label: z.string().min(1, 'Address label is required'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code must be at least 5 digits'),
    isDefault: z.boolean(),
    deliveryInstructions: z.string().optional(),
  })).min(1, 'At least one address is required'),
  preferences: z.object({
    cuisineTypes: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    spiceLevel: z.enum(['mild', 'medium', 'hot', 'extra_hot']).optional(),
    notifications: z.object({
      orderUpdates: z.boolean(),
      promotions: z.boolean(),
      newRestaurants: z.boolean(),
    }),
  }),
});

type CustomerProfileFormData = z.infer<typeof customerProfileSchema>;

interface CustomerProfileFormProps {
  initialData?: Partial<CustomerProfileFormData & { profilePicture?: string }>;
  onSubmit: (data: CustomerProfileFormData & { profilePicture?: string }) => Promise<void>;
  isLoading?: boolean;
}

const CUISINE_TYPES = [
  'Italian', 'Chinese', 'Mexican', 'Japanese', 'Indian', 'Thai', 'American',
  'Mediterranean', 'Korean', 'Vietnamese', 'French', 'Greek', 'Spanish'
];

const DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
  'Keto', 'Paleo', 'Low-Carb', 'Halal', 'Kosher'
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const CustomerProfileForm: React.FC<CustomerProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false
}) => {
  const [profilePicture, setProfilePicture] = useState<string>(initialData?.profilePicture || '');
  const [uploadError, setUploadError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue
  } = useForm<CustomerProfileFormData>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      addresses: initialData?.addresses || [{
        label: 'Home',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: true,
        deliveryInstructions: '',
      }],
      preferences: {
        cuisineTypes: initialData?.preferences?.cuisineTypes || [],
        dietaryRestrictions: initialData?.preferences?.dietaryRestrictions || [],
        spiceLevel: initialData?.preferences?.spiceLevel || 'medium',
        notifications: {
          orderUpdates: initialData?.preferences?.notifications?.orderUpdates ?? true,
          promotions: initialData?.preferences?.notifications?.promotions ?? true,
          newRestaurants: initialData?.preferences?.notifications?.newRestaurants ?? false,
        },
      },
    }
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: 'addresses',
  });

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    initialData?.preferences?.cuisineTypes || []
  );
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] = useState<string[]>(
    initialData?.preferences?.dietaryRestrictions || []
  );

  useEffect(() => {
    setValue('preferences.cuisineTypes', selectedCuisines);
  }, [selectedCuisines, setValue]);

  useEffect(() => {
    setValue('preferences.dietaryRestrictions', selectedDietaryRestrictions);
  }, [selectedDietaryRestrictions, setValue]);

  const handleFormSubmit = async (data: CustomerProfileFormData) => {
    try {
      await onSubmit({
        ...data,
        profilePicture
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const addAddress = () => {
    appendAddress({
      label: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false,
      deliveryInstructions: '',
    });
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setSelectedDietaryRestrictions(prev => 
      prev.includes(restriction) 
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const setDefaultAddress = (index: number) => {
    addressFields.forEach((_, i) => {
      setValue(`addresses.${i}.isDefault`, i === index);
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Profile Picture */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
        
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <ImageUpload
              folder="profile"
              currentImage={profilePicture}
              onUpload={(url) => setProfilePicture(url)}
              onError={setUploadError}
              placeholder="Upload profile picture"
              className="h-32"
              accept="image/*"
            />
            {uploadError && (
              <p className="text-red-500 text-sm mt-2">{uploadError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              {...register('firstName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              {...register('lastName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              Email Address *
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              Phone Number *
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(555) 123-4567"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              {...register('dateOfBirth')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Delivery Addresses
          </h3>
          <button
            type="button"
            onClick={addAddress}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Address
          </button>
        </div>

        <div className="space-y-6">
          {addressFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <input
                    {...register(`addresses.${index}.label`)}
                    placeholder="Address label (e.g., Home, Work)"
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="flex items-center">
                    <input
                      {...register(`addresses.${index}.isDefault`)}
                      type="checkbox"
                      onChange={() => setDefaultAddress(index)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Default</span>
                  </label>
                </div>
                
                {addressFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAddress(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    {...register(`addresses.${index}.street`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                  {errors.addresses?.[index]?.street && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.addresses[index]?.street?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    {...register(`addresses.${index}.city`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                  {errors.addresses?.[index]?.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.addresses[index]?.city?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <select
                    {...register(`addresses.${index}.state`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.addresses?.[index]?.state && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.addresses[index]?.state?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    {...register(`addresses.${index}.zipCode`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
                  />
                  {errors.addresses?.[index]?.zipCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.addresses[index]?.zipCode?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions
                  </label>
                  <textarea
                    {...register(`addresses.${index}.deliveryInstructions`)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Special delivery instructions (optional)"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {errors.addresses && (
          <p className="text-red-500 text-sm mt-2">At least one address is required</p>
        )}
      </div>

      {/* Food Preferences */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2" />
          Food Preferences
        </h3>

        <div className="space-y-6">
          {/* Favorite Cuisines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favorite Cuisines
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CUISINE_TYPES.map((cuisine) => (
                <label key={cuisine} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCuisines.includes(cuisine)}
                    onChange={() => toggleCuisine(cuisine)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{cuisine}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Restrictions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {DIETARY_RESTRICTIONS.map((restriction) => (
                <label key={restriction} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedDietaryRestrictions.includes(restriction)}
                    onChange={() => toggleDietaryRestriction(restriction)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{restriction}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Spice Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Spice Level
            </label>
            <div className="flex items-center space-x-4">
              {[
                { value: 'mild', label: 'Mild', icon: '🌶️' },
                { value: 'medium', label: 'Medium', icon: '🌶️🌶️' },
                { value: 'hot', label: 'Hot', icon: '🌶️🌶️🌶️' },
                { value: 'extra_hot', label: 'Extra Hot', icon: '🌶️🌶️🌶️🌶️' },
              ].map((level) => (
                <label key={level.value} className="flex items-center">
                  <input
                    {...register('preferences.spiceLevel')}
                    type="radio"
                    value={level.value}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {level.icon} {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              {...register('preferences.notifications.orderUpdates')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Order updates (preparation, delivery status)
            </span>
          </label>

          <label className="flex items-center">
            <input
              {...register('preferences.notifications.promotions')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Promotions and special offers
            </span>
          </label>

          <label className="flex items-center">
            <input
              {...register('preferences.notifications.newRestaurants')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              New restaurants in your area
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};
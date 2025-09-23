import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageUpload } from './ImageUpload';
import { Clock, MapPin, Phone, Mail, Globe, CreditCard, Save, Loader2 } from 'lucide-react';

// Validation schema
const restaurantProfileSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  description: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
  }),
  contactInfo: z.object({
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Valid email is required'),
    website: z.string().url('Valid website URL is required').optional().or(z.literal('')),
  }),
  bankDetails: z.object({
    accountName: z.string().min(1, 'Account name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    bankName: z.string().min(1, 'Bank name is required'),
    routingNumber: z.string().min(1, 'Routing number is required'),
  }),
  cuisineTypes: z.array(z.string()).min(1, 'At least one cuisine type is required'),
  openingHours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  })),
});

type RestaurantProfileFormData = z.infer<typeof restaurantProfileSchema>;

interface RestaurantProfileFormProps {
  initialData?: Partial<RestaurantProfileFormData>;
  onSubmit: (data: RestaurantProfileFormData & { logo?: string; coverImage?: string }) => Promise<void>;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const CUISINE_TYPES = [
  'American', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'Thai',
  'Mediterranean', 'French', 'Greek', 'Korean', 'Vietnamese', 'Middle Eastern',
  'Caribbean', 'African', 'Vegetarian', 'Vegan', 'Fast Food', 'Pizza', 'Burgers',
  'Seafood', 'Steakhouse', 'Bakery', 'Desserts', 'Coffee', 'Breakfast'
];

export const RestaurantProfileForm: React.FC<RestaurantProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false
}) => {
  const [logo, setLogo] = useState<string>(initialData?.logo || '');
  const [coverImage, setCoverImage] = useState<string>(initialData?.coverImage || '');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(initialData?.cuisineTypes || []);
  const [uploadError, setUploadError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<RestaurantProfileFormData>({
    resolver: zodResolver(restaurantProfileSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      address: {
        street: initialData?.address?.street || '',
        city: initialData?.address?.city || '',
        state: initialData?.address?.state || '',
        zipCode: initialData?.address?.zipCode || '',
      },
      contactInfo: {
        phone: initialData?.contactInfo?.phone || '',
        email: initialData?.contactInfo?.email || '',
        website: initialData?.contactInfo?.website || '',
      },
      bankDetails: {
        accountName: initialData?.bankDetails?.accountName || '',
        accountNumber: initialData?.bankDetails?.accountNumber || '',
        bankName: initialData?.bankDetails?.bankName || '',
        routingNumber: initialData?.bankDetails?.routingNumber || '',
      },
      cuisineTypes: initialData?.cuisineTypes || [],
      openingHours: initialData?.openingHours || DAYS_OF_WEEK.reduce((acc, day) => ({
        ...acc,
        [day]: { open: '09:00', close: '21:00', isOpen: true }
      }), {}),
    }
  });

  const openingHours = watch('openingHours');

  useEffect(() => {
    setValue('cuisineTypes', selectedCuisines);
  }, [selectedCuisines, setValue]);

  const handleCuisineToggle = (cuisine: string) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleFormSubmit = async (data: RestaurantProfileFormData) => {
    try {
      await onSubmit({
        ...data,
        logo,
        coverImage
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    setValue(`openingHours.${day}.${field}`, value);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name *
            </label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter restaurant name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your restaurant..."
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Restaurant Images</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <ImageUpload
              folder="restaurant"
              currentImage={logo}
              onUpload={(url) => setLogo(url)}
              onError={setUploadError}
              placeholder="Upload restaurant logo"
              className="h-40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <ImageUpload
              folder="restaurant"
              currentImage={coverImage}
              onUpload={(url) => setCoverImage(url)}
              onError={setUploadError}
              placeholder="Upload cover image"
              className="h-40"
            />
          </div>
        </div>

        {uploadError && (
          <p className="text-red-500 text-sm mt-2">{uploadError}</p>
        )}
      </div>

      {/* Address */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Address
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              {...register('address.street')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main Street"
            />
            {errors.address?.street && (
              <p className="text-red-500 text-sm mt-1">{errors.address.street.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              {...register('address.city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City"
            />
            {errors.address?.city && (
              <p className="text-red-500 text-sm mt-1">{errors.address.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              {...register('address.state')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="State"
            />
            {errors.address?.state && (
              <p className="text-red-500 text-sm mt-1">{errors.address.state.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code *
            </label>
            <input
              {...register('address.zipCode')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12345"
            />
            {errors.address?.zipCode && (
              <p className="text-red-500 text-sm mt-1">{errors.address.zipCode.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              Phone Number *
            </label>
            <input
              {...register('contactInfo.phone')}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(555) 123-4567"
            />
            {errors.contactInfo?.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.contactInfo.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              Email *
            </label>
            <input
              {...register('contactInfo.email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="restaurant@example.com"
            />
            {errors.contactInfo?.email && (
              <p className="text-red-500 text-sm mt-1">{errors.contactInfo.email.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              Website
            </label>
            <input
              {...register('contactInfo.website')}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.restaurant.com"
            />
            {errors.contactInfo?.website && (
              <p className="text-red-500 text-sm mt-1">{errors.contactInfo.website.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cuisine Types */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Cuisine Types</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CUISINE_TYPES.map((cuisine) => (
            <label key={cuisine} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCuisines.includes(cuisine)}
                onChange={() => handleCuisineToggle(cuisine)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{cuisine}</span>
            </label>
          ))}
        </div>
        
        {errors.cuisineTypes && (
          <p className="text-red-500 text-sm mt-2">{errors.cuisineTypes.message}</p>
        )}
      </div>

      {/* Opening Hours */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Opening Hours
        </h3>
        
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-24">
                <span className="text-sm font-medium capitalize">{day}</span>
              </div>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={openingHours?.[day]?.isOpen || false}
                  onChange={(e) => handleHoursChange(day, 'isOpen', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Open</span>
              </label>

              {openingHours?.[day]?.isOpen && (
                <>
                  <input
                    type="time"
                    value={openingHours[day]?.open || '09:00'}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm">to</span>
                  <input
                    type="time"
                    value={openingHours[day]?.close || '21:00'}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Bank Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name *
            </label>
            <input
              {...register('bankDetails.accountName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Account holder name"
            />
            {errors.bankDetails?.accountName && (
              <p className="text-red-500 text-sm mt-1">{errors.bankDetails.accountName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number *
            </label>
            <input
              {...register('bankDetails.accountNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Account number"
            />
            {errors.bankDetails?.accountNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.bankDetails.accountNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name *
            </label>
            <input
              {...register('bankDetails.bankName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bank name"
            />
            {errors.bankDetails?.bankName && (
              <p className="text-red-500 text-sm mt-1">{errors.bankDetails.bankName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Routing Number *
            </label>
            <input
              {...register('bankDetails.routingNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Routing number"
            />
            {errors.bankDetails?.routingNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.bankDetails.routingNumber.message}</p>
            )}
          </div>
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
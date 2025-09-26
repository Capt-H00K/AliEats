import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Save, 
  Loader2, 
  DollarSign, 
  Car, 
  CreditCard, 
  User,
  Plus,
  Trash2,
  Zap
} from 'lucide-react';

// Validation schema
const driverProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  vehicleInfo: z.object({
    make: z.string().min(1, 'Vehicle make is required'),
    model: z.string().min(1, 'Vehicle model is required'),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    color: z.string().min(1, 'Vehicle color is required'),
    licensePlate: z.string().min(1, 'License plate is required'),
  }),
  bankDetails: z.object({
    accountName: z.string().min(1, 'Account name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    bankName: z.string().min(1, 'Bank name is required'),
    routingNumber: z.string().min(1, 'Routing number is required'),
  }),
  customFees: z.object({
    deliveryFee: z.number().min(0, 'Delivery fee must be non-negative'),
    speedPointFee: z.number().min(0).optional(),
    additionalFees: z.array(z.object({
      name: z.string().min(1, 'Fee name is required'),
      amount: z.number().min(0, 'Fee amount must be non-negative'),
    })).optional(),
  }),
});

type DriverProfileFormData = z.infer<typeof driverProfileSchema>;

interface DriverProfileFormProps {
  initialData?: Partial<DriverProfileFormData>;
  onSubmit: (data: DriverProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

const VEHICLE_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus', 'Other'
];

const VEHICLE_COLORS = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow',
  'Orange', 'Purple', 'Brown', 'Gold', 'Other'
];

export const DriverProfileForm: React.FC<DriverProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue
  } = useForm<DriverProfileFormData>({
    resolver: zodResolver(driverProfileSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      licenseNumber: initialData?.licenseNumber || '',
      vehicleInfo: {
        make: initialData?.vehicleInfo?.make || '',
        model: initialData?.vehicleInfo?.model || '',
        year: initialData?.vehicleInfo?.year || new Date().getFullYear(),
        color: initialData?.vehicleInfo?.color || '',
        licensePlate: initialData?.vehicleInfo?.licensePlate || '',
      },
      bankDetails: {
        accountName: initialData?.bankDetails?.accountName || '',
        accountNumber: initialData?.bankDetails?.accountNumber || '',
        bankName: initialData?.bankDetails?.bankName || '',
        routingNumber: initialData?.bankDetails?.routingNumber || '',
      },
      customFees: {
        deliveryFee: initialData?.customFees?.deliveryFee || 3.99,
        speedPointFee: initialData?.customFees?.speedPointFee || 1.50,
        additionalFees: initialData?.customFees?.additionalFees || [],
      },
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customFees.additionalFees',
  });

  const handleFormSubmit = async (data: DriverProfileFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const addAdditionalFee = () => {
    append({ name: '', amount: 0 });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driver's License Number *
            </label>
            <input
              {...register('licenseNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter license number"
            />
            {errors.licenseNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.licenseNumber.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Car className="w-5 h-5 mr-2" />
          Vehicle Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Make *
            </label>
            <select
              {...register('vehicleInfo.make')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select make</option>
              {VEHICLE_MAKES.map((make) => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
            {errors.vehicleInfo?.make && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleInfo.make.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model *
            </label>
            <input
              {...register('vehicleInfo.model')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter model"
            />
            {errors.vehicleInfo?.model && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleInfo.model.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year *
            </label>
            <input
              {...register('vehicleInfo.year', { valueAsNumber: true })}
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2020"
            />
            {errors.vehicleInfo?.year && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleInfo.year.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <select
              {...register('vehicleInfo.color')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select color</option>
              {VEHICLE_COLORS.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            {errors.vehicleInfo?.color && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleInfo.color.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Plate *
            </label>
            <input
              {...register('vehicleInfo.licensePlate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABC123"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.vehicleInfo?.licensePlate && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleInfo.licensePlate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Bank Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Custom Fees */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Custom Delivery Fees
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Delivery Fee *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  {...register('customFees.deliveryFee', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="3.99"
                />
              </div>
              {errors.customFees?.deliveryFee && (
                <p className="text-red-500 text-sm mt-1">{errors.customFees.deliveryFee.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                SpeedPoint Fee
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  {...register('customFees.speedPointFee', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1.50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Extra fee for priority/fast delivery
              </p>
            </div>
          </div>

          {/* Additional Fees */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Additional Fees
              </label>
              <button
                type="button"
                onClick={addAdditionalFee}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Fee
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      {...register(`customFees.additionalFees.${index}.name`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Fee name (e.g., Night Delivery)"
                    />
                  </div>
                  <div className="w-32">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        {...register(`customFees.additionalFees.${index}.amount`, { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {fields.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No additional fees configured. Click "Add Fee" to create custom fees for specific conditions.
              </p>
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
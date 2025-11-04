'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, type FormData } from '@/lib/schema';

export default function Form() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleMonthCheckboxChange = (checked: boolean) => {
    if (checked) {
      const today = new Date();
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(today.getMonth() + 1);

      // Format dates as YYYY-MM-DD for date inputs
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setValue('start_date', formatDate(today));
      setValue('end_date', formatDate(oneMonthLater));
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Convert price to number
      const formData = {
        ...data,
        price: Number(data.price),
      };

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      let result: any = {};
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (parseError) {
        // If response is not JSON, use empty object
        result = {};
      }

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Form submitted successfully!',
        });
        reset();
      } else {
        // Safely extract error message - handle cases where message might be an object
        let errorMessage = 'Failed to submit form. Please try again.';
        
        if (result.message) {
          if (typeof result.message === 'string') {
            errorMessage = result.message;
          } else if (typeof result.message === 'object') {
            // If message is an object, try to extract a string from it
            errorMessage = result.message.message || JSON.stringify(result.message);
          }
        } else if (result.error) {
          errorMessage = typeof result.error === 'string' ? result.error : 'An error occurred';
        } else if (result.missing_fields) {
          // Handle missing_fields case
          const missing = Array.isArray(result.missing_fields) 
            ? result.missing_fields.join(', ')
            : String(result.missing_fields);
          errorMessage = `Missing required fields: ${missing}`;
        }
        
        setSubmitStatus({
          type: 'error',
          message: errorMessage,
        });
      }
    } catch (error: any) {
      // Handle any JSON parsing errors or network errors
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h1 className="form-title">Service Request Form</h1>
        
        {submitStatus.type && (
          <div
            className={`alert ${
              submitStatus.type === 'success' ? 'alert-success' : 'alert-error'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <span className="form-error">{errors.name.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <span className="form-error">{errors.phone.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="service" className="form-label">
              Service <span className="required">*</span>
            </label>
            <input
              type="text"
              id="service"
              {...register('service')}
              className={`form-input ${errors.service ? 'form-input-error' : ''}`}
              placeholder="Enter service name"
            />
            {errors.service && (
              <span className="form-error">{errors.service.message}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Price <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className={`form-input ${errors.price ? 'form-input-error' : ''}`}
                placeholder="0.00"
              />
              {errors.price && (
                <span className="form-error">{errors.price.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                onChange={(e) => handleMonthCheckboxChange(e.target.checked)}
                className="form-checkbox"
              />
              <span>Set to one month (starts today, ends in one month)</span>
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date" className="form-label">
                Start Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="start_date"
                {...register('start_date')}
                className={`form-input ${errors.start_date ? 'form-input-error' : ''}`}
              />
              {errors.start_date && (
                <span className="form-error">{errors.start_date.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="end_date" className="form-label">
                End Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="end_date"
                {...register('end_date')}
                className={`form-input ${errors.end_date ? 'form-input-error' : ''}`}
              />
              {errors.end_date && (
                <span className="form-error">{errors.end_date.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              className={`form-input form-textarea ${errors.notes ? 'form-input-error' : ''}`}
              placeholder="Additional notes (optional)"
              rows={4}
            />
            {errors.notes && (
              <span className="form-error">{errors.notes.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="form-button"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}


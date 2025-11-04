import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  notes: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  service: z.string().min(1, 'Service is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate >= startDate;
}, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});

export type FormData = z.infer<typeof formSchema>;


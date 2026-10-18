import { z } from 'zod';

const employeeShape = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  department: z.string().trim().min(2).max(60),
  role: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(25).regex(/^[+()\d.\-\s]+$/, 'Enter a valid phone number.'),
  location: z.string().trim().min(2).max(80),
  status: z.enum(['Active', 'On leave', 'Inactive']),
  joiningDate: z.coerce.date().max(new Date(), 'Joining date cannot be in the future.'),
};

export const employeeSchema = z.object(employeeShape).strict();
export const employeeUpdateSchema = employeeSchema.partial().strict();

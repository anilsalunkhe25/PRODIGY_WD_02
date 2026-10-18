import { Router } from 'express';
import Employee from '../models/Employee.js';
import { employeeSchema, employeeUpdateSchema } from '../schemas/employee.js';

const router = Router();

function sendValidationError(res, error) {
  return res.status(400).json({
    message: 'Please check the employee details and try again.',
    errors: error.issues.map((issue) => ({ field: issue.path[0], message: issue.message })),
  });
}

router.get('/', async (req, res, next) => {
  try {
    const { search = '', department, status } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (search) {
      const safeSearch = String(search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { role: { $regex: safeSearch, $options: 'i' } },
      ];
    }
    const employees = await Employee.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(employees);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  const parsed = employeeSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  try {
    const employee = await Employee.create(parsed.data);
    return res.status(201).json(employee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An employee with this email already exists.' });
    }
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  const parsed = employeeUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  if (Object.keys(parsed.data).length === 0) {
    return res.status(400).json({ message: 'At least one employee field is required.' });
  }

  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      { new: true, runValidators: true },
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    return res.json(employee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An employee with this email already exists.' });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid employee ID.' });
    }
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    return res.status(204).end();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid employee ID.' });
    }
    return next(error);
  }
});

export default router;

import test from 'node:test';
import assert from 'node:assert/strict';
import { employeeSchema, employeeUpdateSchema } from './employee.js';

const validEmployee = {
  name: 'Jamie Chen',
  email: 'jamie@example.com',
  department: 'Design',
  role: 'Product Designer',
  phone: '+1 555 012 3456',
  location: 'Brooklyn, NY',
  status: 'Active',
  joiningDate: '2024-03-11',
};

test('accepts a complete valid employee record', () => {
  assert.equal(employeeSchema.safeParse(validEmployee).success, true);
});

test('rejects malformed email, phone number, and status values', () => {
  const result = employeeSchema.safeParse({
    ...validEmployee,
    email: 'not-an-email',
    phone: 'call me',
    status: 'Pending',
  });
  assert.equal(result.success, false);
  assert.deepEqual(
    result.error.issues.map((issue) => issue.path[0]).sort(),
    ['email', 'phone', 'status'],
  );
});

test('rejects a future joining date', () => {
  const result = employeeSchema.safeParse({ ...validEmployee, joiningDate: '2999-01-01' });
  assert.equal(result.success, false);
  assert.equal(result.error.issues[0].path[0], 'joiningDate');
});

test('allows a valid partial update and rejects unknown fields', () => {
  assert.equal(employeeUpdateSchema.safeParse({ status: 'On leave' }).success, true);
  assert.equal(employeeUpdateSchema.safeParse({ isAdmin: true }).success, false);
});

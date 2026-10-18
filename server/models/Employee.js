import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    department: { type: String, required: true, trim: true, maxlength: 60 },
    role: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 25 },
    location: { type: String, required: true, trim: true, maxlength: 80 },
    status: { type: String, enum: ['Active', 'On leave', 'Inactive'], default: 'Active' },
    joiningDate: { type: Date, required: true },
  },
  { timestamps: true },
);

employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ name: 1, department: 1 });

export default mongoose.model('Employee', employeeSchema);

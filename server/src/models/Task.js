const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    dueDate: { type: Date, default: null },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ owner: 1, status: 1, dueDate: 1 });

taskSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // When `course` is populated, normalise the nested id too.
    if (ret.course && ret.course._id) {
      ret.course = { id: ret.course._id, name: ret.course.name, code: ret.course.code };
    }
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);

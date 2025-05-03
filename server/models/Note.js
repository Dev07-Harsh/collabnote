import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true },
  apiData: { type: mongoose.Schema.Types.Mixed },      // placeholder for attached third‑party API data
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
isShared:  { type: Boolean, default: false },
}, { timestamps: true });


noteSchema.index({ title: 'text', content: 'text' });
export default mongoose.model('Note', noteSchema);

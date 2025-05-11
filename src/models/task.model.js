import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    // Indicador de si el contenido está encriptado
    encrypted: {
      type: Boolean,
      default: true, // Por defecto encriptamos todos los campos
    },
    date: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('task', taskSchema);

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      trim: true, //Quitar espacios
    },
    email: {
      type: String,
      require: true,
      trim: true, //Quitar espacios
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('User', userSchema);

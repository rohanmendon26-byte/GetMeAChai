import mongoose from "mongoose";

const tierSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    benefits: {
      type: [String],
      default: [],
    },

    image: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Tier =
  mongoose.models.Tier ||
  mongoose.model("Tier", tierSchema);

export default Tier;
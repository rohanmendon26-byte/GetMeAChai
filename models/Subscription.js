import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    supporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tier",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: [
        "active",
        "cancelled",
        "expired",
        "pending",
      ],
      default: "pending",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    paymentId: {
      type: String,
      default: "",
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({
  supporter: 1,
  creator: 1,
});

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model(
    "Subscription",
    subscriptionSchema
  );

export default Subscription;
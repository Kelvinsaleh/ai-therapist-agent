import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planType: "free" | "monthly" | "annual";
  status: "active" | "inactive" | "cancelled" | "expired" | "pending";
  paystackSubscriptionId?: string;
  paystackCustomerId?: string;
  startDate: Date;
  endDate: Date;
  nextBillingDate?: Date;
  amount: number;
  currency: string;
  features: {
    unlimitedChat: boolean;
    premiumMeditations: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    rescuePairs: boolean;
    customThemes: boolean;
    exportData: boolean;
    crisisSupport: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  paystackReference: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "cancelled";
  paymentMethod: string;
  description: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planType: { 
      type: String, 
      enum: ["free", "monthly", "annual"], 
      default: "free" 
    },
    status: { 
      type: String, 
      enum: ["active", "inactive", "cancelled", "expired", "pending"], 
      default: "inactive" 
    },
    paystackSubscriptionId: { type: String },
    paystackCustomerId: { type: String },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    nextBillingDate: { type: Date },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    features: {
      unlimitedChat: { type: Boolean, default: false },
      premiumMeditations: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      rescuePairs: { type: Boolean, default: false },
      customThemes: { type: Boolean, default: false },
      exportData: { type: Boolean, default: false },
      crisisSupport: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription", required: true },
    paystackReference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    status: { 
      type: String, 
      enum: ["pending", "success", "failed", "cancelled"], 
      default: "pending" 
    },
    paymentMethod: { type: String, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);

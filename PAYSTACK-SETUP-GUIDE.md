# Paystack Subscription Billing Setup Guide

## 🎯 Overview
This guide will help you set up Paystack subscription billing using your backend's Paystack keys.

## 🔑 Backend Configuration Required

### 1. Environment Variables in Your Backend (.env)
Make sure your backend has these Paystack environment variables:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# Plan Codes (create these in your Paystack dashboard)
PAYSTACK_MONTHLY_PLAN_CODE=PLN_your_monthly_plan_code
PAYSTACK_ANNUAL_PLAN_CODE=PLN_your_annual_plan_code

# Webhook URL (for subscription events)
PAYSTACK_WEBHOOK_URL=https://your-backend-url.com/webhooks/paystack
```

### 2. Backend API Endpoint Required
Your backend should have this endpoint:
```
POST /payments/initialize
```

**Expected Request Body:**
```json
{
  "email": "user@example.com",
  "planId": "monthly",
  "planCode": "PLN_your_monthly_plan_code",
  "amount": 799, // in kobo/cents
  "currency": "USD",
  "userId": "user_id_here",
  "metadata": {
    "planName": "Monthly Plan",
    "interval": "monthly",
    "source": "frontend"
  },
  "callback_url": "https://your-frontend.com/payment/success"
}
```

**Expected Response:**
```json
{
  "success": true,
  "reference": "paystack_reference_here",
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "access_code_here",
  "message": "Payment initialized successfully"
}
```

## 🏗️ Frontend Configuration

### 1. Environment Variables (.env.local)
```bash
# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-url.com
BACKEND_API_URL=https://your-backend-url.com

# Payment Configuration (optional - mainly for display)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# Development settings
NODE_ENV=development
```

### 2. Plan Configuration
Update the plan codes in `lib/payments/paystack-service.ts`:

```typescript
getPlans(): PaymentPlan[] {
  return [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: 7.99,
      currency: 'USD',
      interval: 'monthly',
      paystackPlanCode: 'PLN_your_monthly_plan_code', // Update this
      features: [...]
    },
    {
      id: 'annually',
      name: 'Annual Plan',
      price: 89.99,
      currency: 'USD',
      interval: 'annually',
      paystackPlanCode: 'PLN_your_annual_plan_code', // Update this
      popular: true,
      savings: 6.89,
      features: [...]
    }
  ];
}
```

## 🔄 Payment Flow

### 1. User Initiates Payment
- User clicks "Upgrade to Premium" on pricing page
- Frontend calls `paystackService.initializePayment()`
- Frontend API route `/api/payments/initialize` forwards request to backend
- Backend uses your Paystack keys to create payment

### 2. Payment Processing
- Backend creates Paystack payment with your secret key
- Returns authorization URL to frontend
- User redirected to Paystack checkout
- After payment, user redirected to success page

### 3. Webhook Handling
- Paystack sends webhook to your backend
- Backend updates user subscription status
- Frontend can check subscription status via API

## 🧪 Testing

### 1. Test Cards (Paystack Test Mode)
```
Card Number: 4084084084084081
Expiry: Any future date
CVV: Any 3 digits
PIN: 1234
```

### 2. Test the Flow
1. Go to `/pricing` page
2. Click "Upgrade to Premium"
3. Enter test card details
4. Verify payment success

## 🚀 Production Setup

### 1. Switch to Live Keys
Update your backend environment variables:
```bash
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
```

### 2. Update Plan Codes
Create actual subscription plans in Paystack dashboard and update the plan codes.

### 3. Set Up Webhooks
Configure webhook URL in Paystack dashboard:
```
https://your-backend-url.com/webhooks/paystack
```

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid plan selected"**
   - Check if plan codes match between frontend and backend
   - Verify plan exists in Paystack dashboard

2. **"Payment initialization failed"**
   - Check backend logs for Paystack API errors
   - Verify secret key is correct
   - Check if backend endpoint `/payments/initialize` exists

3. **"Authorization failed"**
   - Verify user is logged in
   - Check if auth token is valid
   - Ensure backend accepts the authorization header

### Debug Steps:
1. Check browser console for frontend errors
2. Check backend logs for Paystack API responses
3. Verify environment variables are set correctly
4. Test with Paystack test cards first

## 📞 Support
- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com
- Test with Paystack test mode before going live

## ✅ Checklist
- [ ] Backend has Paystack secret key configured
- [ ] Backend has `/payments/initialize` endpoint
- [ ] Plan codes created in Paystack dashboard
- [ ] Frontend plan codes updated
- [ ] Webhook URL configured
- [ ] Test payment successful
- [ ] Production keys ready
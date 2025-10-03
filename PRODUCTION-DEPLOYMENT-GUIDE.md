# HOPE AI - Production Deployment Guide

## 🚀 Payment & Billing Production Setup

This guide will help you deploy HOPE AI with fully functional payment and billing capabilities to production.

### 📋 Prerequisites

1. **Paystack Account**: Sign up at [paystack.com](https://paystack.com)
2. **Backend API**: Your backend should be deployed and accessible
3. **Domain**: A custom domain for your application
4. **SSL Certificate**: HTTPS is required for payment processing

---

## 🔧 Environment Configuration

### 1. Create Production Environment File

Copy the `.env.local` file and update it with your production values:

```bash
cp .env.local .env.production
```

### 2. Required Environment Variables

#### Paystack Configuration
```env
# Get these from your Paystack dashboard
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key_here
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_from_paystack

# Plan codes (create these in Paystack dashboard)
PAYSTACK_MONTHLY_PLAN_CODE=PLN_monthly_plan_live
PAYSTACK_ANNUAL_PLAN_CODE=PLN_annual_plan_live
```

#### Backend Configuration
```env
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-domain.com
BACKEND_API_URL=https://your-backend-domain.com
```

#### Security
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret_key_here
JWT_SECRET=your_jwt_secret_key_here
WEBHOOK_SECRET_TOKEN=your_webhook_secret_token
```

---

## 💳 Paystack Setup

### 1. Create Paystack Account
1. Go to [paystack.com](https://paystack.com)
2. Sign up for an account
3. Complete business verification

### 2. Get API Keys
1. Go to Settings → API Keys & Webhooks
2. Copy your Live Public Key and Live Secret Key
3. Update your environment variables

### 3. Create Subscription Plans
1. Go to Settings → Plans
2. Create two plans:
   - **Monthly Plan**: $7.99/month
   - **Annual Plan**: $89.99/year
3. Copy the plan codes and update environment variables

### 4. Configure Webhooks
1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events:
   - `charge.success`
   - `subscription.create`
   - `subscription.disable`
   - `invoice.payment_failed`
4. Copy the webhook secret and update environment variables

---

## 🏗️ Backend Requirements

Your backend should implement these endpoints:

### Payment Endpoints
```
POST /payments/initialize
POST /payments/verify
POST /payments/subscription
GET /payments/subscription/status
POST /payments/subscription/cancel
```

### Webhook Endpoints
```
POST /payments/webhook/success
POST /payments/webhook/subscription
POST /payments/webhook/disable
POST /payments/webhook/failure
```

### User Management
```
POST /users/update-tier
GET /users/subscription-status
```

---

## 🚀 Deployment Steps

### 1. Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
vercel env add PAYSTACK_SECRET_KEY
vercel env add PAYSTACK_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_BACKEND_API_URL
vercel env add NEXTAUTH_SECRET
vercel env add JWT_SECRET
vercel env add WEBHOOK_SECRET_TOKEN
```

### 2. Deploy Backend

Ensure your backend is deployed and accessible at the URL specified in `BACKEND_API_URL`.

### 3. Configure Domain

1. Point your domain to your Vercel deployment
2. Ensure SSL certificate is active
3. Update `NEXTAUTH_URL` with your domain

---

## 🔒 Security Checklist

### ✅ Environment Variables
- [ ] All sensitive keys are in environment variables
- [ ] No hardcoded secrets in code
- [ ] Different keys for development and production

### ✅ HTTPS
- [ ] SSL certificate is active
- [ ] All payment flows use HTTPS
- [ ] Webhook URLs use HTTPS

### ✅ Webhook Security
- [ ] Webhook signature verification is enabled
- [ ] Webhook secret is properly configured
- [ ] Webhook endpoints are protected

### ✅ Input Validation
- [ ] Email validation on payment forms
- [ ] Amount validation
- [ ] Reference validation
- [ ] User ID validation

---

## 🧪 Testing

### 1. Test Payment Flow
1. Use Paystack test mode first
2. Test with test card numbers
3. Verify webhook delivery
4. Test payment success/failure scenarios

### 2. Test Webhooks
1. Use Paystack webhook testing tool
2. Verify signature validation
3. Test all webhook events
4. Verify database updates

### 3. Test User Experience
1. Complete payment flow
2. Verify subscription activation
3. Test subscription management
4. Test billing history

---

## 📊 Monitoring

### 1. Payment Monitoring
- Monitor payment success rates
- Track failed payments
- Monitor webhook delivery
- Track subscription activations

### 2. Error Tracking
- Set up Sentry for error tracking
- Monitor payment errors
- Track webhook failures
- Monitor API response times

### 3. Analytics
- Track conversion rates
- Monitor subscription metrics
- Track user engagement
- Monitor revenue metrics

---

## 🚨 Troubleshooting

### Common Issues

#### Payment Initialization Fails
- Check Paystack API keys
- Verify backend API is accessible
- Check network connectivity
- Verify plan codes

#### Webhook Not Receiving Events
- Check webhook URL is accessible
- Verify webhook secret
- Check Paystack webhook configuration
- Monitor webhook delivery logs

#### Subscription Not Activating
- Check webhook processing
- Verify database updates
- Check user tier update logic
- Monitor error logs

---

## 📞 Support

### Paystack Support
- Documentation: [paystack.com/docs](https://paystack.com/docs)
- Support: [paystack.com/support](https://paystack.com/support)

### HOPE AI Support
- Email: support@hope-ai.com
- Documentation: [your-docs-url.com](https://your-docs-url.com)

---

## 🔄 Maintenance

### Regular Tasks
- Monitor payment success rates
- Update dependencies
- Review security logs
- Backup subscription data
- Monitor webhook delivery

### Monthly Tasks
- Review payment analytics
- Update security measures
- Review user feedback
- Optimize payment flow
- Update documentation

---

## 📈 Scaling

### Performance Optimization
- Implement caching for subscription status
- Optimize database queries
- Use CDN for static assets
- Implement rate limiting

### Feature Enhancements
- Add more payment methods
- Implement subscription tiers
- Add billing analytics
- Implement refund handling
- Add invoice generation

---

## 🎯 Success Metrics

### Key Performance Indicators
- Payment success rate > 95%
- Webhook delivery rate > 99%
- Subscription activation time < 30 seconds
- User satisfaction score > 4.5/5
- Revenue growth month-over-month

### Monitoring Dashboard
- Real-time payment metrics
- Subscription status overview
- Error rate monitoring
- User engagement metrics
- Revenue tracking

---

**🎉 Congratulations!** Your HOPE AI application is now ready for production with fully functional payment and billing capabilities.

For additional support or questions, please contact the development team.
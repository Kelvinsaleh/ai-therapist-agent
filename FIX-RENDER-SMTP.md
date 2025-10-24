# 🔴 Fix Render SMTP Connection Timeout

## Problem

Your logs show:
```
Error: Connection timeout
ETIMEDOUT to smtp.gmail.com:587
```

**Root Cause:** Render blocks outgoing SMTP connections on port 587 (standard port) to prevent spam.

---

## ✅ Solutions (Choose One)

### Solution 1: Use Gmail Port 465 (SSL) - Quick Fix

Update your Render environment variables:

**Go to:** https://dashboard.render.com → Your service → Environment

**Change:**
```
EMAIL_PORT=587
```

**To:**
```
EMAIL_PORT=465
```

**Save and redeploy.** This uses SSL which Render allows.

---

### Solution 2: Use SendGrid (Recommended for Production) ⭐

SendGrid is free (100 emails/day) and works reliably on Render.

#### Step 1: Sign Up for SendGrid
1. Go to: https://signup.sendgrid.com
2. Create free account
3. Verify your email

#### Step 2: Generate API Key
1. Go to: https://app.sendgrid.com/settings/api_keys
2. Click "Create API Key"
3. Name it "Hope Therapy Backend"
4. Copy the API key (save it securely!)

#### Step 3: Update Render Environment Variables

**Replace** your EMAIL_* variables with:
```
EMAIL_USER=apikey
EMAIL_PASSWORD=<your-sendgrid-api-key>
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
```

**Important:** 
- EMAIL_USER is literally the word `apikey` (not your email!)
- EMAIL_PASSWORD is your SendGrid API key

#### Step 4: Verify Sender Email (SendGrid Requirement)
1. Go to: https://app.sendgrid.com/settings/sender_auth
2. Click "Verify a Single Sender"
3. Add your email (knsalee@gmail.com)
4. Check your email and click verification link

#### Step 5: Save and Redeploy
- Save changes in Render
- Wait for auto-redeploy
- Test registration

---

## Quick Comparison

| Method | Pros | Cons | Reliability |
|--------|------|------|-------------|
| Gmail Port 465 | Quick, no signup | May still have issues | Medium |
| SendGrid | Very reliable, free tier | Requires signup | ⭐ High |

---

## Testing After Fix

1. **Register new account** from your frontend
2. **Check logs** in Render - should see:
   ```
   ✅ Email sent successfully to user@example.com
   ```
3. **Check user's inbox** - OTP email should arrive
4. **If using SendGrid** - check SendGrid dashboard for delivery stats

---

## 🚀 My Recommendation

**Use Solution 2 (SendGrid)** because:
- ✅ Designed for transactional emails
- ✅ 100 free emails/day (plenty for your app)
- ✅ Works reliably on all hosting platforms
- ✅ Better deliverability (won't go to spam)
- ✅ Email analytics dashboard
- ✅ No port blocking issues

---

## Alternative: Mailgun, AWS SES, Postmark

If SendGrid doesn't work, these are also good:
- **Mailgun:** Free 5,000 emails/month (first 3 months)
- **AWS SES:** Pay-as-you-go, very cheap
- **Postmark:** Free 100 emails/month

All use SMTP and work with Render.

---

## Current Status

**What's working:**
- ✅ Email service code is correct
- ✅ Gmail credentials are valid
- ✅ Service is running

**What's blocked:**
- ❌ Render blocks port 587 to Gmail
- ❌ Emails timing out, not sending

**After fix:**
- ✅ Emails will send successfully
- ✅ OTP verification will work
- ✅ Welcome emails will send

---

## Need Help?

1. **Can't sign up for SendGrid?** → Try Gmail port 465
2. **Port 465 still times out?** → Must use SendGrid or similar
3. **SendGrid API key not working?** → Check you used `apikey` as EMAIL_USER
4. **Email not verified in SendGrid?** → Check your inbox and verify sender

---

**Recommended:** Use SendGrid (5 minutes to set up, works forever)


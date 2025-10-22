# API Setup Instructions

A.R.I.S.E uses **FREE APIs** for meeting transcription and analysis:
- **AssemblyAI** for audio transcription (FREE: 5 hours/month)
- **Groq** for meeting analysis (FREE with rate limits)

---

## 1. AssemblyAI API Key Setup (Transcription)

### Steps to get your FREE AssemblyAI API Key:

1. **Create an AssemblyAI Account**
   - Go to [https://www.assemblyai.com/dashboard/signup](https://www.assemblyai.com/dashboard/signup)
   - Sign up with your email or use Google/GitHub account
   - **No credit card required!**

2. **Get Your API Key**
   - After signing up, you'll be taken to your dashboard
   - Your API key will be displayed immediately
   - Or go to [https://www.assemblyai.com/app/account](https://www.assemblyai.com/app/account)
   - Copy the API key (starts with a long string of characters)

3. **Add Key to Your Project**
   - Open the `.env.local` file in your project root
   - Replace `your_assemblyai_api_key_here` with your actual API key:
   ```
   ASSEMBLYAI_API_KEY=your_actual_key_here
   ```
   - Save the file

### Free Tier Limits
- ✅ **5 hours of transcription per month** (FREE forever)
- ✅ No credit card required
- ✅ High-quality transcription
- ✅ Perfect for personal/small business use

---

## 2. Groq API Key Setup (Analysis)

### Steps to get your FREE Groq API Key:

1. **Create a Groq Account**
   - Go to [https://console.groq.com/](https://console.groq.com/)
   - Sign up with your email or use Google/GitHub account
   - **No credit card required!**

2. **Create API Key**
   - Go to [https://console.groq.com/keys](https://console.groq.com/keys)
   - Click "Create API Key"
   - Give it a name (e.g., "ARISE-App")
   - Copy the key immediately (starts with `gsk_`)

3. **Add Key to Your Project**
   - Open the `.env.local` file in your project root
   - Replace `your_groq_api_key_here` with your actual API key:
   ```
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
   ```
   - Save the file

### Free Tier Limits
- ✅ **Completely FREE** with generous rate limits
- ✅ Uses Llama 3.3 70B model (very powerful)
- ✅ Super fast inference
- ✅ No credit card required

---

## 3. Restart Your Server

After adding both API keys:
```bash
# Stop your server (Ctrl+C)
# Then restart:
pnpm dev
```

---

## Your Final .env.local File Should Look Like:

```bash
# AssemblyAI API Key (FREE - 5 hours/month)
ASSEMBLYAI_API_KEY=your_actual_assemblyai_key_here

# Groq API Key (FREE with rate limits)
GROQ_API_KEY=gsk_your_actual_groq_key_here
```

---

## Important Security Notes

- ⚠️ **Never commit your API keys to Git!** The `.env.local` file is already in `.gitignore`
-  Keep your API keys secure and don't share them publicly
- ✅ Both services are FREE and don't require credit cards

---

## Troubleshooting

**"Error: ASSEMBLYAI_API_KEY is not defined"**
- Make sure you've added the key to `.env.local`
- Restart your development server after adding the key
- Check for typos in the key

**"Error: GROQ_API_KEY is not defined"**
- Same as above - check `.env.local` and restart server

**Transcription takes a long time**
- AssemblyAI typically takes 15-30% of the audio duration
- Example: 10-minute audio = ~2-3 minutes processing time

**Rate limit errors**
- Groq has generous rate limits, but if you hit them, wait a minute and try again
- AssemblyAI allows concurrent transcriptions

---

## Need Help?

- **AssemblyAI Docs**: [https://www.assemblyai.com/docs](https://www.assemblyai.com/docs)
- **Groq Docs**: [https://console.groq.com/docs](https://console.groq.com/docs)

---

## Summary: Why These APIs?

| Feature | AssemblyAI | Groq |
|---------|-----------|------|
| **Cost** | FREE (5 hrs/month) | FREE |
| **Quality** | High-quality transcription | Llama 3.3 70B (excellent) |
| **Speed** | ~20-30% of audio length | Super fast |
| **Credit Card** | Not required | Not required |
| **Perfect For** | Meeting transcription | Meeting analysis |

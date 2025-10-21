# API Setup Instructions

## OpenAI API Key Setup

A.R.I.S.E uses OpenAI's Whisper API for transcription and GPT-4 for meeting analysis.

### Steps to get your OpenAI API Key:

1. **Create an OpenAI Account**
   - Go to [https://platform.openai.com/signup](https://platform.openai.com/signup)
   - Sign up with your email or use Google/Microsoft account

2. **Add Payment Method**
   - Go to [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
   - Add a payment method (required for API access)
   - You can set usage limits to control costs

3. **Create API Key**
   - Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Give it a name (e.g., "ARISE-App")
   - Copy the key immediately (you won't be able to see it again!)

4. **Add Key to Your Project**
   - Open the `.env.local` file in your project root
   - Replace `your_openai_api_key_here` with your actual API key:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```
   - Save the file
   - Restart your development server

### Costs

OpenAI charges based on usage:
- **Whisper API**: ~$0.006 per minute of audio
- **GPT-4 Turbo**: ~$0.01 per 1K tokens (approximately 750 words)

Example: A 10-minute meeting would cost approximately:
- Transcription: $0.06
- Analysis: $0.02-0.05
- **Total: ~$0.08-0.11 per meeting**

### Important Notes

- ⚠️ **Never commit your API key to Git!** The `.env.local` file is already in `.gitignore`
- 💰 Set up usage limits in your OpenAI account to prevent unexpected charges
- 🔒 Keep your API key secure and don't share it publicly
- 📊 Monitor your usage at [https://platform.openai.com/usage](https://platform.openai.com/usage)

### Troubleshooting

**"Error: OPENAI_API_KEY is not defined"**
- Make sure you've added the key to `.env.local`
- Restart your development server after adding the key

**"Invalid API key"**
- Check that you copied the entire key correctly
- Make sure there are no extra spaces
- Verify the key is active in your OpenAI dashboard

**"Insufficient quota"**
- Add a payment method to your OpenAI account
- Check your usage limits

### Need Help?

- OpenAI Documentation: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- API Reference: [https://platform.openai.com/docs/api-reference](https://platform.openai.com/docs/api-reference)

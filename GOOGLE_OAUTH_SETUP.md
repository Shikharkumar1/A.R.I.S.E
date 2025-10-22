# Setting Up Google OAuth for A.R.I.S.E

## Quick Setup Guide (5 minutes)

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Create a New Project (if you don't have one)
1. Click on the project dropdown at the top
2. Click "New Project"
3. Name it "A.R.I.S.E" or any name you prefer
4. Click "Create"

### Step 3: Enable Google+ API
1. In the left sidebar, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### Step 4: Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "OAuth client ID"
4. If prompted, configure the OAuth consent screen first:
   - Choose "External"
   - Fill in:
     - App name: A.R.I.S.E
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Skip "Scopes" (click "Save and Continue")
   - Skip "Test users" (click "Save and Continue")
   - Click "Back to Dashboard"

5. Now create the OAuth client ID:
   - Go back to "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "A.R.I.S.E Web Client"
   - Authorized JavaScript origins:
     - Add: `http://localhost:3000`
   - Authorized redirect URIs:
     - Add: `http://localhost:3000/api/auth/callback/google`
   - Click "Create"

6. **IMPORTANT**: Copy the Client ID and Client Secret that appear

### Step 5: Update Your .env.local File
1. Open your `.env.local` file in VS Code
2. Replace the placeholder values:
   ```
   GOOGLE_CLIENT_ID=your-actual-client-id-here
   GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
   ```
3. Save the file

### Step 6: Generate AUTH_SECRET
1. Open a terminal (PowerShell)
2. Run this command to generate a random secret:
   ```powershell
   [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
   ```
3. Copy the output
4. In `.env.local`, replace `your-super-secret-key-here-change-this-in-production` with the generated value

### Step 7: Restart the Server
1. Stop the dev server (Ctrl+C in the terminal)
2. Start it again: `pnpm dev`
3. Open `http://localhost:3000`

## Testing Authentication
1. Go to `http://localhost:3000`
2. Click "Try It Now" or "Get Started"
3. You'll be redirected to the sign-in page
4. Click "Continue with Google"
5. Sign in with your Google account
6. You'll be redirected back to the dashboard!

## What's Changed?
- ✅ Sign-in page at `/signin`
- ✅ Dashboard is now protected (requires login)
- ✅ Sign-out button in dashboard header
- ✅ User's name/email displayed in header
- ✅ Automatic redirect to dashboard after login
- ✅ Automatic redirect to sign-in if not logged in

## Troubleshooting
- **"Invalid Client"**: Check your Client ID and Secret are correct in `.env.local`
- **"Redirect URI mismatch"**: Make sure you added `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
- **Server not restarting**: Manually stop (Ctrl+C) and run `pnpm dev` again

## Next Steps (Optional)
- Add more OAuth providers (GitHub, Microsoft, etc.)
- Add user profile page
- Store user meetings in database with user ID
- Add team collaboration features

# AliEats Deployment Guide

## Firebase App Hosting Deployment

### Prerequisites

1. **Firebase CLI**: Install the Firebase CLI
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Ensure you have a Firebase project set up
   - Project ID: `flavorfleet-a9b09`

3. **Database**: Set up a PostgreSQL database (Neon, Supabase, or similar)

### Environment Variables Setup

Before deploying, you need to set up the following secrets in Firebase:

#### Firebase Service Account Variables
```bash
firebase apphosting:secrets:set FIREBASE_PROJECT_ID --data-file <(echo "flavorfleet-a9b09")
firebase apphosting:secrets:set FIREBASE_PRIVATE_KEY_ID --data-file <(echo "d7c6912df4ddd0bdaa647fb8e9a10871ace82d9a")
firebase apphosting:secrets:set FIREBASE_PRIVATE_KEY --data-file <(echo "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDA56H28N8hvnYr\nfIsckki2yUQOIQV7AKuR3AM6oV1tcPNNvXLwA2VSzwyMVvgP7T1RNVKfoHQe0q+9\nKMIbuF1RyJDNH+fBQD4qQxVloysGGdN2nrofT0CWNVjVt1M2c+h4FcvLTTa7O3uY\neoMQMdO7P7Gl+hFFL/Msj363tPWTKEh0F7Ua2J1ofL1IogYXgid5ixM3bEAeCDME\nm+gCbvjM2GsRAB4BcyXXIssrN5p8ZgqsA8XJJ34/NpYTTREwbQtZ/dpHp1Sd7ytg\nE3m+oqNPM7Paix60UOl/xninTNW9Ex3beFYWGL+W0oDmlNx72XRdgvXGYDcBY6Or\nU4f7W/W7AgMBAAECggEAGDN3MGHbvIIGlUIUucrocHYjoZom892LqMrvZMWl0Psg\nqxofd1kVtyPesSSgDm93B98mtHwO1WcdQSAB6jRhEMeW0wUzsBz9L5Qm9Q9ZcHSB\nARq8wvzQX4fl0zoiqGw2OAqT/Ld9LFQ0F1cXZkq6A33kLayHyiRP38FI5oc/X+yw\nAW/wRJNWnNPQRU+KRyx14gPTihlpvUFGu4hC5aDJ3qSPtEBGjxYQ3BRHUdT0DoUu\n+yQ3vpJ7iegeN6qPSzhgn6/fRqPOCoFoNxYbPjr8bihLaHB7hfXUGuykPQARBtVQ\nldY3iME+02NpvqUZz/prTFrWbBodoMaSOAXkGwm9QQKBgQDrCffBGFxv2rqBlBcL\nbyAABHlmiTZn+d5/M9B2tUKSzBSwm8Jl3enUuu0RFtpNlXcWxHKNq+dcUwnk/Fhc\nKtVfKakldrbkclmYkVHYJtOEHnmc2I94BhlziD0ic1dMVlc/34UMKzYXMv+8U6YE\nN+z8WacygJiHtjvybpGTkwtzawKBgQDSG7nmC3bo/LbNor0u4bZ/7lJToklnGMw7\nixTZDMtFFC4T+tCn59xDx4v+A8qnRmuDHrPwehdHVfw9hQdL6eRFn/gT86c/VuFl\n9NtW2y4g1glQNntPTJgqx//tuMaVNHhCBPRt4WVRQHIGNPAzVenAWdoOp5eudM8M\nYo2ka95q8QKBgQCgfx3/bXMxrlrNQSK7XBat7GA59FiCh823btpbNUtQkqtOLg6B\nIRgbe8mGceSANiAsG9ldhJVoJgwLoYV06orpgLlQK9CYDr2/wPvybhDhly3UPM07\nWG7oxY95humF5y+NHkTsGlXFYb3gC/7Bwq7BYzcY9Vcy1O36jiY6b57SIQKBgHJ4\nvK3DLUP++7HJqnzyaLYGqD/8uTU8Y3lFa1ReDhlSx1AHZMs2HeGnxHPeqPi9+zFy\n9uJcAnbROB5kbfdENSRh5Y0pQMPXl/Iul5oYzGcDdguHw2MO/hDA6oUgGMGN1r9R\nZ8K9/K9qBzWufffaJQKxcYZudMuNxIig4T7lrkZhAoGAaZnA1Mbas5oSEo6IPUFZ\nrs2J6occEi9qqQP5ToAHhpyGjC2P+wPx0MEPakL8T1rpXSSZgWR2gAP3kbSRbZr2\n9Fg0mx1wEtW2X0U9GWxxS+WPYEvnXRds62D1H/s4nDxyq92XnXao1u5Ed+gRHSAz\nEbK57QJUhzGFxVbU1fRm0KY=\n-----END PRIVATE KEY-----")
firebase apphosting:secrets:set FIREBASE_CLIENT_EMAIL --data-file <(echo "firebase-adminsdk-fbsvc@flavorfleet-a9b09.iam.gserviceaccount.com")
firebase apphosting:secrets:set FIREBASE_CLIENT_ID --data-file <(echo "106723595597808469955")
firebase apphosting:secrets:set FIREBASE_AUTH_URI --data-file <(echo "https://accounts.google.com/o/oauth2/auth")
firebase apphosting:secrets:set FIREBASE_TOKEN_URI --data-file <(echo "https://oauth2.googleapis.com/token")
firebase apphosting:secrets:set FIREBASE_AUTH_PROVIDER_X509_CERT_URL --data-file <(echo "https://www.googleapis.com/oauth2/v1/certs")
firebase apphosting:secrets:set FIREBASE_CLIENT_X509_CERT_URL --data-file <(echo "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40flavorfleet-a9b09.iam.gserviceaccount.com")
firebase apphosting:secrets:set FIREBASE_UNIVERSE_DOMAIN --data-file <(echo "googleapis.com")
firebase apphosting:secrets:set FIREBASE_STORAGE_BUCKET --data-file <(echo "flavorfleet-a9b09.appspot.com")
```

#### Database Configuration
```bash
firebase apphosting:secrets:set DATABASE_URL --data-file <(echo "your_postgresql_database_url_here")
```

### Deployment Steps

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Initialize Firebase (if not already done)**
   ```bash
   firebase init
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Deploy to Firebase App Hosting**
   ```bash
   firebase deploy --only apphosting
   ```

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase service account details
   - Add your database URL

3. **Run development server**
   ```bash
   npm run dev
   ```

### Production Considerations

1. **Database**: Ensure your PostgreSQL database is properly configured and accessible
2. **Environment Variables**: All sensitive data should be stored as Firebase secrets
3. **CORS**: The application is configured to handle CORS for production
4. **Error Handling**: Production error handling is in place
5. **Health Checks**: Available at `/health` endpoint
6. **Security Headers**: Security headers are configured

### Troubleshooting

1. **Build Errors**: Ensure all dependencies are installed and environment variables are set
2. **Database Connection**: Verify DATABASE_URL is correct and database is accessible
3. **Firebase Permissions**: Ensure service account has proper permissions
4. **Secrets**: Verify all Firebase secrets are properly set

### Monitoring

- Health check endpoint: `https://your-app-url/health`
- Firebase Console: Monitor logs and performance
- Error tracking: Check Firebase Functions logs for any issues

### Security Notes

- Never commit `.env` files to version control
- Use Firebase secrets for all sensitive configuration
- Regularly rotate service account keys
- Monitor access logs for suspicious activity
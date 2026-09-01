# FCAHPT Vom Academic Portal

Centralized Web Portal for Automated Academic Guidance and Progress Tracking for the Federal College of Animal Health and Production Technology, Vom.

## Tech Stack
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Backend/DB: Firebase (Firestore, Auth)
- State Management: Zustand
- Charts: Recharts
- Icons: Lucide React

## Setup Instructions

1. **Install Dependencies**
   Run the following commands in the project directory:
   ```bash
   npm install
   ```

2. **Firebase Configuration**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project and add a Web App to it.
   - Enable **Firestore Database** and **Authentication** (Email/Password).
   - Copy your Firebase config and create a `.env.local` file in the root directory of this project:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

3. **Deploy Firestore Rules**
   You can either deploy the rules via Firebase CLI or manually copy the contents of `firestore.rules` into the Rules tab of your Firestore Database in the console.

4. **Seed the Database**
   Update the `seed.js` file with your actual Firebase config (for a local script run), then run:
   ```bash
   npm run seed
   ```
   *(Note: For the seed script to write to Firestore, you might need to temporarily set your Firestore rules to allow read/write or use a service account with Firebase Admin SDK).*

5. **Run the App Locally**
   ```bash
   npm run dev
   ```

## Key Features Implemented

- **Responsive Landing Page**: Polished homepage with a hero section, features list, and clear CTAs.
- **Role-based Authentication**: Students register via the app; roles are managed in Firestore.
- **Automated CGPA Calculation**: Computes live CGPA based on passed courses.
- **Real-Time Degree Audit**: Tracks % completion against the required curriculum credits.
- **Smart Course Recommendations**: Rule-based engine that recommends unpassed courses, prioritizes carryovers, and checks prerequisites.
- **At-Risk Flagging**: Alerts if CGPA < 2.0 or 2+ carryovers exist.

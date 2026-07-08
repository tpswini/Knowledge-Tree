#  Knowledge Tree

Knowledge Tree is a modern, gamified full-stack web application designed to help lifelong learners organize their thoughts, track their goals, and build a "forest" of knowledge over time.

##  Features

- **Gamified Learning**: Earn XP, level up (from Seed to Mighty Oak), and maintain daily streaks to stay motivated.
- **Secure Authentication**: Robust user authentication featuring JWTs and a modern 6-digit OTP email verification system.
- **Knowledge Cards**: Create, categorize, and review bite-sized information cards. Features a beautiful read-only modal for studying.
- **Journaling**: Maintain a personal daily journal to reflect on your learning journey.
- **Goal Tracking**: Set, track, and complete long-term goals.
- **Admin Dashboard**: Comprehensive admin panel to manage users and view platform statistics.
- **Beautiful UI/UX**: Fully responsive, dynamic interface featuring dark mode, micro-animations, glassmorphism, and a curated emerald color palette.

## ️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (Styling & Animations)
- Lucide React (Icons)
- React Router DOM (Navigation)
- Axios (API Requests)

**Backend:**
- Node.js & Express.js
- Prisma ORM
- MySQL (TiDB Cloud)
- JSON Web Tokens (JWT) & bcrypt
- Google Apps Script Webhook (Email Delivery)

##  Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
- Node.js (v16 or higher)
- MySQL database (or TiDB Cloud account)
- A Google Account (for the Email Webhook)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tpswini/Knowledge-Tree.git
   cd Knowledge-Tree
   ```

2. **Setup the Backend**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add the following variables:
   ```env
   PORT=5000
   DATABASE_URL="mysql://username:password@host:port/knowledge_tree"
   JWT_SECRET="your_super_secret_jwt_key"
   GMAIL_WEBHOOK_URL="your_google_apps_script_webhook_url"
   ```
   Run database migrations:
   ```bash
   npx prisma db push
   ```

3. **Setup the Frontend**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```

### Running the App Locally

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

##  Setting up the Email Webhook

Knowledge Tree uses a Google Apps Script Webhook to bypass strict SMTP server blocks (like those on Render) to send OTP verification emails reliably and for free.

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project and paste the webhook script.
3. Deploy as a Web App (Execute as: Me, Who has access: Anyone).
4. Copy the deployment URL and paste it into your server's `.env` file as `GMAIL_WEBHOOK_URL`.

##  Deployment

- **Frontend**: Optimized for deployment on platforms like Vercel or Netlify.
- **Backend**: Optimized for deployment on platforms like Render or Heroku.
- **Database**: Cloud MySQL (e.g., TiDB Serverless).

*(Note: When deploying, remember to update the CORS origins in the backend and the `VITE_API_URL` in the frontend).*

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

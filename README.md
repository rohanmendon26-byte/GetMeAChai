# ☕ GetMeAChai — Creator Crowdfunding & Membership Platform

GetMeAChai is a modern, full-stack creator crowdfunding and subscription platform inspired by Patreon and BuyMeACoffee, tailored for Indian creators with **Razorpay (UPI, Cards, NetBanking)** integration.

---

## 🌟 Key Features

### For Creators
- **Custom Profile**: Setup banner, avatar, biography, social links, and monthly funding goals.
- **Support Tiers**: Create multi-level monthly membership tiers with custom pricing and perks.
- **Exclusive Content Gating**: Publish public or supporters-only posts with tier-based permission gating.
- **Interactive Discussions**: Community comments and discussions on creator posts.
- **Analytics & Dashboard**: Track gross revenue, active supporter counts, payout history, and goal completion rates.
- **Instant Notifications**: Real-time alerts for new supporters, received payments, and post comments.

### For Supporters
- **Discover Creators**: Explore creators with keyword search and category filters (Developers, Designers, Writers, Musicians, etc.).
- **Seamless Checkout**: Join membership tiers or send chai contributions via Razorpay UPI and cards.
- **Supporter Dashboard**: Manage active creator subscriptions, upgrade or change tiers, and download payment receipts.
- **Exclusive Feed**: Access locked articles, updates, and behind-the-scenes content unlocked by active subscriptions.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS & Lucide Icons
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js (Google OAuth, GitHub OAuth, and Credentials)
- **Payments**: Razorpay Node SDK & Checkout JS (Server-verified HMAC SHA256 signatures)
- **Deployment**: Vercel & MongoDB Atlas

---

## 🏗️ Architecture & Database Models

```
getmeachai/
├── app/
│   ├── [username]/           # Public creator profile & tiered support view
│   ├── about/                # Platform story, feature breakdown & FAQ
│   ├── api/
│   │   ├── auth/             # NextAuth route handlers & registration
│   │   ├── creator/          # Stats, profile settings, tiers, and earnings
│   │   ├── explore/          # Creator discovery & search API
│   │   ├── notifications/    # User notification dispatch & read status
│   │   ├── payments/         # Razorpay order generation & signature verification
│   │   ├── posts/            # CRUD post operations & comment endpoints
│   │   └── subscriptions/    # Active subscription tracking & tier updates
│   ├── creator/              # Creator dashboard, posts, tiers & payments
│   ├── dashboard/            # Supporter dashboard & payment receipt history
│   ├── explore/              # Creator discovery & category filters
│   ├── forgot-password/      # Password recovery page
│   ├── login/ & register/    # Authentication pages
│   └── verify-email/         # Email verification notice
├── components/               # Navbar, NotificationDropdown, CreatorCards, Comments
├── lib/                      # MongoDB, NextAuth, and Razorpay client singletons
└── models/                   # User, Tier, Post, Subscription, Payment, Notification, Comment
```

### Database Models Overview
1. **`User`**: Profiles, credentials, avatar, cover image, bio, roles (`creator`, `supporter`, `admin`), social links.
2. **`Tier`**: Membership tiers, prices, perks, order, and status.
3. **`Post`**: Content posts, images, visibility (`public` / `supporters`), and target tier requirement.
4. **`Subscription`**: Active/cancelled recurring memberships linking supporters to creators and tiers.
5. **`Payment`**: Audit log of Razorpay orders, payment IDs, amounts, and transaction statuses.
6. **`Notification`**: Activity alerts for payments, new supporters, posts, and comments.
7. **`Comment`**: Community feedback and replies on creator posts.

---

## 💳 Payment Flow & Security

1. **Order Creation**: Client requests an order for a selected tier. Server creates a Razorpay order with the tier price retrieved directly from MongoDB.
2. **Checkout**: Razorpay modal opens on the client for UPI/Card processing.
3. **Signature Verification**: Server verifies the cryptographic HMAC signature (`crypto.createHmac('sha256')`) using `RAZORPAY_KEY_SECRET`.
4. **Fulfillment**: Activates the subscription, logs the payment record, and sends a notification to the creator.

---

## 🚀 Getting Started

### 1. Clone the repository & install dependencies:
```bash
git clone https://github.com/your-username/getmeachai.git
cd getmeachai
npm install
```

### 2. Configure Environment Variables:
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

### 3. Run development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Production Build & Linting

```bash
npm run lint    # ESLint code verification (0 errors)
npm run build   # Production bundle compilation
npm start       # Start production server
```

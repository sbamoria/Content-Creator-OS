# MonetizeFlow - Creator Monetization Platform

> Full-stack AI-powered platform for content creators to manage their entire monetization funnel - from lead generation to conversion.

## 🎯 Overview

MonetizeFlow helps content creators transform their audience into revenue through an intelligent, automated sales funnel. The platform uses AI (Claude Sonnet 4.5) to generate lead capture forms, classify lead intent, and provide actionable insights to optimize conversions.

## ✨ Key Features

### 1. **AI Landing Page Builder**
- Input course details (name, description, instructor, target audience, price)
- AI automatically generates custom lead capture forms tailored to your course
- Get a shareable public URL for lead collection
- **AI Integration**: Claude Sonnet 4.5 analyzes course details to create optimized form fields

### 2. **Intelligent Lead Classification**
- AI-powered intent scoring (High/Medium/Low)
- Automatic classification based on lead responses (budget, timeline, goals, experience)
- Visual filtering and segmentation
- **AI Integration**: Claude Sonnet 4.5 evaluates lead responses to determine purchase intent

### 3. **Segment Management & Email Campaigns**
- Create targeted segments based on intent levels
- Broadcast email campaigns to specific cohorts
- Track engagement and reach

### 4. **Webinar Management**
- Create and schedule live webinars
- Public signup pages for attendees
- Track attendance and engagement

### 5. **Post-Webinar Follow-up**
- Automatically identify non-purchasers who attended webinars
- Send personalized follow-up emails with special offers
- Add discounts and bonus course incentives

### 6. **Analytics Dashboard with AI Insights**
- Visualize complete conversion funnel
- Track metrics: total leads, intent distribution, webinar signups, purchases
- **AI Integration**: Claude Sonnet 4.5 generates actionable recommendations for each funnel stage
- Data-driven insights to improve conversion rates

## 🏗️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **MongoDB** - Document database for flexible data storage
- **Motor** - Async MongoDB driver
- **Emergent Integrations** - AI integration library for Claude Sonnet 4.5
- **Resend** - Email delivery service
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Phosphor Icons** - Icon system
- **Sonner** - Toast notifications
- **Axios** - HTTP client

### AI/LLM Integration
- **Claude Sonnet 4.5** (via Emergent Integrations)
  - Landing page form generation
  - Lead intent classification
  - Analytics insights and recommendations

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📋 Prerequisites

- Docker & Docker Compose installed
- (Optional) Resend API key for email functionality

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd monetizeflow
```

### 2. Environment Setup

The `.env` files are pre-configured with development defaults. Update if needed:

**Backend** (`/app/backend/.env`):
```env
MONGO_URL="mongodb://mongodb:27017"
DB_NAME="monetizeflow_db"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY=sk-emergent-3367324D44e68F01aE
JWT_SECRET=monetizeflow_secret_key_2026_production_safe
RESEND_API_KEY=your_resend_api_key_here
SENDER_EMAIL=onboarding@resend.dev
```

**Frontend** (`/app/frontend/.env`):
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 3. Run with Docker

```bash
docker-compose up --build
```

This will start:
- **MongoDB** on port `27017`
- **Backend API** on port `8001`
- **Frontend** on port `3000`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📖 Usage Guide

### Step 1: Create Account
1. Navigate to `http://localhost:3000`
2. Click "Register" tab
3. Enter your name, email, and password
4. You'll be automatically logged in

### Step 2: Build Landing Page
1. Go to **Landing Pages** from sidebar
2. Fill in course details:
   - Course name
   - Description
   - Instructor name
   - Target audience
   - Price
3. Click **Generate Landing Page**
4. AI will create custom form fields
5. Copy the public URL and share with your audience

### Step 3: Collect Leads
1. Share the public landing page URL
2. Leads fill out the AI-generated form
3. View all leads in **Leads** section

### Step 4: Classify Leads
1. Go to **Leads** page
2. Click **Classify Leads with AI**
3. AI analyzes each lead and assigns intent level (High/Medium/Low)
4. Filter leads by intent level

### Step 5: Create Segments
1. Navigate to **Segments**
2. Click **Create Segment**
3. Name your segment
4. Choose intent filter (optional)
5. Segment is automatically populated with matching leads

### Step 6: Send Email Campaigns
1. Go to **Campaigns**
2. Select a segment
3. Write email subject and HTML content
4. Click **Send Broadcast**

### Step 7: Create Webinar
1. Navigate to **Webinars**
2. Click **Create Webinar**
3. Select landing page, add title, description, and schedule
4. Copy webinar signup URL
5. Share with leads

### Step 8: Send Follow-up to Non-Purchasers
1. After webinar, go to **Webinars**
2. Select your webinar
3. Scroll to **Post-Webinar Follow-up**
4. Add subject, discount %, and bonus courses
5. Click **Send Follow-up Emails**
6. Only attendees who didn't purchase will receive the email

### Step 9: Analyze Performance
1. Go to **Analytics**
2. View funnel visualization and metrics
3. Click **Generate AI Insights**
4. Get actionable recommendations for each stage

## 🎥 Loom Walkthrough

[Your Loom video link will go here]

## 🔑 API Documentation

### Authentication

**Register**
```bash
POST /api/auth/register
Body: { "name": "John Doe", "email": "john@example.com", "password": "secret" }
Response: { "token": "jwt_token", "user": {...} }
```

**Login**
```bash
POST /api/auth/login
Body: { "email": "john@example.com", "password": "secret" }
Response: { "token": "jwt_token", "user": {...} }
```

### Landing Pages

**Create Landing Page (AI-Generated Form)**
```bash
POST /api/landing-pages
Headers: { "Authorization": "Bearer {token}" }
Body: {
  "course_name": "Master Python",
  "course_description": "Learn Python from scratch",
  "instructor_name": "Jane Smith",
  "target_audience": "Beginners",
  "course_price": 99.00
}
```

**Get Landing Pages**
```bash
GET /api/landing-pages
Headers: { "Authorization": "Bearer {token}" }
```

**Get Public Landing Page**
```bash
GET /api/landing-pages/{page_id}
```

### Leads

**Submit Lead (Public)**
```bash
POST /api/leads
Body: {
  "landing_page_id": "uuid",
  "responses": { "full_name": "John", "email": "john@example.com", ... }
}
```

**Get Leads**
```bash
GET /api/leads?intent_level=high
Headers: { "Authorization": "Bearer {token}" }
```

**Classify Leads (AI)**
```bash
POST /api/leads/classify
Headers: { "Authorization": "Bearer {token}" }
```

### Segments

**Create Segment**
```bash
POST /api/segments
Headers: { "Authorization": "Bearer {token}" }
Body: { "name": "High Intent Leads", "intent_filter": "high" }
```

**Get Segments**
```bash
GET /api/segments
Headers: { "Authorization": "Bearer {token}" }
```

### Email Campaigns

**Broadcast Email**
```bash
POST /api/campaigns/broadcast
Headers: { "Authorization": "Bearer {token}" }
Body: {
  "segment_id": "uuid",
  "subject": "Special Offer",
  "html_content": "<h2>Hi!</h2><p>...</p>"
}
```

### Webinars

**Create Webinar**
```bash
POST /api/webinars
Headers: { "Authorization": "Bearer {token}" }
Body: {
  "landing_page_id": "uuid",
  "title": "Live Masterclass",
  "description": "...",
  "scheduled_date": "2026-02-01T19:00:00"
}
```

**Signup for Webinar (Public)**
```bash
POST /api/webinars/{webinar_id}/signup
Body: { "lead_id": "uuid" }
```

**Send Follow-up to Non-Purchasers**
```bash
POST /api/campaigns/webinar-followup
Headers: { "Authorization": "Bearer {token}" }
Body: {
  "webinar_id": "uuid",
  "subject": "Exclusive Offer",
  "discount_percent": 20,
  "bonus_courses": "Free bonus module"
}
```

### Analytics

**Get Funnel Stats**
```bash
GET /api/analytics/funnel
Headers: { "Authorization": "Bearer {token}" }
```

**Get AI Insights**
```bash
POST /api/analytics/insights
Headers: { "Authorization": "Bearer {token}" }
Body: {
  "funnel_stats": {...},
  "stage": "lead_capture"
}
```

## 🤖 AI Integration Details

### 1. Landing Page Form Generation
**Model**: Claude Sonnet 4.5  
**Input**: Course name, description, target audience, price  
**Output**: JSON array of custom form fields (name, label, type, options, required)  
**Purpose**: Creates relevant questions to capture qualified leads

### 2. Lead Intent Classification
**Model**: Claude Sonnet 4.5  
**Input**: Lead responses (budget, timeline, goals, experience)  
**Output**: Intent level (high/medium/low)  
**Purpose**: Prioritize high-intent leads for follow-up

### 3. Analytics Insights
**Model**: Claude Sonnet 4.5  
**Input**: Funnel stats, specific stage  
**Output**: Actionable recommendation (1-2 sentences)  
**Purpose**: Data-driven optimization suggestions

## 🗂️ Project Structure

```
.
├── backend/
│   ├── server.py              # FastAPI app with all routes
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/            # React page components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Auth context
│   │   ├── App.js           # Main app component
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── package.json         # Node dependencies
│   ├── tailwind.config.js   # Tailwind configuration
│   └── .env                 # Frontend environment variables
├── docker-compose.yml        # Multi-container setup
├── Dockerfile.backend        # Backend container
├── Dockerfile.frontend       # Frontend container
└── README.md                # This file
```

## 🧪 Testing

### Manual Testing
1. Register a new account
2. Create a landing page
3. Open the public URL in incognito mode
4. Submit a lead
5. Classify leads with AI
6. Create segments
7. Send email campaigns
8. Create webinar and test signup
9. View analytics and generate insights

### API Testing with cURL

```bash
# Register
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔧 Configuration

### Email Configuration (Optional)

To enable email functionality:

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Update `/app/backend/.env`:
   ```
   RESEND_API_KEY=re_your_actual_key_here
   SENDER_EMAIL=your-verified-domain@resend.dev
   ```
4. Restart backend: `docker-compose restart backend`

### AI Configuration

The Emergent LLM key is pre-configured for Claude Sonnet 4.5. To use your own Anthropic key:

1. Update `/app/backend/.env`:
   ```
   ANTHROPIC_API_KEY=your_anthropic_key_here
   ```
2. Modify `server.py` to use `ANTHROPIC_API_KEY` instead of `EMERGENT_LLM_KEY`

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose up --build backend
```

### Frontend won't start
```bash
# Check logs
docker-compose logs frontend

# Rebuild
docker-compose up --build frontend
```

### MongoDB connection issues
```bash
# Check MongoDB is running
docker-compose ps

# Restart MongoDB
docker-compose restart mongodb
```

### AI generation fails
- Check `EMERGENT_LLM_KEY` is set correctly
- View backend logs for API errors
- Ensure internet connection is stable

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For questions or issues, please open a GitHub issue.

---

**Built with ❤️ using FastAPI, React, MongoDB, and Claude Sonnet 4.5**

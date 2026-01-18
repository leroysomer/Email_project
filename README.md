# Academic Email Assistant

A full-stack web application that helps students find and email academics for internship opportunities. The system uses AI to search for relevant researchers, generate personalized emails, and manage email delivery with status tracking.

## Features

- **User Authentication**: Secure user registration and login with JWT
- **Profile Management**: Upload resume, research interests, and email template
- **Academic Search**: AI-powered search for academics based on universities and research domains
- **Email Generation**: AI-generated personalized emails using OpenAI GPT-4
- **Email Sending**: Support for Gmail, Outlook, and SMTP
- **Status Tracking**: Track email status (sent, no response, received)

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios for API calls

### Backend
- FastAPI
- Python 3.11+
- SQLAlchemy ORM
- PostgreSQL
- OpenAI API (GPT-4)
- Google Scholar web scraping

## Project Structure

```
Email_project/
├── frontend/                 # Next.js application
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and API client
│   └── types/               # TypeScript type definitions
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration and database
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   └── requirements.txt
└── database/               # Database initialization scripts
```

## Setup Instructions

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL 12+
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/email_assistant
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password
CORS_ORIGINS=["http://localhost:3000"]
```

5. Set up PostgreSQL database:
```bash
# Create database
createdb email_assistant

# Or use psql:
psql -U postgres
CREATE DATABASE email_assistant;
```

6. Run the FastAPI server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Register/Login**: Create an account or log in with existing credentials
2. **Setup Profile**: Upload your resume, describe your research interests, and provide an email template
3. **Search Academics**: Enter universities and research domains to find relevant academics
4. **Generate Emails**: Select academics and generate personalized emails
5. **Send Emails**: Review and send emails via SMTP, Gmail, or Outlook
6. **Track Status**: Monitor email status and update when responses are received

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Profile
- `POST /api/profile/upload` - Upload resume and profile data
- `GET /api/profile` - Get user profile

### Search
- `POST /api/search/academics` - Search for academics
- `GET /api/search/academics` - Get all academics

### Emails
- `POST /api/emails/generate` - Generate personalized email
- `POST /api/emails/send` - Send email
- `GET /api/emails/campaigns` - Get all email campaigns
- `PATCH /api/emails/campaigns/{id}/status` - Update email status

## Development Notes

- The Google Scholar scraping is a basic implementation. For production, consider using official APIs or scraping services.
- Gmail/Outlook OAuth integration requires additional setup with OAuth credentials.
- The database tables are created automatically on first run via SQLAlchemy.

## License

This project is for educational purposes.

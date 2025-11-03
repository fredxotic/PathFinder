# PathFinder - AI-Powered Decision Assistant

PathFinder is a full-stack web application that helps users make better life and career decisions through structured analysis and AI-powered insights.

## 🎯 What It Does

- **Decision Analysis**: Users input a decision context, options, and priorities
- **AI-Powered Insights**: Get structured analysis with scores and recommendations  
- **Visual Analytics**: View results through radar charts and bar graphs
- **Decision History**: Save and review past decisions
- **Export Capabilities**: Download analysis as PDF reports

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- Framer Motion for animations

**Backend:**
- FastAPI (Python)
- Supabase (PostgreSQL) for data storage
- Mock AI service (no API key required)

## 🚀 Features

### Core Functionality
- ✅ Decision input with customizable priorities and weights
- ✅ AI analysis with score breakdowns and recommendations  
- ✅ Confidence scoring based on analysis strength
- ✅ Visual charts showing option comparisons
- ✅ Decision saving and history tracking
- ✅ PDF export for analysis reports

### Technical Features
- ✅ Responsive design for all screen sizes
- ✅ Dark/light mode toggle
- ✅ Type-safe with TypeScript
- ✅ Production-ready deployment setup
- ✅ Error handling and loading states

## 📦 Project Structure

```
pathfinder/
├── frontend/                 # Next.js 14 application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and helpers
│   └── types/               # TypeScript definitions
└── backend/                 # FastAPI application
    ├── app/
    │   ├── models/          # Pydantic models
    │   ├── services/        # Business logic
    │   └── main.py          # FastAPI app
    └── requirements.txt     # Python dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Supabase account (free tier)

### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

### Backend Setup  
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase credentials
uvicorn app.main:app --reload --port 8000
```

### Database Setup
1. Create a Supabase project
2. Run the SQL schema
3. Update environment variables with your credentials

## 🎨 How to Use

1. **Create a Decision**: Enter your decision context and options
2. **Set Priorities**: Rate importance of factors like career growth, work-life balance, etc.
3. **Get Analysis**: Receive AI-powered scores and recommendations  
4. **Review Results**: View charts and detailed reasoning
5. **Save & Export**: Store decisions for later or export as PDF

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=optional_for_mock_service
```

## 🧪 Testing

The application includes a mock AI service that simulates real AI analysis without requiring an OpenAI API key. This makes it easy to test all functionality locally.

## 📝 Notes

- Uses mock AI service by default (no API costs)
- Real OpenAI integration available if API key provided
- Free Supabase tier sufficient for personal use
- All analysis data stored securely in PostgreSQL

## 🤝 Contributing

This is a personal project demonstrating full-stack development with modern tools and patterns.
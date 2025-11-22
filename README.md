# 🧭 PathFinder - AI-Powered Decision Intelligence Platform


[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![AI Powered](https://img.shields.io/badge/AI%20Powered-Groq%20LLM-FF6B6B?style=for-the-badge)](https://groq.com/)

↗️ [Live Demo](https://pathfinder-eight-sable.vercel.app) 

## 🎯 The Problem: Decision Fatigue is Real and Costly

Every day, professionals face critical decisions that shape their careers, finances, and lives. Yet most people rely on:

- ❌ **Gut feelings** without structured analysis
- ❌ **Spreadsheet chaos** that's hard to interpret  
- ❌ **Analysis paralysis** that delays important choices
- ❌ **Overlooked trade-offs** leading to suboptimal outcomes

**The result?** Missed opportunities, wasted resources, and the constant stress of wondering "what if?"

## 💡 The Solution: Structured Decision Intelligence

PathFinder transforms how you make important choices by combining **AI-powered analysis** with **structured decision frameworks** - turning complex dilemmas into clear, confident choices.

## 🚀 How It Works

### 1. **Define Your Decision Context**
> "Should I take the promotion, switch companies, or start my own business?"

Capture the full context of your dilemma with guided prompts that ensure you consider all angles.

### 2. **Weigh What Truly Matters**
Set custom priorities with weighted importance:
- Career Growth (Weight: 9/10)
- Work-Life Balance (Weight: 8/10) 
- Financial Impact (Weight: 7/10)
- Learning Opportunity (Weight: 6/10)

### 3. **Get AI-Powered Strategic Analysis**
Our advanced AI evaluates each option against your priorities and provides:

- **Quantitative Scoring** with weighted rankings
- **Strategic Insights** you might have missed
- **Risk Assessment** and opportunity analysis
- **Comparative Analysis** between options
- **Confidence Metrics** for each recommendation

### 4. **Visualize & Act**
- 📊 **Interactive Charts** showing priority alignment
- 📋 **Actionable Next Steps** with clear implementation guidance
- 📄 **Professional PDF Reports** for sharing with stakeholders
- 💾 **Decision History** to track your reasoning over time

## 🏆 Why PathFinder Becomes Your Strategic Advantage

### For Professionals
> **"PathFinder helped me evaluate a career move that aligned with my long-term goals while maintaining the work-life balance I valued."**

### For Entrepreneurs  
> **"The AI analysis revealed hidden risks in a business partnership I was considering, providing insights I hadn't considered."**

### For Teams
> **"We use PathFinder for strategic planning sessions. The structured approach eliminates bias and ensures we consider all perspectives."**

## 🛠 Technical Excellence

### Architecture Built for Performance
```
Frontend (Next.js 14) → API Layer (FastAPI) → AI Engine (Groq LLM) → Database (Supabase)
```

### Key Features
- 🔒 **Secure Authentication** with Supabase Auth
- 📱 **Fully Responsive** across all devices
- 🎨 **Modern UI/UX** with dark/light mode support
- 🔄 **Real-time Updates** and smooth interactions
- 📈 **Advanced Analytics** on decision patterns

### AI That Actually Understands Context
Unlike generic AI chatbots, PathFinder's specialized reasoning engine:

- **Context-Aware Analysis** tailored to career, financial, or personal decisions
- **Priority-Weighted Scoring** that reflects your unique values
- **Comparative Insights** highlighting non-obvious trade-offs
- **Risk-Opportunity Framework** for balanced evaluation

## 🎯 Perfect For These Critical Decisions

### 🏢 Career Crossroads
- Job offers and promotions
- Career path selection
- Skill development investments

### 💼 Business Strategy  
- Product prioritization
- Hiring decisions
- Investment opportunities

### 🏠 Life Choices
- Education paths
- Major purchases
- Personal development investments

## 📋 Key Features

### Core Functionality
- ✅ **Structured Decision Framework** - Guided process for complex choices
- ✅ **AI-Powered Analysis** - Intelligent insights and recommendations
- ✅ **Priority-Based Scoring** - Weighted evaluation based on your values
- ✅ **Interactive Visualizations** - Clear charts and comparative analysis
- ✅ **Decision History** - Save and revisit past analyses
- ✅ **PDF Export** - Professional reports for sharing

### User Experience
- ✅ **Responsive Design** - Works seamlessly on all devices
- ✅ **Dark/Light Mode** - Comfortable viewing in any environment
- ✅ **Real-time Updates** - Instant feedback and analysis
- ✅ **Intuitive Interface** - No learning curve required

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and Python 3.8+
- Supabase account (free tier available)
- Groq API account (for AI analysis)

### Quick Setup

1. **Clone the repository**
```bash
git clone https://github.com/fredxotic/pathfinder.git
cd pathfinder
```

2. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Add your environment variables
npm run dev
```

3. **Setup Backend**
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your environment variables
uvicorn app.main:app --reload --port 8000
```

### Environment Configuration

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**Backend (.env):**
```env
GROQ_API_KEY=your_groq_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

## 🏗️ Technical Approach

### Architecture Decisions
- **Next.js 14 App Router** for optimal performance and SEO
- **FastAPI** for high-performance Python backend with automatic docs
- **Supabase** for real-time database and authentication
- **Groq LLM** for fast, efficient AI reasoning
- **Tailwind CSS + shadcn/ui** for consistent, accessible design

### AI Analysis Methodology
Our AI service implements a structured reasoning process:
1. **Priority Weighting** - Mathematical scoring based on user-defined weights
2. **Comparative Analysis** - Side-by-side evaluation of options
3. **Risk Assessment** - Identification of potential downsides
4. **Opportunity Mapping** - Highlighting potential upsides
5. **Confidence Scoring** - Statistical confidence in recommendations

### Database Schema
```sql
-- Profiles table for user management
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decisions table for storing analysis history
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    context TEXT NOT NULL,
    options JSONB NOT NULL,
    priorities JSONB NOT NULL,
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Policies for secure data access
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own decisions" ON decisions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions" ON decisions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions" ON decisions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decisions" ON decisions
    FOR DELETE USING (auth.uid() = user_id);
```

### Data Models
```python
class Priority(BaseModel):
    name: str = Field(..., description="Name of the priority")
    weight: int = Field(..., ge=1, le=10, description="Weight from 1-10")
    description: str = Field(..., description="Description of the priority")

class DecisionInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    context: str = Field(..., min_length=10, max_length=2000)
    options: List[str] = Field(..., min_items=2, max_items=5)
    priorities: List[Priority]

class AnalysisResult(BaseModel):
    decision_id: Optional[str] = None
    scores: List[OptionScore]
    summary: str
    reasoning: str
    confidence: float
    recommended_option: str
    key_insights: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    comparative_analysis: str = ""
```

## 📊 API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/api/analyze-decision` | AI analysis of decision options | Required |
| `POST` | `/api/save-decision` | Store decision analysis | Required |
| `GET` | `/api/decisions` | Retrieve user's decision history | Required |
| `GET` | `/api/decisions/{id}` | Get specific decision | Required |
| `DELETE` | `/api/decisions/{id}` | Remove a saved decision | Required |

## 🔧 Core Services

### Database Service
- **User Management**: Automatic profile creation and validation
- **Decision CRUD**: Full lifecycle management of decision analyses
- **Data Validation**: Robust error handling and type checking
- **Security**: Row-level security and user isolation

### AI Analysis Service
- **Multiple Model Fallback**: Automatic failover between Groq models
- **Structured Output**: Consistent JSON responses with validation
- **Context Awareness**: Tailored analysis based on decision type
- **Confidence Scoring**: Statistical confidence metrics

## 🛣️ Future Roadmap

### Phase 1 (Current)
- ✅ **Core Decision Framework**
- ✅ **AI-Powered Analysis**
- ✅ **User Authentication**
- ✅ **Basic Visualization**

### Phase 2 (Next)
- 🤖 **Advanced AI Models** with industry-specific knowledge
- 👥 **Collaborative Features** for team decision-making
- 📈 **Analytics Dashboard** for decision pattern insights
- 🔄 **Template Library** for common decision types

### Phase 3 (Future)
- 📱 **Mobile App** for on-the-go decision support
- 🔌 **Integration Ecosystem** with popular tools (Slack, Notion, Jira)
- 🌍 **Multi-language Support** for global accessibility
- 🎯 **Industry-specific Modules** for specialized use cases

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure Supabase environment variables are correctly set
   - Verify Row Level Security policies are properly configured

2. **AI Analysis Failures**
   - Check Groq API key validity
   - Verify internet connectivity for API calls
   - Review backend logs for specific error messages

3. **Database Connection Issues**
   - Confirm Supabase project is active
   - Validate service role key permissions
   - Check network connectivity to Supabase

### Debug Mode
Enable detailed logging by setting:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Bugs
1. Check existing issues to avoid duplicates
2. Provide detailed reproduction steps
3. Include error logs and environment details

### Suggesting Features
1. Open an issue with the "enhancement" label
2. Describe the use case and expected behavior
3. Consider implementation complexity

### Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup
```bash
# Backend testing
cd backend
pytest tests/

# Frontend testing  
cd frontend
npm run test

# Code formatting
black app/
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq** for providing fast LLM inference capabilities
- **Supabase** for the excellent backend-as-a-service platform
- **Next.js Team** for the amazing React framework
- **FastAPI Team** for the high-performance Python API framework
- **Open-source Community** for invaluable tools and libraries

---

<div align="center">

### **Ready to Make Better Decisions?**
*Start your journey from analysis paralysis to confident action today*

**• 🐛 [Report Issue](https://github.com/fredxotic/pathfinder/issues) • 💡 [Request Feature](https://github.com/fredxotic/pathfinder/issues)**

*Built with ❤️ - Empowering smarter decisions worldwide*

</div>

---

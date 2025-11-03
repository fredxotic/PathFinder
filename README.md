# 🌍 PathFinder – AI-Powered Decision Intelligence App

> **“Helping you think clearly when it matters most.”**

---

## 🧭 Overview

**PathFinder** is a full-stack AI web application designed to help users make smarter life, career, and business decisions.
It provides a **structured decision-making framework** powered by **AI reasoning** and **data visualization**, allowing users to evaluate trade-offs, score priorities, and view insights through interactive charts.

Built with **Next.js**, **FastAPI**, and **Supabase**, PathFinder combines analytical clarity with modern design to turn confusion into confidence.

---

## 🎯 Core Features

### ✅ **What’s Working Now**

* **3-Step Decision Flow:** Capture context, list options, and rank personal priorities.
* **AI Analysis (Mocked):** Smart, realistic reasoning without real API costs.
* **Interactive Visuals:** Radar and bar charts powered by Recharts.
* **Decision History:** Save, edit, and delete past analyses using Supabase.
* **PDF Export:** Generate polished, shareable decision reports.
* **Responsive UI:** Modern layout with dark/light mode support.
* **Deployment Ready:** Vercel + Render configurations included.

### 🚧 **Planned Enhancements**

* Real OpenAI integration (GPT-4 powered reasoning).
* User authentication (Supabase Auth).
* Data validation and improved error handling.
* Animated loading states and toast notifications.
* Advanced analytics and collaborative decision-making.
* React Native mobile version.

---

## 🧱 Technical Architecture

| Layer          | Technology                           | Purpose                               |
| -------------- | ------------------------------------ | ------------------------------------- |
| **Frontend**   | Next.js 14 (App Router)              | Dynamic UI and routing                |
|                | Tailwind CSS + shadcn/ui             | Clean, modern design system           |
|                | Framer Motion                        | Subtle animations and transitions     |
|                | Recharts                             | Data visualization (bar/radar charts) |
| **Backend**    | FastAPI                              | REST API for AI logic and CRUD ops    |
| **Database**   | Supabase (PostgreSQL)                | Persistent data storage               |
| **AI Layer**   | Mock OpenAI service                  | Simulated reasoning engine            |
| **Deployment** | Vercel (frontend) + Render (backend) | Cloud deployment setup                |

---

## 📂 Folder Structure

```
pathfinder/
├── frontend/                     # Next.js 14 application
│   ├── app/                      # App Router pages
│   ├── components/               # Reusable UI components
│   ├── lib/                      # Utilities and API services
│   ├── types/                    # TypeScript interfaces
│   └── tailwind.config.ts        # Tailwind configuration
│
├── backend/                      # FastAPI application
│   ├── app/
│   │   ├── models/               # Pydantic data models
│   │   ├── services/             # Business logic / AI simulation
│   │   └── main.py               # FastAPI entrypoint
│   ├── render.yaml               # Render deployment file
│   └── requirements.txt          # Python dependencies
│
└── README.md
```

---

## 🗄️ Database Schema (Supabase)

```sql
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    context TEXT NOT NULL,
    options JSONB NOT NULL,
    priorities JSONB NOT NULL,
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ⚙️ API Endpoints

| Method   | Endpoint            | Description                      |
| -------- | ------------------- | -------------------------------- |
| `POST`   | `/analyze-decision` | Run AI-powered decision analysis |
| `POST`   | `/save-decision`    | Store a completed analysis       |
| `GET`    | `/decisions`        | Retrieve user’s past decisions   |
| `DELETE` | `/decisions/{id}`   | Delete a saved decision          |

---

## 💻 Local Development Setup

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Environment Variables

**Frontend (.env.local):**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**Backend (.env):**

```env
OPENAI_API_KEY=optional_for_now
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

---

## 📊 How the AI Works (Mock Version)

The mock service generates:

* Weighted scores for each option based on user priorities.
* Adaptive narratives (the reasoning text changes depending on score differences).
* Context-aware suggestions for life, career, or investment decisions.
  This allows you to test realistic AI logic even without API keys.

---

## 🧠 Future Roadmap

### Phase 2 (Post-PLP)

* 🔑 **Supabase Auth:** Add secure user login and profile management.
* 🤖 **Real AI Analysis:** Integrate GPT-4 for deeper reasoning.
* 📈 **Advanced Insights:** Multi-decision trends and visualization.
* 📱 **Mobile App:** React Native version for on-the-go access.
* 🧩 **Templates Library:** Predefined decision scenarios (career, finance, study, etc.).

---

## 💡 Business Impact

| Stakeholder              | Value Delivered                                                           |
| ------------------------ | ------------------------------------------------------------------------- |
| **Users**                | Simplifies complex decision-making with clarity and data-backed insights. |
| **Developers/Reviewers** | Demonstrates full-stack proficiency and product thinking.                 |
| **Educational Use**      | Can serve as a teaching tool for structured decision-making.              |

---

## 🧑‍💻 Author

**Fred Kaloki**
AI & Software Engineering Student | PLP Academy
📧 [charlesfred285@gmail.com](mailto:charlesfred285@gmail.com)
🌍 [Egerton University, Kenya]

---

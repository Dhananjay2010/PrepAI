# PrepAI: Product Requirement Document & Detailed Feature Specification

**Document Title:** PrepAI IT Professional Enhancement & Retention Specification  
**Target Persona:** IT Working Professionals (Senior Software Engineers, Cloud/DevOps Architects, Data Engineers, System Designers, Engineering Leads)  
**Version:** 1.0.0  
**Status:** Draft for Review  

---

## 1. Executive Summary & Strategic Objectives

PrepAI is evolving from a basic interview question generator into an end-to-end **IT Interview Preparation & Real-Time Copilot Platform**. Experienced IT professionals preparing for job interviews face multi-stage evaluation processes (Recruiter Screens, Low-Level Design, High-Level System Design, and Behavioral rounds). 

### Core Strategic Goals
1. **Stage-Aware Alignment**: Structure interview questions into 4 real-world interview rounds matching corporate hiring workflows.
2. **Real-Time Assistance**: Provide a live, dual-screen "Copilot Teleprompter" and quick keyword deck during virtual interview screens.
3. **Deep Technical Evaluation**: Render interactive Mermaid.js architecture diagrams, code sandbox environments, and dynamic trade-off matrices.
4. **Stress & Grill Mock Practice**: Introduce multi-turn voice interviews with dynamic follow-ups and customizable interviewer personas.
5. **Resume Gap Analysis**: Compare candidate PDF resumes against target Job Descriptions (JDs) to identify high-risk technical gaps.
6. **Maximizing User Retention**: Implement spaced repetition (Anki SRS), interview date countdown blitzes, daily 3-minute quizzes, and an AI "Interview Readiness Score" (0–100%).

---

## 2. Feature Specifications

### 2.1 Feature 1: Round-Wise Interview Pipeline Simulator

#### Purpose
Currently, questions are outputted in a flat list. IT interviews follow strict multi-round structures. This feature categorizes questions into explicit interview rounds.

#### Specification & Breakdown
* **Round 1: Recruiter Screening & Fit**
  * *Focus*: Elevator pitch, salary expectations match, career progression narrative, surface-level JD tech stack validation.
  * *Deliverables*: Concise 60-second answers, high-level skill summaries.
* **Round 2: Technical Screening & Low-Level Design (LLD)**
  * *Focus*: Data structures, algorithmic edge cases, object-oriented design patterns, SQL query tuning, code refactoring.
  * *Deliverables*: Code snippets, time/space complexity analysis, unit test scenarios.
* **Round 3: High-Level System Design (HLD) & Distributed Systems**
  * *Focus*: Scalability (10k to 1M QPS), database sharding, caching strategies (Redis/Memcached), message brokers (Kafka/RabbitMQ), load balancing, microservice resilience.
  * *Deliverables*: Mermaid.js architecture diagrams, trade-off comparison tables.
* **Round 4: Behavioral & Hiring Manager (STAR Method)**
  * *Focus*: Incident management (P0/P1 post-mortems), conflict resolution, cross-functional collaboration, company core leadership values.
  * *Deliverables*: Structured Situation $\rightarrow$ Task $\rightarrow$ Action $\rightarrow$ Result templates.

#### Technical Implementation Details
* Update `lib/gemini.ts` system prompt to output a `round` key for every question (`screening` | `lld_coding` | `hld_system_design` | `behavioral`).
* UI: Render tab navigation bar (`InterviewPipelineTabs.tsx`) inside `app/dashboard/[id]/page.tsx` allowing candidates to filter questions by stage.

---

### 2.2 Feature 2: Real-Time Interview Copilot & Teleprompter Mode

#### Purpose
Provide a high-contrast, dual-screen reference mode optimized for virtual phone/video interview screens (Zoom, Teams, Google Meet).

#### Specification & Features
* **High-Contrast Teleprompter HUD**: Full-screen overlay modal with large, scannable typography, dark background, and zero fluff.
* **Instant Keyword Deck**: Quick bullet points containing key technical terms, framework names, and architectural trade-offs mapped to JD competencies.
* **Fuzzy Panic Search**: Keyboard shortcut (`Cmd/Ctrl + K`) to immediately search saved precise answers during active interviews.
* **Voice-Activated Auto-Scroll (Experimental)**: Web Speech API microphone listener tracking interviewer keywords and highlighting matching reference cards.

#### Technical Implementation Details
* Create component `components/CopilotModal.tsx`.
* Create state handler in `app/dashboard/[id]/page.tsx` to launch Copilot Mode in a separate popup window or side-by-side view.

---

### 2.3 Feature 3: Interactive System Design Visualizer & Code Sandbox

#### Purpose
Transform static text answers into interactive visual flowcharts and code execution environments.

#### Specification & Features
* **Mermaid.js Flowchart Generator**: Automatically convert system design answer outlines into visual Mermaid architecture diagrams (Client $\rightarrow$ CDN $\rightarrow$ API Gateway $\rightarrow$ Service Mesh $\rightarrow$ Primary/Replica DB).
* **Interactive Code & SQL Sandbox**: Lightweight syntax-highlighted editor allowing candidates to edit and inspect code snippets or SQL queries.
* **Trade-Off Matrix Card**: Render standardized side-by-side matrices (e.g., Latency vs. Throughput, SQL vs. NoSQL, Monolith vs. Microservices).

#### Technical Implementation Details
* Create component `components/SystemDesignDiagram.tsx` using `mermaid.js` client-side renderer.
* Extend `QuestionCard.tsx` with a visual tab switcher: `[ Answer Outline | Mermaid Diagram | Code Sandbox | Trade-Off Matrix ]`.

---

### 2.4 Feature 4: Advanced AI Voice Interviewer with Stress / Grill Mode

#### Purpose
Move beyond single-turn Q&A to realistic multi-turn conversational mock interviews with interruptions and dynamic follow-ups.

#### Specification & Features
* **Interviewer Persona Selector**:
  * *Persona A: Skeptical Principal Architect*: Deeply probes trade-offs (*"Why did you choose Postgres over DynamoDB? What happens when write load spikes 50x?"*).
  * *Persona B: Time-Constrained Engineering Director*: Demands concise, impact-focused answers with clear metrics.
  * *Persona C: Friendly Peer Engineer*: Focuses on team collaboration and clean code practices.
* **Real-Time Follow-Up Generation**: Gemini evaluates candidate speech and generates a dynamic follow-up question if the initial answer lacked depth.
* **Post-Session Telemetry Report**: Comprehensive feedback card assessing Pace (WPM), Technical Depth, Filler Word Usage, and Trade-off Accuracy.

#### Technical Implementation Details
* Refactor `components/MockInterviewChat.tsx` and `app/api/mock-interview/route.ts` to maintain conversation transcript state in Supabase (`mock_conversations` table).

---

### 2.5 Feature 5: Resume vs. JD Skill-Gap Analyzer

#### Purpose
Compare candidate's PDF resume against target Job Description to highlight critical technical gaps and high-risk interview areas.

#### Specification & Features
* **Resume Upload Widget**: Drag-and-drop PDF parser extracting candidate experience.
* **Skill Alignment Matrix**:
  * **Strong Match (Green)**: Technologies listed in JD where candidate has proven experience.
  * **Gap / Critical Risk (Red)**: Tech stack explicitly required by JD but missing from resume.
* **Custom STAR Generator**: Generate customized behavioral stories bridging candidate's actual past projects to target JD requirements.

#### Technical Implementation Details
* Create API route `/api/resume-match/route.ts` using `pdf-parse` library and Gemini text comparison.
* Create UI component `components/ResumeGapVisualizer.tsx`.

---

## 3. Retention & Engagement Strategy

To ensure candidates return daily throughout their 2 to 6-week job search cycle, implement five core retention loops:

```
[Interview Date Set] ──> [7-Day Daily Curriculum] ──> [5-Min SRS Flashcards] ──> [Readiness Score Up] ──> [Interview Success]
```

### 3.1 Retention Loop 1: Target Interview Countdown & 7-Day Blitz
* **Mechanism**: Candidate specifies target interview date (e.g., *"Interview in 5 Days"*).
* **Daily Curriculum**: PrepAI generates an adaptive daily checklist:
  * *Day 1*: Fundamental JD Skills & Recruiter Pitch
  * *Day 2*: Low-Level Design & Code Scenarios
  * *Day 3*: High-Level System Design & Architecture
  * *Day 4*: Behavioral STAR Stories & Culture Fit
  * *Day 5*: Weak Topic Polish & Mock Grill Session
  * *Day 6*: Final Copilot Review & Cheat Sheet Export

### 3.2 Retention Loop 2: Spaced Repetition (Anki SRS Flashcard Engine)
* **Mechanism**: Implement Leitner 5-Box Spaced Repetition algorithm.
* **Daily Routine**: Questions flagged as "Weak" in `TopicBreakdownBar.tsx` automatically convert into daily 5-minute flashcard decks due every morning.

### 3.3 Retention Loop 3: AI "Interview Readiness Score" (0–100%)
* **Metric Formula**:
  $$\text{Readiness Score} = (0.35 \times \text{Topic Coverage}) + (0.35 \times \text{Mock Practice Average}) + (0.15 \times \text{SRS Mastery}) + (0.15 \times \text{Streak Factor})$$
* **Visual Representation**: Circular SVG gauge on user dashboard (`app/dashboard/page.tsx`) giving candidates a tangible goal of reaching 85%+ before interview day.

### 3.4 Retention Loop 4: Daily Micro-Quizzes & Push Reminders
* **Mechanism**: 3-minute quick quiz sent via email / browser notification every morning with 2 multiple-choice system design or technical questions based on active JDs.

### 3.5 Retention Loop 5: Anonymous Peer Mock Interview Matching
* **Mechanism**: Allow candidates preparing for similar roles (e.g. Senior DevOps) to opt-in for peer-to-peer 45-minute live mock practice.

---

## 4. Technical Architecture & Database Schema Additions

### 4.1 Supabase Database Schema Extensions (`supabase/schema.sql`)

```sql
-- ========================================================
-- PrepAI Platform Enhancements SQL Migration
-- ========================================================

-- 1. Extend Sessions Table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS target_company TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS resume_text TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS interview_rounds JSONB;

-- 2. Create Flashcards Table (SRS Engine)
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  box INT DEFAULT 1 CHECK (box BETWEEN 1 AND 5),
  next_review_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Readiness Telemetry Table
CREATE TABLE IF NOT EXISTS readiness_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  readiness_score INT DEFAULT 0,
  technical_mastery INT DEFAULT 0,
  behavioral_readiness INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Mock Conversations Log Table
CREATE TABLE IF NOT EXISTS mock_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  persona TEXT DEFAULT 'skeptical_architect',
  messages JSONB NOT NULL,
  overall_score INT,
  feedback_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own flashcards" ON flashcards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own readiness" ON readiness_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own mock conversations" ON mock_conversations FOR ALL USING (auth.uid() = user_id);
```

---

### 4.2 API Endpoint Architecture & Contracts

#### 1. POST `/api/resume-match`
* **Request Payload**:
  ```json
  {
    "userId": "uuid-v4",
    "resumeText": "String content of uploaded PDF",
    "jobDescription": "Full target job description text"
  }
  ```
* **Response Payload**:
  ```json
  {
    "matchPercentage": 78,
    "matchingSkills": ["Node.js", "PostgreSQL", "Docker"],
    "criticalGaps": ["Kubernetes", "Kafka", "gRPC"],
    "tailoredStarStories": [
      {
        "competency": "Incident Handling",
        "suggestedStory": "Bridge experience with PostgreSQL query degradation to address JD requirement for high-throughput database tuning."
      }
    ]
  }
  ```

#### 2. GET `/api/flashcards/due?userId={id}`
* **Response Payload**:
  ```json
  {
    "dueCount": 8,
    "flashcards": [
      {
        "id": "fc-123",
        "questionText": "Explain Database Read-Replicas vs Sharding",
        "answerText": "Read replicas scale read volume by mirroring primary... Sharding splits data horizontally by shard key.",
        "box": 2
      }
    ]
  }
  ```

---

## 5. UI/UX Wireframe Specifications

### 5.1 Stage-Aware Session Page Layout (`app/dashboard/[id]/page.tsx`)
```
+-----------------------------------------------------------------------------+
|  <- Back to Dashboard       Target Role: Sr Cloud Architect     Saved Oct 12|
+-----------------------------------------------------------------------------+
| [ Readiness Gauge: 78% ] [ Target Interview: In 4 Days ] [ 📄 Copilot Mode ] |
+-----------------------------------------------------------------------------+
| Tabs: [ All Qs (20) | R1: Recruiter (4) | R2: LLD (6) | R3: HLD (6) | R4: STAR (4) ]|
+-----------------------------------------------------------------------------+
| Question Card #1 (HLD - Critical)                                           |
| "Design a Low-Latency Rate Limiter handling 100k QPS"                       |
| Visuals: [ Outline | Mermaid Flowchart | Trade-off Matrix | Code Sandbox ]  |
| Action Buttons: [ 🎙️ Practice Voice Mock ] [ ⚡ Add to Flashcard Deck ]       |
+-----------------------------------------------------------------------------+
```

---

## 6. Verification & Quality Assurance Plan

### Automated Verification Tests
1. **API Integration Tests**: Verify `/api/generate` outputs valid `round` metadata for all generated questions.
2. **Schema Verification**: Validate Supabase RLS policies on `flashcards` and `readiness_scores` tables.
3. **Mermaid Syntax Validator**: Ensure dynamically generated Mermaid string diagrams parse cleanly without rendering syntax errors.

### Manual UX Verification Checklist
1. Verify dual-screen Copilot Teleprompter mode opens smoothly in full-screen window without latency.
2. Test resume PDF upload with multi-page complex formatting.
3. Validate multi-turn voice mock session continuity across at least 5 conversation turns.

---

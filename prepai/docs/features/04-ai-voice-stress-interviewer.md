# Feature Spec 04: Advanced AI Voice Interviewer with Stress / Grill Mode

**Feature ID:** FEAT-04  
**Target Goal:** Upgrade mock interview mode from single Q&A evaluations to multi-turn conversational voice grilling with dynamic follow-up questions and custom interviewer personas.  
**Priority:** Medium (Phase 2)  

---

## 1. Overview & Business Value
Single-turn question-and-answer mock tests do not replicate real tech interviews. In actual interviews, interviewers challenge trade-offs, interrupt superficial answers, and probe for edge cases. Stress Mode allows candidates to practice under pressure.

### Candidate User Story
> "As an engineering candidate, I want an AI interviewer to challenge my design choices (e.g. 'Why did you pick MongoDB instead of PostgreSQL?') so I can practice defending my technical decisions under stress."

---

## 2. Interviewer Personas

| Persona | Name | Persona Style & Focus | Follow-up Behavior |
| :--- | :--- | :--- | :--- |
| **Persona A** | **Skeptical Principal Architect** | Deep trade-off grilling, edge-case probing, performance limits under load. | Interrupts superficial answers with *"What happens if write QPS spikes 100x?"* |
| **Persona B** | **Time-Constrained Manager** | Concise 60-second answers, business ROI, team leadership, project ownership. | Asks candidate to summarize key points in 3 bullets. |
| **Persona C** | **Friendly Peer Engineer** | Collaborative, clean code, testing strategies, API interface design. | Asks follow-ups about error handling and unit test coverage. |

---

## 3. Database Migration Script (`supabase/schema.sql`)

```sql
-- Migration 04: Log multi-turn mock interview conversations
CREATE TABLE IF NOT EXISTS mock_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  persona TEXT DEFAULT 'skeptical_architect',
  messages JSONB NOT NULL, -- Array of { role: 'interviewer' | 'candidate', content: string, timestamp: string }
  overall_score INT,
  feedback_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mock_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own mock conversations" ON mock_conversations FOR ALL USING (auth.uid() = user_id);
```

---

## 4. API & Conversation Engine Architecture

### File to Modify: `app/api/mock-interview/route.ts`

```typescript
export interface MockConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const { userId, sessionId, persona, conversationHistory, candidateAudioTranscript } = await req.json();

  // Construct System Prompt based on selected persona
  const personaPrompts: Record<string, string> = {
    skeptical_architect: `You are a tough, skeptical Principal System Architect interviewing a senior candidate. 
If the candidate gives a superficial or generic answer, challenge their architectural trade-offs aggressively (e.g. asking about failure modes, race conditions, scaling limits). Keep questions focused on deep technical specifics.`,
    time_constrained_manager: `You are an executive hiring manager with 10 minutes left. Demand direct, concise 60-second STAR-method answers emphasizing business outcome metrics.`,
    friendly_peer: `You are a senior colleague holding a collaborative tech screen. Probe clean code, error handling, and team communication.`
  };

  const systemInstruction = personaPrompts[persona] || personaPrompts.skeptical_architect;

  // Invoke Gemini with full multi-turn conversation history
  // Return evaluation score + next dynamic follow-up question
}
```

---

## 5. UI/UX Component Specifications

### File to Modify: `components/MockInterviewChat.tsx`
* Add Persona Dropdown selector (`Skeptical Architect` | `Time-Constrained Manager` | `Friendly Peer`).
* Support continuous multi-turn dialogue thread showing candidate speech transcripts and AI interviewer follow-ups.
* Render post-interview telemetry card:
  - **Overall Score**: (1–10)
  - **Technical Depth Rating**: (High/Medium/Low)
  - **Pacing & Conciseness**: Words per minute analysis
  - **Identified Gaps & Follow-Up Recommendations**

---

## 6. Verification & Checklist

- [ ] Execute `mock_conversations` SQL migration.
- [ ] Test 3 continuous turns of conversation with Gemini follow-up prompts.
- [ ] Verify persona prompt changes interviewer behavior as expected.
- [ ] Confirm speech-to-text integration works seamlessly via `useSpeechToText.ts`.

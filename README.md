# 🚀 Prompt Router & Enhancer (Totem Interactive Assignment)

A minimal working prototype that:

* Converts any **raw prompt** into a **production-ready enhanced prompt**
* Infers **intent**, **domain**, and **use case**
* Recommends the **best LLM** for the job
* Provides copy buttons & deep-linking to the recommended model
* Supports **LLM-powered analysis** via the OpenAI Responses API
  (with robust fallback to heuristics)

Built as part of the **Totem Interactive – AI/FE Developer Assignment**.

---

## ✨ Features

### 🔍 **1. Intent / Domain / Use-Case Inference**

* Powered by **OpenAI `gpt-4.1-mini`** via the Responses API
* Guaranteed valid JSON output using `text.format: json_object`
* Automatic fallback to **rule-based heuristics** when:

  * API key missing
  * Rate limits / API errors
  * Output can’t be parsed

### 🧠 **2. Prompt Enhancement Engine**

Every enhanced prompt follows a 5-part format:

* **ROLE** – Persona of the assistant
* **CONTEXT** – Metadata + routed LLM
* **TASK** – Clean version of the user’s request
* **CONSTRAINTS** – Safety & clarity requirements
* **STYLE** – How the model should respond

### 🤖 **3. LLM Recommendation Engine**

The system routes prompts to:

| LLM               | Provider  | Used For              |
| ----------------- | --------- | --------------------- |
| GPT-4.1           | OpenAI    | Coding, reasoning     |
| o3-mini           | OpenAI    | Fast small tasks      |
| Claude 3.5 Sonnet | Anthropic | Writing, long-context |
| Gemini 1.5 Pro    | Google    | Multilingual tasks    |
| Llama 3.1-70B     | Meta      | Open-source workflow  |

### 🧪 **4. Suggested Follow-up Prompts**

Dynamically generated follow-ups based on the inferred use case.

### 🖥️ **5. Clean, Minimal Next.js UI**

Users see:

* Original prompt
* Enhanced prompt
* Intent, Domain, Use-Case
* Recommended LLM (+ deep link)
* Copy buttons
* Follow-up suggestions

---

## 🏗️ Tech Stack

* **Next.js 14+ (Webpack mode)**
* **TypeScript**
* **OpenAI Responses API (text mode)**
* **CSS utility classes (no Tailwind required)**

---

# 📦 Project Structure

```
├── app/
│   ├── page.tsx           # UI
│   └── api/
│       └── analyze/
│           └── route.ts   # LLM-powered analysis pipeline
├── lib/
│   └── promptEngine.ts    # Heuristic analysis + enhancement engine
├── public/
├── styles/
│   └── globals.css
├── package.json
└── README.md
```

---

# ⚙️ Setup Instructions

### 1️⃣ Clone repository

```bash
git clone https://github.com/<your-username>/totem-prompt-router
cd totem-prompt-router
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create `.env.local`

```bash
OPENAI_API_KEY=your_api_key_here
```

> If you skip this, the app automatically uses **heuristic fallback mode**.

### 4️⃣ Run Development Server

```bash
npm run dev
```

Visit: **[http://localhost:3000](http://localhost:3000)**

---

# 🧭 Approach Summary

### ✔️ **Heuristic + LLM Hybrid Pipeline**

The system first attempts LLM-powered classification using:

```
client.responses.create({
  model: "gpt-4.1-mini",
  input: [...],
  text: { format: { type: "json_object" } }
})
```

This ensures:

* Always valid JSON
* Strict schema
* Deterministic classification

If anything fails → fallback:

```ts
inferIntentDomainUseCase(prompt);
```

### ✔️ **Deterministic Prompt Enhancement**

The enhancement engine (`promptEngine.ts`) applies a deterministic template so the enhanced prompt is:

* Repeatable
* Readable
* Stable
* Professional

### ✔️ **LLM Routing**

Each inferred intent/domain/use-case maps to a model chosen for:

* Strengths
* Context length
* Speed
* Use-case fit

### ✔️ **Frontend Experience**

* User enters prompt
* UI calls `/api/analyze`
* Response returned as a single `AnalysisResult` object
* All components re-render with clean UI layout

---

# ⚠️ Assumptions & Limits

* The system **does not execute** prompts — only enhances/analyzes them
* No user authentication
* No persistence/local storage
* Not optimized for mobile (desktop-first prototype)
* LLM classification **depends on OpenAI API availability**
* Heuristics are simplified and may misclassify edge prompts
* No rate-limit handling beyond fallback

---

# 🧱 Known Edge Cases

| Edge Case                      | Behavior                                  |
| ------------------------------ | ----------------------------------------- |
| Very short prompts like “why?” | Usually falls back to heuristic “Unknown” |
| Mixed-language prompts         | Gemini recommended (multilingual)         |
| Prompts with multiple tasks    | Classified by dominant keyword            |
| Malformed JSON from LLM        | Auto-fallback to heuristic                |
| Missing API key                | Entire pipeline runs heuristically        |

---

# 🎬 Optional: Demo Video Script (1–2 minutes)

Here’s a ready-made script for your screencast:

---

### **🎥 Demo Video Flow**

**1. Intro (10 seconds)**
“Hi, this is my submission for the Totem Interactive AI/FE Developer Assignment.
This tool takes a raw prompt, enhances it, classifies it, and routes it to the best LLM.”

**2. Enter Prompt (10 seconds)**
Paste a prompt like:
*“Debug my Python function that throws a key error.”*

**3. Show Loading → Result (15 seconds)**
Explain:

* “The backend calls the OpenAI Responses API using JSON mode.”
* “It infers intent, domain, and use-case.”
* “It automatically selects GPT-4.1 for coding tasks.”

**4. Scroll Enhanced Prompt (10 seconds)**
Highlight:

* ROLE
* CONTEXT
* TASK
* CONSTRAINTS
* STYLE

**5. Show Follow-ups (10 seconds)**
“These follow-ups help users refine the request.”

**6. Open LLM Button (5 seconds)**
Click it → It copies the enhanced prompt and opens ChatGPT.

**7. End (5 seconds)**
“This completes the demo. Thank you!”

---

# 🏁 Final Notes

This project fulfills every requirement listed in the assignment PDF:

✔ Context analysis (LLM + heuristics)
✔ Prompt enhancement
✔ LLM recommendation
✔ Follow-up prompts
✔ UI + copy buttons + redirection
✔ API-based pipeline
✔ Clean documentation

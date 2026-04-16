---
created: 2026-04-16
status: draft
size: L
branch: main
---

# Tech Spec: ЛитКлуб

## Overview

Интерактивный учебник по школьной литературе с геймификацией и AI-дискуссиями.

## Architecture

### Frontend
- **Type:** Static HTML/CSS/JS site
- **Host:** GitHub Pages
- **Reference:** Умняшка (similar structure)

### Storage
- **Type:** LocalStorage (client-side only)
- **Schema:**
  - `litclub_progress`: {xp, level, achievements[], streak, lastVisit}
  - `litclub_read`: [workIds] — прочитанные произведения
  - `litclub_completed_quests`: [questIds] — пройденные квесты
  - `litclub_discussions`: [{workId, messages[]}] — история чатов

### AI Integration
- **Provider:** Google Gemini API
- **Key:** AIzaSyBHLrG7bIUlU9h1AYLcyUbAuReM_YGJyY0 (shared)
- **Model:** gemini-2.5-flash
- **Usage:** Literary discussion chat with context about specific works

### Assets
- **Images:** CSS-generated backgrounds + SVG icons
- **Unique visuals:** 10+ custom backgrounds for top works

## Component Structure

```
litclub-site/
├── index.html              # Landing with class selection
├── profile.html            # User profile, XP, achievements
├── discuss.html            # AI chat interface
├── grades/
│   ├── 5/index.html        # 5th grade works list
│   ├── 6/index.html        # 6th grade works list
│   └── ... (7-11)
├── works/                  # Individual work pages
│   └── [grade]/[slug].html
├── quest/                  # Visual novels
│   └── [grade]/[slug]/
├── css/
│   ├── base.css           # Library theme colors
│   ├── components.css     # Cards, buttons, navigation
│   └── quest.css          # Visual novel styles
├── js/
│   ├── storage.js         # LocalStorage API
│   ├── gemini.js          # Gemini API integration
│   ├── quest-engine.js    # Visual novel engine
│   └── ui.js              # Common UI helpers
└── data/
    └── works.json         # All works database
```

## Color Palette (Library Theme)

```css
:root {
  --color-primary: #8B4513;      /* Saddle brown - wood */
  --color-secondary: #2E8B57;    /* Sea green - leather */
  --color-accent: #DAA520;       /* Goldenrod - gold */
  --color-cream: #FFF8DC;        /* Cornsilk - paper */
  --color-dark: #3D2914;         /* Dark brown - shadows */
  --color-text: #2C1810;         /* Text color */
  --color-text-light: #5C4033;   /* Secondary text */
}
```

## Key Technical Decisions

### 1. No Backend
**Why:** Simpler deployment, no hosting costs, works offline after load
**Trade-off:** Progress not synced across devices

### 2. LocalStorage for Progress
**Why:** Instant persistence, no auth needed
**Risk:** Data lost on browser clear
**Mitigation:** Future export/import feature

### 3. Gemini for Discussions
**Why:** Already have key, good Russian, fast
**Prompt strategy:** System prompt includes work context (title, author, summary)

### 4. Visual Novel Engine
**Simple JSON format:**
```json
{
  "scenes": [
    {
      "id": "start",
      "bg": "/img/library.jpg",
      "text": "Вы стоите перед старинным особняком...",
      "choices": [
        {"text": "Войти", "next": "enter"},
        {"text": "Уйти", "next": "leave"}
      ]
    }
  ]
}
```

## Data Schema

### works.json
```json
{
  "works": [
    {
      "id": "geroi-nashego-vremeni",
      "grade": 8,
      "title": "Герой нашего времени",
      "author": "М.Ю. Лермонтов",
      "year": 1840,
      "type": "romance",
      "summary": "...",
      "authorBio": "...",
      "essays": ["...", "..."],
      "hasQuest": true,
      "xp": 100
    }
  ]
}
```

## API Integration

### Gemini Chat
```javascript
async function discussWithAI(workId, userMessage, history) {
  const work = getWork(workId);
  const systemPrompt = `Ты литературовед. Обсуждаем "${work.title}" ${work.author}. 
    Отвечай на вопросы по содержанию, образам, символизму. 
    Кратко, 2-3 предложения, на понятном школьнику языке.`;
  
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    })
  });
  return response.json();
}
```

## Implementation Waves

### Wave 1: Foundation (1-2 days)
- [ ] Project structure and base CSS
- [ ] index.html with hero and class selection
- [ ] Navigation and layout components
- [ ] LocalStorage helper module

### Wave 2: Content (2-3 days)
- [ ] works.json with 10+ works
- [ ] Grade index pages (5-11)
- [ ] Work detail pages (summary, bio, essays)
- [ ] Profile page with XP system

### Wave 3: AI Integration (1-2 days)
- [ ] Gemini API integration
- [ ] discuss.html interface
- [ ] Chat history persistence
- [ ] Context-aware prompts

### Wave 4: Visual Novels (2-3 days)
- [ ] Quest engine (JSON → interactive story)
- [ ] 5 visual novels for top works
- [ ] Branching logic and endings
- [ ] XP rewards for completion

### Wave 5: Polish (1-2 days)
- [ ] Responsive design
- [ ] Animations and transitions
- [ ] Achievement system
- [ ] GitHub Pages deployment

## Testing Strategy

- **Manual:** Cross-browser testing (Chrome, Firefox, Safari, mobile)
- **LocalStorage:** Verify persistence across sessions
- **Gemini:** Test rate limits and error handling
- **Performance:** Lighthouse audit target 90+ score

## Deployment

1. Push to GitHub repo
2. Enable GitHub Pages (branch: main, folder: /root)
3. Verify at https://zemale.github.io/litclub-site/

## Acceptance Criteria

- [ ] Site loads on GitHub Pages
- [ ] All 6 grades (5-11) accessible
- [ ] 10+ works with full content
- [ ] Gemini chat works for any work
- [ ] XP system functional
- [ ] 5+ visual novels playable
- [ ] Mobile responsive
- [ ] Library aesthetic matches design

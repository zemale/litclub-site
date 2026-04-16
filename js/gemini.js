// ===== Gemini API Integration =====
const GEMINI_API_KEY = 'AIzaSyBHLrG7bIUlU9h1AYLcyUbAuReM_YGJyY0';
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const GeminiAPI = {
  // System prompts for different discussion modes
  getSystemPrompt(work) {
    return `Ты — литературовед и школьный учитель литературы. Сейчас обсуждаем произведение "${work.title}" автора ${work.author}.

Твоя задача:
1. Отвечать на вопросы по содержанию, образам, темам произведения
2. Помогать понять смысл, символизм, авторскую позицию
3. Подсказывать аргументы для сочинений
4. Объяснять сложные места простым языком
5. Задавать наводящие вопросы для развития критического мышления

Правила:
- Отвечай кратко, 2-4 предложения
- Используй понятный школьнику язык
- Если спрашивают про сочинение — предлагай 2-3 аргумента
- Не пиши готовые сочинения целиком — только план и аргументы
- Можешь цитировать текст, но не пересказывать всё произведение

Краткая информация о произведении:
Жанр: ${work.type || 'не указан'}
${work.summary ? `Содержание: ${work.summary.substring(0, 200)}...` : ''}`;
  },

  // Send message to Gemini
  async sendMessage(work, userMessage, history = []) {
    const systemPrompt = this.getSystemPrompt(work);
    
    // Format history for Gemini
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });
    
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.9
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Gemini API error:', error);
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Error calling Gemini:', error);
      return 'Извини, произошла ошибка при обработке запроса. Попробуй задать вопрос иначе или повтори позже.';
    }
  },

  // Quick question without history
  async askQuick(work, question) {
    return this.sendMessage(work, question, []);
  },

  // Generate essay outline
  async generateEssayOutline(work, topic) {
    const prompt = `Помоги составить план сочинения на тему "${topic}" по произведению "${work.title}" ${work.author}.

Дай:
1. Тезис (основная мысль)
2. 2-3 аргумента с примерами из текста
3. Вывод

Формат: кратко, пунктами.`;

    return this.sendMessage(work, prompt, []);
  },

  // Explain character
  async explainCharacter(work, characterName) {
    const prompt = `Расскажи об образе ${characterName} в произведении "${work.title}". 

Что важно знать:
- Кто это (краткая характеристика)
- Ключевые черты характера
- Роль в произведении
- Цитаты, которые характеризуют героя

Кратко, для подготовки к уроку.`;

    return this.sendMessage(work, prompt, []);
  },

  // Compare with other work
  async compareWorks(work1, work2) {
    const prompt = `Сравни произведения "${work1.title}" и "${work2.title}".

Укажи:
1. Общие темы
2. Сходства главных героев
3. Различия в идеях авторов
4. Что почерпнуть для сочинения на сравнение

Кратко, пунктами.`;

    return this.sendMessage(work1, prompt, []);
  }
};

// Make available globally
window.GeminiAPI = GeminiAPI;
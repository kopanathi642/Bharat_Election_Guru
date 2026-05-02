// ======================== APP INITIALIZATION ========================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroStats();
  initTimeline();
  initFlashcards();
  initQuiz();
  initInfo();
  initChat();
  initScrollAnimations();
});

// ======================== NAVBAR ========================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveNav();
  });

  mobileBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    mobileBtn.classList.toggle('active');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      mobileBtn.classList.remove('active');
    });
  });
}

function updateActiveNav() {
  const sections = document.querySelectorAll('.section');
  const links = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.id;
  });
  links.forEach(l => {
    l.classList.remove('active');
    if (l.dataset.section === current) l.classList.add('active');
  });
}

// ======================== HERO STATS COUNTER ========================
function initHeroStats() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) observer.observe(statsSection);
}

function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// ======================== TIMELINE ========================
function initTimeline() {
  const container = document.getElementById('timelineContainer');
  timelineData.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.style.transitionDelay = `${i * 0.1}s`;
    el.innerHTML = `
      <div class="timeline-dot">${item.icon}</div>
      <div class="timeline-card">
        <span class="timeline-step">Step ${item.step}</span>
        <h3 class="timeline-title">${item.title}</h3>
        <span class="timeline-date">${item.date}</span>
        <p class="timeline-desc">${item.desc}</p>
      </div>
    `;
    container.appendChild(el);
  });
}

// ======================== FLASHCARDS ========================
let currentCardPage = 0;
const cardsPerPage = 6;
let flashcardOrder = [];

function initFlashcards() {
  flashcardOrder = flashcardData.map((_, i) => i);
  renderFlashcards();

  document.getElementById('prevCardBtn').addEventListener('click', () => {
    if (currentCardPage > 0) { currentCardPage--; renderFlashcards(); }
  });
  document.getElementById('nextCardBtn').addEventListener('click', () => {
    const maxPage = Math.ceil(flashcardOrder.length / cardsPerPage) - 1;
    if (currentCardPage < maxPage) { currentCardPage++; renderFlashcards(); }
  });
  document.getElementById('shuffleBtn').addEventListener('click', () => {
    for (let i = flashcardOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flashcardOrder[i], flashcardOrder[j]] = [flashcardOrder[j], flashcardOrder[i]];
    }
    currentCardPage = 0;
    renderFlashcards();
  });
}

function renderFlashcards() {
  const grid = document.getElementById('flashcardGrid');
  const start = currentCardPage * cardsPerPage;
  const end = Math.min(start + cardsPerPage, flashcardOrder.length);
  const totalPages = Math.ceil(flashcardOrder.length / cardsPerPage);

  document.getElementById('cardCounter').textContent = `Page ${currentCardPage + 1} / ${totalPages}`;

  grid.innerHTML = '';
  for (let i = start; i < end; i++) {
    const card = flashcardData[flashcardOrder[i]];
    const el = document.createElement('div');
    el.className = 'flashcard';
    el.style.animationDelay = `${(i - start) * 0.1}s`;
    el.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <h3>${card.front}</h3>
          <span class="flip-hint">Click to reveal</span>
        </div>
        <div class="flashcard-back">
          <p>${card.back}</p>
        </div>
      </div>
    `;
    el.addEventListener('click', () => el.classList.toggle('flipped'));
    grid.appendChild(el);
  }
}

// ======================== QUIZ ========================
let quizState = { current: 0, score: 0, answered: false };

function initQuiz() {
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const card = document.getElementById('quizQuestionCard');
  const q = quizData[quizState.current];
  const total = quizData.length;

  document.getElementById('quizProgressFill').style.width = `${((quizState.current) / total) * 100}%`;
  document.getElementById('quizProgressText').textContent = `Question ${quizState.current + 1} / ${total}`;

  quizState.answered = false;
  card.innerHTML = `
    <h3 class="quiz-question">${q.q}</h3>
    <div class="quiz-options">
      ${q.options.map((opt, i) => `
        <button class="quiz-option" data-index="${i}" onclick="selectAnswer(${i})">${opt}</button>
      `).join('')}
    </div>
    <div class="quiz-actions">
      <button class="btn btn-primary hidden" id="quizNextBtn" onclick="nextQuestion()">
        ${quizState.current < total - 1 ? 'Next Question →' : 'See Results 🎉'}
      </button>
    </div>
  `;
}

function selectAnswer(index) {
  if (quizState.answered) return;
  quizState.answered = true;
  const correct = quizData[quizState.current].answer;
  const options = document.querySelectorAll('.quiz-option');

  options.forEach((opt, i) => {
    opt.classList.add('disabled');
    if (i === correct) opt.classList.add('correct');
    if (i === index && index !== correct) opt.classList.add('wrong');
  });

  if (index === correct) quizState.score++;
  document.getElementById('quizNextBtn').classList.remove('hidden');
}

function nextQuestion() {
  quizState.current++;
  if (quizState.current >= quizData.length) {
    showResults();
  } else {
    renderQuizQuestion();
  }
}

function showResults() {
  document.getElementById('quizQuestionCard').classList.add('hidden');
  document.getElementById('quizProgressFill').style.width = '100%';
  const total = quizData.length;
  const pct = Math.round((quizState.score / total) * 100);

  let emoji, msg;
  if (pct >= 90) { emoji = '🏆'; msg = 'Outstanding! You\'re an election expert!'; }
  else if (pct >= 70) { emoji = '🌟'; msg = 'Great job! You know your elections well!'; }
  else if (pct >= 50) { emoji = '👍'; msg = 'Good effort! Keep learning!'; }
  else { emoji = '📚'; msg = 'Keep studying! Review the flashcards and try again.'; }

  const result = document.getElementById('quizResultCard');
  result.classList.remove('hidden');
  result.innerHTML = `
    <div style="font-size:4rem;">${emoji}</div>
    <div class="result-score">${quizState.score} / ${total}</div>
    <p class="result-message">${msg} (${pct}%)</p>
    <button class="btn btn-primary" onclick="restartQuiz()">🔄 Retake Quiz</button>
  `;
}

function restartQuiz() {
  quizState = { current: 0, score: 0, answered: false };
  document.getElementById('quizResultCard').classList.add('hidden');
  document.getElementById('quizQuestionCard').classList.remove('hidden');
  renderQuizQuestion();
}

// ======================== INFO TABS ========================
function initInfo() {
  renderInfoTab('types');
  document.querySelectorAll('.info-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.info-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderInfoTab(tab.dataset.tab);
    });
  });
}

function renderInfoTab(key) {
  const data = infoData[key];
  const container = document.getElementById('infoContent');
  container.innerHTML = data.content.map((item, i) => `
    <div class="info-card" style="animation-delay: ${i * 0.08}s">
      <h3>${item.heading}</h3>
      <p>${item.text}</p>
    </div>
  `).join('');
}

// ======================== CHAT ASSISTANT ========================
function initChat() {
  document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    addChatMessage(msg, 'user');
    input.value = '';

    // Show typing indicator
    const typingId = showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator(typingId);
      const answer = getAssistantAnswer(msg);
      addBotMessage(answer.text, answer.suggestions);
    }, 800 + Math.random() * 600);
  });
}

function askSuggestion(text) {
  document.getElementById('chatInput').value = text;
  document.getElementById('chatForm').dispatchEvent(new Event('submit'));
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-message bot';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="chat-avatar">🗳️</div>
    <div class="chat-bubble"><p style="color:var(--text-muted)">Thinking<span class="typing-dots">...</span></p></div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return 'typing-indicator';
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function addChatMessage(text, type) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-message ${type}`;
  const avatar = type === 'bot' ? '🗳️' : '👤';
  const formatted = formatBotText(text);
  div.innerHTML = `
    <div class="chat-avatar">${avatar}</div>
    <div class="chat-bubble"><p>${formatted}</p></div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addBotMessage(text, suggestions) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-message bot';
  const formatted = formatBotText(text);
  
  let chipsHTML = '';
  if (suggestions && suggestions.length > 0) {
    chipsHTML = `<div class="suggestion-chips" style="margin-top:12px;">
      ${suggestions.map(s => `<button class="chip" onclick="askSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`).join('')}
    </div>`;
  }
  
  div.innerHTML = `
    <div class="chat-avatar">🗳️</div>
    <div class="chat-bubble"><p>${formatted}</p>${chipsHTML}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function formatBotText(text) {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/• /g, '&bull; ');
}

function getAssistantAnswer(query) {
  const q = query.toLowerCase().trim();
  
  // Handle greetings
  const greetings = ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'hii', 'hiii', 'helo', 'hola', 'yo', 'sup', 'good morning', 'good evening', 'good afternoon', 'howdy'];
  if (greetings.some(g => q === g || q === g + '!' || q === g + '.')) {
    return {
      text: "Namaste! 🙏 Welcome to **Bharat Election Guru**!\n\nI'm here to help you learn everything about the Indian Election System. Here are some topics you can explore:\n\n• 📋 **Complete Election Process** — All 10 steps from start to finish\n• 🗳️ **How to Vote** — Registration, booth operations, EVMs\n• 🏛️ **Parliament** — Lok Sabha, Rajya Sabha, how laws are made\n• ⚖️ **Election Rules** — MCC, campaigning, expenditure limits\n• 🏆 **After Elections** — Government formation, PM/CM appointment\n\nJust ask me anything or tap a suggestion below!",
      suggestions: ["Complete election process", "How do I register to vote?", "What is an EVM?", "How is the government formed?"]
    };
  }
  
  // Handle thank you
  const thanks = ['thank', 'thanks', 'thankyou', 'thank you', 'dhanyavaad', 'shukriya', 'ty'];
  if (thanks.some(t => q.includes(t))) {
    return {
      text: "You're welcome! 🙏 Happy to help you learn about Indian democracy. Feel free to ask more questions anytime!",
      suggestions: ["What is NOTA?", "How are votes counted?", "What is One Nation One Election?"]
    };
  }
  
  // Handle "what can you do" / help
  if (q.includes('help') || q.includes('what can you') || q.includes('what do you') || q.includes('tell me about yourself')) {
    return {
      text: "I'm your **Bharat Election Guru** — an interactive assistant that knows everything about the Indian Election System! 🇮🇳\n\nHere's what I can help with:\n\n• 📋 **Election Process** — Complete step-by-step guide\n• 🗳️ **Voting** — How EVMs work, VVPAT, polling booths, indelible ink\n• 📝 **Registration** — How to register, Form 6, NVSP, NRI voting\n• 🏛️ **Parliament** — Lok Sabha (543 seats), Rajya Sabha (245 members)\n• ⚖️ **Laws & Rules** — MCC, Anti-Defection, Election Disputes\n• 🏆 **Results** — Counting process, government formation, floor tests\n• 💰 **Money** — Election costs, electoral bonds, expenditure limits\n• 📊 **Reservation** — SC/ST/OBC/Women quotas in elections\n• 🇮🇳 **Reforms** — One Nation One Election, VVPAT verification\n\nJust type your question!",
      suggestions: ["Complete election process", "What is NOTA?", "How does a polling booth work?", "What is the reservation system?"]
    };
  }
  
  // Keyword matching with improved scoring
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of assistantKB) {
    let score = 0;
    for (const kw of entry.keywords) {
      // Check for exact word boundary matches for short keywords
      if (kw.length <= 3) {
        const regex = new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        if (regex.test(q)) score += kw.length * 2; // boost short exact matches
      } else if (q.includes(kw)) {
        score += kw.length;
      }
    }
    // Bonus: if query closely matches a keyword phrase
    for (const kw of entry.keywords) {
      if (kw.length > 4 && q.startsWith(kw)) score += 5;
      if (kw.length > 4 && q.endsWith(kw)) score += 3;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore >= 3) {
    // Generate relevant follow-up suggestions based on the topic
    const followUps = getFollowUpSuggestions(bestMatch.keywords[0]);
    return { text: bestMatch.answer, suggestions: followUps };
  }

  // Fallback
  return {
    text: "That's an interesting question! 🤔 I may not have a direct answer, but I can help you with these popular topics about Indian elections:\n\n• 📋 **Complete Election Process** — All 10 steps explained\n• 🗳️ **EVM & VVPAT** — How voting machines work\n• 🏛️ **Lok Sabha & Rajya Sabha** — Parliament structure\n• 📣 **Campaigning Rules** — What's allowed, expenditure limits\n• 🔢 **Vote Counting** — How results are determined\n• 🏆 **Government Formation** — Who becomes PM/CM\n• ⚖️ **NOTA & Anti-Defection** — Voter rights & party discipline\n• 💰 **Electoral Bonds** — Political funding\n• 📊 **Reservation System** — SC/ST/OBC/Women quotas\n\nTap a suggestion below or type a specific topic!",
    suggestions: ["Complete election process", "What is an EVM?", "How is the government formed?", "How are votes counted?", "What is the reservation system?"]
  };
}

function getFollowUpSuggestions(topicKey) {
  const suggestionMap = {
    'register': ["What is an EVM?", "How does a polling booth work?", "Can NRIs vote?"],
    'evm': ["What is VVPAT?", "How are votes counted?", "What is NOTA?"],
    'nota': ["How does the EVM work?", "What is anti-defection law?", "Complete election process"],
    'lok sabha': ["What about Rajya Sabha?", "How is the government formed?", "What is the reservation system?"],
    'rajya sabha': ["How does Lok Sabha work?", "What is the role of Speaker?", "How is the President elected?"],
    'vvpat': ["What is an EVM?", "How are votes counted?", "What is indelible ink?"],
    'mcc': ["What are campaigning rules?", "What are election disputes?", "Complete election process"],
    'eci': ["What is the role of the Governor?", "What is delimitation?", "How are parties recognized?"],
    'anti-defection': ["What is a floor test?", "Role of the Speaker?", "How is the government formed?"],
    'electoral bond': ["How much do elections cost?", "How are parties recognized?", "What is MCC?"],
    'panchayat': ["What is the reservation system?", "Types of elections in India?", "What is State Election Commission?"],
    'delimitation': ["How are Lok Sabha seats allocated?", "What is ECI?", "Complete election process"],
    'president': ["Role of the Governor?", "How is the government formed?", "What is Rajya Sabha?"],
    'how many': ["Complete election process", "How are votes counted?", "How does a polling booth work?"],
    'who can contest': ["What is the reservation system?", "How do I register to vote?", "What are election symbols?"],
    'history': ["What is NOTA?", "When were EVMs introduced?", "What is One Nation One Election?"],
    'complete process': ["How are votes counted?", "How is the government formed?", "What are campaigning rules?"],
    'campaign': ["What is MCC?", "How much do elections cost?", "Complete election process"],
    'counting': ["How is the government formed?", "What is VVPAT?", "What are election disputes?"],
    'government formation': ["What is a floor test?", "Role of the Governor?", "What is the oath process?"],
    'governor': ["How is the President elected?", "What is a floor test?", "How is the government formed?"],
    'speaker': ["What is anti-defection law?", "How does Lok Sabha work?", "What is a floor test?"],
    'reservation': ["How does Lok Sabha work?", "What are panchayat elections?", "Complete election process"],
    'booth': ["What is indelible ink?", "What is an EVM?", "How are votes counted?"],
    'ink': ["How does a polling booth work?", "What is an EVM?", "What is VVPAT?"],
    'election dispute': ["What is anti-defection law?", "Role of the Speaker?", "What is repolling?"],
    'national party': ["What are election symbols?", "How much do elections cost?", "What is ECI?"],
    'election expenditure': ["What are electoral bonds?", "What are campaigning rules?", "How are parties recognized?"],
    'nri': ["How do I register to vote?", "What is Form 6?", "Can I vote with postal ballot?"],
    'one nation one election': ["Complete election process", "How much do elections cost?", "What is delimitation?"],
    'repolling': ["What are election disputes?", "How does a polling booth work?", "What is ECI?"],
    'oath': ["How is the government formed?", "What is a floor test?", "Role of the Governor?"]
  };
  return suggestionMap[topicKey] || ["Complete election process", "How is the government formed?", "What is an EVM?"];
}

// ======================== SCROLL ANIMATIONS ========================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.timeline-item').forEach(el => observer.observe(el));
}

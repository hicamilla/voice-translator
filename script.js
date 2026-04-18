// ── Get elements from the HTML ──
const sourceLang = document.getElementById('source-lang');
const targetLang = document.getElementById('target-lang');
const swapBtn = document.getElementById('swap-btn');

// ── Swap button logic ──
swapBtn.addEventListener('click', function () {
  const temp = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = temp;
});

// ── Get the remaining elements ──
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const translateBtn = document.getElementById('translate-btn');
const statusText = document.getElementById('status-text');

// ── Translate function ──
async function translate() {
  const text = inputText.value.trim();

  if (!text) {
    statusText.textContent = 'Please enter some text first.';
    return;
  }

  const langPair = sourceLang.value + '|' + targetLang.value;
  const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=' + langPair;

  statusText.textContent = 'Translating...';
  translateBtn.disabled = true;

try {
  const response = await fetch(url);
  const data = await response.json();
  const result = data.responseData.translatedText;

  outputText.textContent = result;
  statusText.textContent = 'Done.';
} catch (error) {
  statusText.textContent = 'Something went wrong. Try again.'
  }
  translateBtn.disabled = false; 
}

// ── Translate button click ──
translateBtn.addEventListener('click', translate);

// ── Microphone ──
const micBtn = document.getElementById('mic-btn');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();

  recognition.onstart = function () {
    statusText.textContent = 'Listening...';
    micBtn.style.background = '#ef4444';
  };

  recognition.onresult = function (event) {
    const spoken = event.results[0][0].transcript;
    inputText.value = spoken;
    statusText.textContent = 'Got it. Ready to translate';
    micBtn.style.backgroundColor = '#3b82f6';
  };

  recognition.onerror = function () {
    statusText.textContent = 'Microphone error. Try again.';
    micBtn.style.backgroundColor = '#3b82f6';
  };

  recognition.onend = function () {
    if (statusText.textContent === 'Listening...') {
      statusText.textContent = 'Idle - tap mic to speak';
    }
    micBtn.style.backgroundColor = '#3b82f6';
  };

  micBtn.addEventListener('click', function () {
    recognition.lang = sourceLang.value;
    recognition.start();
  });
  
  micBtn.addEventListener('click', function () {
    statusText.textContent = 'Microphone not supported in this browser.';
  })
}
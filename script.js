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

  outputText.classList.remove('updated');
  void outputText.offsetWidth;
  outputText.textContent = result;
  outputText.style.color = '#111827';
  outputText.classList.add('updated');
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
    micBtn.classList.add('listening');
  };

  recognition.onresult = function (event) {
    const spoken = event.results[0][0].transcript;
    inputText.value = spoken;
    statusText.textContent = 'Got it. Ready to translate';
    micBtn.style.backgroundColor = '#3b82f6';
  };

  recognition.onerror = function (event) {
    if (event.error === 'not-allowed') {
      statusText.textContent = 'Microphone access denied. Please check your browser settings.';
    } else if (event.error === 'no-speech') {
      statusText.textContent = 'No speech detected. Try again.';
    } else if (event.error === 'network') {
      statusText.textContent = 'On Brave, disable "Block fingerprinting" in shields.';
    } else {
      statusText.textContent = 'Microphone error:' + event.error;
    }

    micBtn.style.backgroundColor = '#3b82f6';
    micBtn.classList.remove('listening');
    isListening = false;
  };

  recognition.onend = function () {
    isListening = false;
    if (statusText.textContent === 'Listening...') {
      statusText.textContent = 'Idle - tap mic to speak';
    }
    micBtn.style.backgroundColor = '#3b82f6';
    micBtn.classList.remove('listening');
  };

  if (navigator.permissions) {
    navigator.permissions.query({ name: 'microphone' }).then(function (result) {
      if (result.state === 'denied') {
        statusText.textContent = 'Microphone blocked. Please enable it on browser settings.';
        micBtn.style.opacity = '0.5';
        micBtn.style.cursor = 'not-allowed';
      }

      result.onchange = function () {
        if (result.stat === 'granted') {
          statusText.textContent = 'Idle - tap mic to speak';
          micBtn.style.opacity = '1';
          micBtn.style.cursor = 'pointer';
        } else if (result.state === 'denied') {
          statusText.textContent = 'Microphone blocked. Please enable in the browser settings';
          micBtn.style.opacity = '0.5';
          micBtn.style.cursor = 'not-allowed';
        }
      };
    });
  }

  let isListening = false;

  micBtn.addEventListener('click', function () {
    if (isListening) {
      recognition.stop();
      isListening = false;
    } else {
      recognition.lang = sourceLang.value;
      recognition.start();
      isListening = true;
    }
  });
} else {
  micBtn.addEventListener('click', function () {
    statusText.textContent = 'Voice input not supported. Please type instead.';
  });
}
// ── Play button ──
const playBtn = document.getElementById('play-btn');

playBtn.addEventListener('click', function () {
  const text = outputText.textContent;

  if (!text || text === 'Your translation will appear here...') {
    statusText.textContent = 'Nothing to play yet.';
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLang.value;

  utterance.onstart = function () {
    statusText.textContent = 'Done';
    playBtn.disabled = false;
  };

  window.speechSynthesis.speak(utterance);
});

// ── Register service worker ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js')
      .then(function () {
        console.log('Service worker registered.');
      })
      .catch(function (error) {
        console.log('Service worker failed:', error);
      });
  });
}
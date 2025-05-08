document.addEventListener("DOMContentLoaded", () => {
  // Fonts mapping, DOM refs, and state
  const defaultFonts = ['Playfair Display', 'Poppins'];
  const fontMap = { /* existing map */ };
  const qText = document.getElementById("quoteText"), qAuth = document.getElementById("quoteAuthor"),
        quoteBox = document.getElementById("quoteBox"), quoteMark = document.getElementById("quoteMark"),
        genBtn = document.getElementById("generateBtn"), shareBtn = document.getElementById("shareBtn"),
        copyBtn = document.getElementById("copyBtn"), themeSw = document.getElementById("themeSwitch"),
        openMenuBtn = document.getElementById("openMenuBtn"), categoryModal = document.getElementById("categoryModal"),
        closeMenuBtn = document.getElementById("closeMenuBtn"), currentCategory = document.getElementById("currentCategory"),
        categoryMenu = document.getElementById("categoryMenu"), undoBtn = document.getElementById("undoBtn"),
        feedbackBtn = document.getElementById("feedbackBtn"), feedbackModal = document.getElementById("feedbackModal"),
        closeFeedbackBtn = document.getElementById("closeFeedbackBtn"), submitFeedbackBtn = document.getElementById("submitFeedbackBtn"),
        feedbackText = document.getElementById("feedbackText");

  let categories = [], quotes = {}, authors = {}, selectedCat = "inspiration";
  let historyStack = [], currentAuthor = null, authorQuoteIndex = 0;

  // Load categories & quotes, build author index
  async function loadCategoriesAndQuotes() { /* existing code */ }
  function buildAuthorIndex(quoteList, categoryId) { /* existing code */ }

  // Render menu, including author-search autocomplete and selection
  function renderMenu() { /* existing code, with author click setting currentAuthor & resetting authorQuoteIndex */ }

  // Modal open/close for categories
  openMenuBtn.addEventListener("click", () => { renderMenu(); categoryModal.classList.add("open"); document.body.style.overflow = 'hidden'; });
  closeMenuBtn.addEventListener("click", () => { categoryModal.classList.remove("open"); document.body.style.overflow = ''; });
  categoryModal.addEventListener("click", e => { if (e.target === categoryModal) { categoryModal.classList.remove("open"); document.body.style.overflow = ''; } });

  // Display quote functions (unchanged)
  function showQuote(item, cat) { /* existing code */ }
  function displayQuote() { /* existing code uses showQuote */ }

  // Generate button handler (with history, sound, animations, author-cycle)
  genBtn.addEventListener("click", () => {
    if (qText.textContent) {
      historyStack.push({ text: qText.textContent, author: qAuth.textContent, category: selectedCat, authorName: currentAuthor });
    }
    new Audio('https://www.soundjay.com/misc/magic-chime-01.mp3').play();
    genBtn.classList.add('golden'); setTimeout(() => genBtn.classList.remove('golden'), 300);
    quoteBox.classList.add('glow'); setTimeout(() => quoteBox.classList.remove('glow'), 600);
    if (currentAuthor && authors[currentAuthor]) {
      let arr = authors[currentAuthor];
      showQuote(arr[authorQuoteIndex], arr[authorQuoteIndex].category);
      authorQuoteIndex = (authorQuoteIndex + 1) % arr.length;
    } else displayQuote();
  });

  // Undo button
  undoBtn.addEventListener("click", () => {
    if (!historyStack.length) return;
    const last = historyStack.pop(); currentAuthor = last.authorName;
    if (currentAuthor && authors[currentAuthor]) {
      let idx = authors[currentAuthor].findIndex(q => q.text === last.text);
      authorQuoteIndex = (idx + 1) % authors[currentAuthor].length;
    }
    showQuote({ text: last.text, author: last.author }, last.category);
  });

  // Share PNG
  shareBtn.addEventListener("click", () => {
    html2canvas(quoteBox, { width: 1080, height: 1080 }).then(canvas => {
      const ctx = canvas.getContext('2d');
      ctx.font = '24px Poppins'; ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillText('wordsofwisdom.in', 1080 - 200, 1080 - 20);
      canvas.toBlob(blob => {
        const file = new File([blob], 'quote.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: 'WOW Quote', text: 'Shared via WOW Quotes App' });
        } else {
          const url = URL.createObjectURL(file);
          const link = document.createElement('a'); link.href = url; link.download = 'quote.png'; link.click();
          URL.revokeObjectURL(url);
        }
      });
    });
  });

  // Copy to clipboard (existing code)
  copyBtn.addEventListener("click", /* existing code */ );

  // Feedback modal
  feedbackBtn.addEventListener("click", () => { feedbackModal.classList.add('open'); document.body.style.overflow = 'hidden'; });
  closeFeedbackBtn.addEventListener("click", () => { feedbackModal.classList.remove('open'); document.body.style.overflow = ''; });
  submitFeedbackBtn.addEventListener("click", () => {
    const comment = encodeURIComponent(feedbackText.value.trim());
    if (comment) window.location.href = `mailto:info@wordsofwisdom.in?subject=App Feedback&body=${comment}`;
    feedbackModal.classList.remove('open');
  });

  // Category selection resets author filter
  categoryMenu.querySelectorAll('.section-list a, .nested-list a').forEach(link => link.addEventListener('click', e => {
    e.preventDefault(); selectedCat = link.dataset.cat;
    currentCategory.textContent = link.textContent; currentAuthor = null; authorQuoteIndex = 0;
    closeMenu(); displayQuote();
  }));

  // Initial load
  loadCategoriesAndQuotes().then(() => displayQuote());
});

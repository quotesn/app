document.addEventListener("DOMContentLoaded", () => {
  // --- Fonts & DOM refs ---
  const defaultFonts = ['Playfair Display', 'Poppins'];
  const fontMap = { /* existing category-font map */ };

  const qText = document.getElementById("quoteText"),
        qAuth = document.getElementById("quoteAuthor"),
        quoteBox = document.getElementById("quoteBox"),
        genBtn = document.getElementById("generateBtn"),
        shareBtn = document.getElementById("shareBtn"),
        copyBtn = document.getElementById("copyBtn"),
        themeSw = document.getElementById("themeSwitch"),
        openMenuBtn = document.getElementById("openMenuBtn"),
        categoryModal = document.getElementById("categoryModal"),
        closeMenuBtn = document.getElementById("closeMenuBtn"),
        currentCategory = document.getElementById("currentCategory"),
        categoryMenu = document.getElementById("categoryMenu"),
        undoBtn = document.getElementById('undoBtn'),
        feedbackBtn = document.getElementById('feedbackBtn'),
        feedbackModal = document.getElementById('feedbackModal'),
        closeFeedbackBtn = document.getElementById('closeFeedbackBtn'),
        submitFeedbackBtn = document.getElementById('submitFeedbackBtn'),
        feedbackText = document.getElementById('feedbackText');

  let categories = [], quotes = {}, authors = {}, selectedCat = 'inspiration';
  let historyStack = [], currentAuthor = null, authorQuoteIndex = 0;

  // --- Load categories & quotes ---
  async function loadCategoriesAndQuotes() { /* unchanged */ }
  function buildAuthorIndex(list, cat) { /* unchanged */ }

  // --- Display quotes with fonts ---
  function showQuote(item, cat) {
    let fonts = fontMap[cat] || defaultFonts;
    qText.style.fontFamily = `'${fonts[0]}', serif, sans-serif`;
    qAuth.style.fontFamily = `'${fonts[1]}', serif, sans-serif`;
    const txt = item.text || item.quote || item.message;
    const by = item.author || item.by || '';
    qText.textContent = txt;
    qAuth.textContent = by ? `— ${by}` : '';
  }
  function displayQuote() {
    const arr = quotes[selectedCat];
    const rand = arr[Math.floor(Math.random() * arr.length)];
    showQuote(rand, selectedCat);
  }

  // --- Render category menu & author search ---
  function renderMenu() { /* unchanged, sets currentAuthor on author click */ }

  // --- Category modal logic ---
  openMenuBtn.addEventListener('click', () => { renderMenu(); categoryModal.classList.add('open'); document.body.style.overflow='hidden'; });
  closeMenuBtn.addEventListener('click', () => { categoryModal.classList.remove('open'); document.body.style.overflow=''; });
  categoryModal.addEventListener('click', e => { if(e.target===categoryModal) { categoryModal.classList.remove('open'); document.body.style.overflow=''; }});

  // --- Generate button ---
  genBtn.addEventListener('click', () => {
    if(qText.textContent) historyStack.push({ text:qText.textContent, author:qAuth.textContent, category:selectedCat, authorName:currentAuthor });
    new Audio('https://www.soundjay.com/misc/magic-chime-01.mp3').play();
    genBtn.classList.add('golden'); setTimeout(() => genBtn.classList.remove('golden'), 300);
    quoteBox.classList.add('glow'); setTimeout(() => quoteBox.classList.remove('glow'), 600);
    if(currentAuthor && authors[currentAuthor]) {
      const arr = authors[currentAuthor];
      showQuote(arr[authorQuoteIndex], arr[authorQuoteIndex].category);
      authorQuoteIndex = (authorQuoteIndex +1) % arr.length;
    } else displayQuote();
  });

  // --- Undo/Back button ---
  undoBtn.addEventListener('click', () => {
    if(!historyStack.length) return;
    const last = historyStack.pop(); currentAuthor = last.authorName;
    if(currentAuthor) {
      const idx = authors[currentAuthor].findIndex(q=>q.text===last.text);
      authorQuoteIndex = (idx+1) % authors[currentAuthor].length;
    }
    showQuote({ text:last.text, author:last.author }, last.category);
  });

  // --- Share as PNG ---
  shareBtn.addEventListener('click', () => {
    html2canvas(quoteBox, { width:1080, height:1080 }).then(canvas => {
      const ctx = canvas.getContext('2d'); ctx.font='24px Poppins'; ctx.fillStyle='rgba(0,0,0,0.5)';
      ctx.fillText('wordsofwisdom.in',1080-200,1080-20);
      canvas.toBlob(blob => {
        const file=new File([blob],'quote.png',{type:'image/png'});
        if(navigator.canShare?.({files:[file]})) {
          navigator.share({ files:[file], title:'WOW Quote' });
        } else {
          const url=URL.createObjectURL(file);
          const a=document.createElement('a'); a.href=url; a.download='quote.png'; a.click(); URL.revokeObjectURL(url);
        }
      });
    });
  });

  // --- Copy to clipboard ---
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(`${qText.textContent} ${qAuth.textContent}`);
  });

  // --- Feedback modal ---
  feedbackBtn.addEventListener('click', () => { feedbackModal.classList.add('open'); document.body.style.overflow='hidden'; });
  closeFeedbackBtn.addEventListener('click', () => { feedbackModal.classList.remove('open'); document.body.style.overflow=''; });
  submitFeedbackBtn.addEventListener('click', () => {
    const c=encodeURIComponent(feedbackText.value.trim());
    if(c) window.location.href=`mailto:info@wordsofwisdom.in?subject=App Feedback&body=${c}`;
    feedbackModal.classList.remove('open');
  });

  // --- Reset author on category change ---
  categoryMenu.querySelectorAll('a[data-cat]').forEach(link => link.addEventListener('click', e => {
    e.preventDefault();
    selectedCat=link.dataset.cat;
    currentCategory.textContent=link.textContent;
    currentAuthor=null; authorQuoteIndex=0;
    categoryModal.classList.remove('open'); document.body.style.overflow='';
    displayQuote();
  }));

  // --- Init ---
  loadCategoriesAndQuotes().then(() => displayQuote());
});

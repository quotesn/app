document.addEventListener("DOMContentLoaded", () => {
  // --- Fonts ---
  const defaultFonts = ['Playfair Display', 'Poppins'];
  const fontMap = {
    inspiration: ['Playfair Display', 'Poppins'],
    motivation: ['Montserrat', 'Roboto Slab'],
    positivethinking: ['Lora', 'Nunito'],
    happiness: ['Bree Serif', 'Poppins'],
    love: ['Dancing Script', 'Poppins'],
    gratitude: ['Merriweather', 'Lato'],
    resilience: ['Ubuntu', 'Open Sans'],
    courage: ['Oswald', 'Lato'],
    change: ['Quicksand', 'Roboto Slab'],
    lifelessons: ['Crimson Text', 'Nunito'],
    dreams: ['Josefin Slab', 'Poppins'],
    kindness: ['Cabin', 'Poppins'],
    beauty: ['Cormorant Garamond', 'Poppins'],
    wisdom: ['Georgia', 'Open Sans'],
    sufiwisdom: ['Noto Nastaliq Urdu', 'Poppins'],
    truth: ['Libre Baskerville', 'Poppins'],
    time: ['Abel', 'Roboto'],
    mortality: ['Spectral', 'Lora'],
    freedom: ['Merriweather', 'Roboto'],
    society: ['Fira Sans', 'Roboto Slab'],
    learning: ['EB Garamond', 'Poppins'],
    simplicity: ['Source Serif Pro', 'Nunito'],
    selfcare: ['Poppins', 'Poppins'],
    mindfulness: ['Raleway', 'Poppins'],
    selfknowledge: ['PT Serif', 'Roboto'],
    innerpeace: ['Lora', 'Poppins'],
    spirituality: ['Cormorant', 'Poppins'],
    adversity: ['Work Sans', 'Poppins'],
    urdu_aqwal: ['Noto Nastaliq Urdu', 'Noto Nastaliq Urdu'],
    urdu_ashaar: ['Noto Nastaliq Urdu', 'Noto Nastaliq Urdu'],
    goodvibes_affirmations: ['Poppins', 'Poppins'],
    goodvibes_messages: ['Poppins', 'Poppins'],
    oneword: ['Montserrat', 'Montserrat']
  };

  // --- DOM refs ---
  const qText         = document.getElementById("quoteText"),
        qAuth         = document.getElementById("quoteAuthor"),
        quoteBox      = document.getElementById("quoteBox"),
        quoteMark     = document.getElementById("quoteMark"),
        genBtn        = document.getElementById("generateBtn"),
        shareBtn      = document.getElementById("shareBtn"),
        copyBtn       = document.getElementById("copyBtn"),
        themeSw       = document.getElementById("themeSwitch"),
        openMenuBtn   = document.getElementById("openMenuBtn"),
        categoryModal = document.getElementById("categoryModal"),
        closeMenuBtn  = document.getElementById("closeMenuBtn"),
        currentCategory = document.getElementById("currentCategory"),
        categoryMenu    = document.getElementById("categoryMenu");
  let categories = [], quotes = {}, authors = {}, selectedCat = "inspiration";

  // --- Load categories and quotes dynamically ---
  async function loadCategoriesAndQuotes() {
    try {
      const catRes = await fetch('data/categories.json');
      categories = await catRes.json();

      const quotePromises = [];
      function collectCategories(catArray) {
        catArray.forEach(cat => {
          if (cat.children) collectCategories(cat.children);
          else if (cat.file) {
            quotePromises.push(
              fetch(cat.file)
                .then(res => res.json())
                .then(data => {
                  quotes[cat.id] = data;
                  buildAuthorIndex(data, cat.id);
                })
            );
          }
        });
      }
      collectCategories(categories);
      await Promise.all(quotePromises);
    } catch (err) {
      console.error('Failed to load categories or quotes:', err);
    }
  }

  function buildAuthorIndex(quoteList, categoryId) {
    quoteList.forEach(quote => {
      const by = quote.author || quote.by;
      if (by) {
        const key = by.toLowerCase().trim();
        if (!authors[key]) authors[key] = [];
        authors[key].push({
          text: quote.text || quote.quote || quote.message,
          category: categoryId
        });
      }
    });
  }

  // --- Render Categories Menu (accordion + author search) ---
  function renderMenu() {
    categoryMenu.innerHTML = "";
    function renderCategoryList(arr) {
      arr.forEach(cat => {
        if (cat.isSearch) {
          const sec = document.createElement("div");
          sec.className = "section search-section";
          sec.innerHTML = `
            <button class="section-btn">
              <i class="fa-solid fa-user section-icon"></i>
              Search by Author <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="author-search-wrapper">
              <input id="authorSearch" type="text" placeholder="Type author name…" autocomplete="off" />
              <ul id="authorList" class="suggestions-list"></ul>
            </div>`;
          categoryMenu.appendChild(sec);
        } else {
          // categories with children/subcategories...
          // (same as your existing logic)
          // ...
        }
      });
      // accordion toggles & author search binding...
      // (reuse your existing handlers)
    }
    renderCategoryList(categories);
  }

  // --- Modal Open/Close ---
  openMenuBtn.addEventListener("click", () => {
    renderMenu();
    categoryModal.classList.add("open");
    document.body.style.overflow = "hidden";
  });
  closeMenuBtn.addEventListener("click", () => {
    categoryModal.classList.remove("open");
    document.body.style.overflow = "";
  });
  categoryModal.addEventListener("click", e => {
    if (e.target === categoryModal) {
      closeMenuBtn.click();
    }
  });

  // --- Display / Show Quote with dynamic fonts ---
  function showQuote(item, cat) {
    let fonts = fontMap[cat] || defaultFonts;
    const [qFont, aFont] = fonts.length === 2 ? fonts : defaultFonts;
    qText.style.fontFamily = `'${qFont}', serif, sans-serif`;
    qAuth.style.fontFamily = `'${aFont}', serif, sans-serif`;

    const txt = item.text || item.quote || item.message;
    const by  = item.author || item.by || "";

    qText.textContent = txt;
    qAuth.textContent = (by && !/anonymous|unknown/i.test(by)) 
      ? `— ${by}` 
      : "";

    quoteMark.style.opacity = (cat === "goodvibes_affirmations") ? 0 : 0.18;
  }

  function displayQuote() {
    const pool = quotes[selectedCat] || [];
    if (!pool.length) {
      qText.textContent = "No quotes found for this category.";
      qAuth.textContent = "";
      return;
    }
    showQuote(pool[Math.floor(Math.random() * pool.length)], selectedCat);
  }

  // --- Enhanced Ripple & Touch Effects for Buttons ---
  function attachRipple(btn) {
    btn.addEventListener('click', e => {
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      r.style.width  = r.style.height = Math.max(rect.width, rect.height) + 'px';
      r.style.left   = (e.clientX - rect.left - rect.width/2) + 'px';
      r.style.top    = (e.clientY - rect.top  - rect.height/2) + 'px';
      btn.appendChild(r);
      r.addEventListener('animationend', () => r.remove(), { once: true });
    });
  }
  [genBtn, shareBtn, copyBtn].forEach(attachRipple);

  // --- Generate Button: sound + gold glow + wand animation + quote glow ---
  genBtn.addEventListener('touchstart', () => {
    genBtn.classList.add('touched');
    pressSound.currentTime = 0;
    pressSound.play();
  });
  genBtn.addEventListener('touchend', () => genBtn.classList.remove('touched'));
  genBtn.addEventListener('mousedown', () => {
    genBtn.classList.add('touched');
    pressSound.currentTime = 0;
    pressSound.play();
  });
  genBtn.addEventListener('mouseup', () => genBtn.classList.remove('touched'));

  genBtn.addEventListener("click", () => {
    displayQuote();
    // quote box glow
    quoteBox.classList.add('glow');
    setTimeout(() => quoteBox.classList.remove('glow'), 500);
  });

  // --- Share / Copy Logic ---
  shareBtn.addEventListener("click", () => {
    const txt = `${qText.textContent} ${qAuth.textContent}`.trim();
    if (navigator.share) {
      navigator.share({ title: 'WOW Quote', text: txt, url: window.location.href })
        .catch(() => window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`));
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`);
    }
  });
  copyBtn.addEventListener("click", () => {
    const txt = `${qText.textContent} ${qAuth.textContent}`.trim();
    navigator.clipboard.writeText(txt).then(() => {
      const icon = copyBtn.querySelector("i");
      const orig = icon.className;
      icon.className = "fa-solid fa-check";
      copyBtn.classList.add('copied-feedback');
      setTimeout(() => {
        icon.className = orig;
        copyBtn.classList.remove('copied-feedback');
      }, 1200);
    });
  });

  // --- Theme Switcher ---
  const saved = localStorage.getItem("wowDark") === "true";
  themeSw.checked = saved;
  document.body.classList.toggle("dark", saved);
  themeSw.addEventListener("change", () => {
    const isDark = themeSw.checked;
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("wowDark", isDark);
  });

  // --- Initialization ---
  (async () => {
    // loading overlay
    qText.textContent     = "✨ Loading Wisdom...";
    qAuth.textContent     = "";
    quoteMark.style.opacity = 0.18;
    currentCategory.textContent = "Inspiration";
    selectedCat = "inspiration";

    await loadCategoriesAndQuotes();
    renderMenu();
    
    // initial quote
    if (quotes[selectedCat]?.length) {
      showQuote(quotes[selectedCat][Math.floor(Math.random() * quotes[selectedCat].length)], selectedCat);
    } else {
      qText.textContent = "No inspiration quotes found. Please check your data.";
    }
  })();
});

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
  const qText = document.getElementById("quoteText"),
    qAuth = document.getElementById("quoteAuthor"),
    quoteBox = document.getElementById("quoteBox"),
    quoteMark = document.getElementById("quoteMark"),
    genBtn = document.getElementById("generateBtn"),
    shareBtn = document.getElementById("shareBtn"),
    copyBtn = document.getElementById("copyBtn"),
    undoBtn = document.getElementById("undoBtn"),
    themeSw = document.getElementById("themeSwitch"),
    openMenuBtn = document.getElementById("openMenuBtn"),
    categoryModal = document.getElementById("categoryModal"),
    closeMenuBtn = document.getElementById("closeMenuBtn"),
    currentCategory = document.getElementById("currentCategory"),
    categoryMenu = document.getElementById("categoryMenu");

  let categories = [];
  let quotes = {};
  let authors = {};
  let selectedCat = "inspiration";

  // --- Undo Feature (NEW) ---
  let quoteHistory = [];
  let currentQuote = null;

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
        const authorKey = by.toLowerCase().trim();
        if (!authors[authorKey]) authors[authorKey] = [];
        authors[authorKey].push({ text: quote.text || quote.quote || quote.message, category: categoryId });
      }
    });
  }

  // --- Render Categories Menu ---
  function renderMenu() {
    if (!categoryMenu) return;
    categoryMenu.innerHTML = "";
    function renderCategoryList(catArray, parentUl) {
      catArray.forEach(cat => {
        if (cat.isSearch) {
          // Search by Author section
          const sec = document.createElement("div");
          sec.className = "section search-section";
          sec.innerHTML = ``;
          categoryMenu.appendChild(sec);
        } else {
          const sec = document.createElement("div");
          sec.className = "section";
          sec.innerHTML = ``;
          categoryMenu.appendChild(sec);
        }
      });
    }
    renderCategoryList(categories, categoryMenu);
  }

  // --- Show Random Quote from current category ---
  function showRandomQuote() {
    const quoteArr = quotes[selectedCat] || [];
    if (!quoteArr.length) {
      setQuote({ text: "No quotes found for this category.", author: "" });
      return;
    }
    let newQuote;
    do {
      newQuote = quoteArr[Math.floor(Math.random() * quoteArr.length)];
    } while (currentQuote && newQuote && (newQuote.text || newQuote.quote || newQuote.message) === (currentQuote.text || currentQuote.quote || currentQuote.message) && quoteArr.length > 1);
    setQuote(newQuote);
  }

  // --- Set Quote (modular, used everywhere) ---
  function setQuote(quoteObj, pushToHistory = true) {
    // --- Undo logic: push current quote to history unless restoring from Undo ---
    if (pushToHistory && currentQuote) {
      quoteHistory.push(currentQuote);
      if (quoteHistory.length > 3) quoteHistory.shift();
    }
    const text = quoteObj.text || quoteObj.quote || quoteObj.message || "";
    const author = quoteObj.author || quoteObj.by || "";
    qText.textContent = text;
    qAuth.textContent = author ? `- ${author}` : "";
    currentQuote = quoteObj;
    // Font change (optional, based on category)
    const fonts = fontMap[selectedCat] || defaultFonts;
    qText.style.fontFamily = fonts[0] + ", " + fonts[1] + ", serif";
  }

  // --- Generate Quote Handler ---
  genBtn && genBtn.addEventListener("click", () => {
    showRandomQuote();
  });

  // --- Undo Handler (NEW) ---
  undoBtn && undoBtn.addEventListener("click", () => {
    if (quoteHistory.length === 0) return;
    const prevQuote = quoteHistory.pop();
    setQuote(prevQuote, false);
  });

  // --- Share & Copy logic (unchanged) ---
  shareBtn && shareBtn.addEventListener("click", () => {
    const text = `${qText.textContent} ${qAuth.textContent}`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      alert('Sharing is not supported in this browser.');
    }
  });

  copyBtn && copyBtn.addEventListener("click", () => {
    const text = `${qText.textContent} ${qAuth.textContent}`;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.classList.add('copied-feedback');
      setTimeout(() => copyBtn.classList.remove('copied-feedback'), 800);
    });
  });

  // --- Category Modal logic (unchanged) ---
  openMenuBtn && openMenuBtn.addEventListener("click", () => {
    if (categoryModal) categoryModal.classList.add("open");
    renderMenu();
  });
  closeMenuBtn && closeMenuBtn.addEventListener("click", () => {
    if (categoryModal) categoryModal.classList.remove("open");
  });

  // --- Theme Toggle (unchanged, but modern) ---
  if (themeSw) {
    if (localStorage.getItem('wow-theme') === 'dark') {
      document.body.classList.add('dark');
      themeSw.checked = true;
    }
    themeSw.addEventListener('change', () => {
      if (themeSw.checked) {
        document.body.classList.add('dark');
        localStorage.setItem('wow-theme', 'dark');
      } else {
        document.body.classList.remove('dark');
        localStorage.setItem('wow-theme', 'light');
      }
    });
  }

  // --- Initial Load ---
  (async function init() {
    await loadCategoriesAndQuotes();
    // Set initial category and quote
    if (categories.length > 0) {
      let firstCatId = selectedCat;
      function findFirstCat(catArray) {
        for (const cat of catArray) {
          if (cat.file) return cat.id;
          if (cat.children) {
            const found = findFirstCat(cat.children);
            if (found) return found;
          }
        }
      }
      firstCatId = findFirstCat(categories) || selectedCat;
      selectedCat = firstCatId;
      currentCategory.textContent = (categories.find(c => c.id === firstCatId)?.name) || firstCatId;
      showRandomQuote();
    } else {
      setQuote({ text: "Loading categories failed.", author: "" });
    }
  })();
});

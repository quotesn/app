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
    genBtn = document.getElementById("generateBtn"),
    shareBtn = document.getElementById("shareBtn"),
    copyBtn = document.getElementById("copyBtn"),
    undoBtn = document.getElementById("undoBtn"),
    themeSw = document.getElementById("themeSwitch"),
    openMenuBtn = document.getElementById("openMenuBtn"),
    categoryModal = document.getElementById("categoryModal"),
    closeMenuBtn = document.getElementById("closeMenuBtn"),
    currentCategory = document.getElementById("currentCategory"),
    categoryMenu = document.getElementById("categoryMenu"),
    authorSearchInput = document.getElementById("authorSearchInput"),
    authorSuggestions = document.getElementById("authorSuggestions"),
    feedbackBtn = document.getElementById("feedbackBtn"),
    feedbackModal = document.getElementById("feedbackModal"),
    closeFeedbackBtn = document.getElementById("closeFeedbackBtn"),
    feedbackForm = document.getElementById("feedbackForm"),
    feedbackText = document.getElementById("feedbackText");

  let categories = [];
  let quotes = {};
  let authors = {};
  let selectedCat = "inspiration";
  let previousQuote = null;
  let displayMode = "category"; // or "author"
  let authorQuotes = [];
  let currentAuthorQuoteIndex = 0;

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
      renderMenu();
      generateQuote();
    } catch (err) {
      qText.textContent = "Failed to load quotes. Please refresh.";
      qAuth.textContent = "";
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
    categoryMenu.innerHTML = "";
    function renderCategoryList(catArray, parentUl) {
      catArray.forEach(cat => {
        if (cat.isSearch) {
          // Search by Author section
          // Already present in modal, so skip here
        } else {
          const li = document.createElement("li");
          li.className = "category-item";
          li.innerHTML = `<span>${cat.icon ? `<i class="${cat.icon}"></i>` : ""}${cat.name}</span>`;
          li.addEventListener("click", () => {
            selectedCat = cat.id;
            currentCategory.textContent = cat.name;
            categoryModal.classList.remove("open");
            generateQuote();
          });
          if (parentUl) parentUl.appendChild(li);
          else categoryMenu.appendChild(li);
          if (cat.children) {
            const ul = document.createElement("ul");
            ul.className = "nested-list";
            li.appendChild(ul);
            renderCategoryList(cat.children, ul);
          }
        }
      });
    }
    // Build a flat list for categories (no deep nesting for clarity)
    const ul = document.createElement("ul");
    ul.className = "section-list";
    renderCategoryList(categories, ul);
    categoryMenu.appendChild(ul);
  }

  // --- Font application ---
  function applyCategoryFont(cat) {
    const fonts = fontMap[cat] || defaultFonts;
    qText.style.fontFamily = fonts[0] + ', serif, sans-serif';
    qAuth.style.fontFamily = fonts[1] + ', serif, sans-serif';
  }

  // --- Quote Generation ---
  function generateQuote() {
    if (qText.textContent && qAuth.textContent) {
      previousQuote = {
        text: qText.textContent,
        author: qAuth.textContent,
        category: selectedCat
      };
      undoBtn.disabled = false;
      undoBtn.setAttribute("aria-disabled", "false");
    }
    displayMode = "category";
    let catQuotes = quotes[selectedCat] || [];
    if (!catQuotes.length) {
      qText.textContent = "No quotes found for this category.";
      qAuth.textContent = "";
      return;
    }
    const idx = Math.floor(Math.random() * catQuotes.length);
    const quote = catQuotes[idx];
    qText.textContent = quote.text || quote.quote || quote.message;
    qAuth.textContent = quote.author || quote.by || "";
    applyCategoryFont(selectedCat);
    quoteBox.classList.add("quote-glow");
    setTimeout(() => quoteBox.classList.remove("quote-glow"), 800);
    authorQuotes = [];
    currentAuthorQuoteIndex = 0;
  }

  undoBtn.addEventListener("click", () => {
    if (previousQuote) {
      qText.textContent = previousQuote.text;
      qAuth.textContent = previousQuote.author;
      selectedCat = previousQuote.category;
      currentCategory.textContent = selectedCat.charAt(0).toUpperCase() + selectedCat.slice(1);
      applyCategoryFont(selectedCat);
      previousQuote = null;
      undoBtn.disabled = true;
      undoBtn.setAttribute("aria-disabled", "true");
      quoteBox.classList.add("quote-glow");
      setTimeout(() => quoteBox.classList.remove("quote-glow"), 800);
    }
  });

  // --- Generate Button Touch/Click Effects ---
  function createRipple(event) {
    const button = event.currentTarget;
    button.classList.add("touched");
    setTimeout(() => button.classList.remove("touched"), 300);
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();
    const x = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left - radius;
    const y = (event.touches ? event.touches[0].clientY : event.clientY) - rect.top - radius;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.classList.add("ripple");
    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);
    // Magic wand animation
    const wand = document.createElement("i");
    wand.classList.add("fas", "fa-magic", "wand-animation");
    button.appendChild(wand);
    setTimeout(() => { wand.remove(); }, 800);
    // Glow effect
    quoteBox.classList.add("quote-glow");
    setTimeout(() => quoteBox.classList.remove("quote-glow"), 800);
    // Play sound
    if (window.magicSound) window.magicSound.play();
  }

  window.magicSound = new Audio("https://cdn.jsdelivr.net/gh/PerplexityAI-Open/sfx-public/magic-wand-leszek_szary.mp3");
  window.magicSound.volume = 0.5;

  genBtn.addEventListener("click", (e) => {
    createRipple(e);
    if (displayMode === "author" && authorQuotes.length > 0) {
      displayAuthorQuote();
    } else {
      generateQuote();
    }
  });
  genBtn.addEventListener("touchstart", (e) => {
    createRipple(e);
    if (displayMode === "author" && authorQuotes.length > 0) {
      displayAuthorQuote();
    } else {
      generateQuote();
    }
  }, { passive: true });

  // --- Share as PNG with Watermark ---
  shareBtn.addEventListener("click", async () => {
    const watermark = document.createElement("div");
    watermark.classList.add("quote-watermark");
    watermark.textContent = "wordsofwisdom.in";
    quoteBox.appendChild(watermark);
    try {
      const canvas = await html2canvas(quoteBox, {
        backgroundColor: getComputedStyle(quoteBox).backgroundColor,
        scale: 2,
        logging: false,
        width: 1080,
        height: 1080
      });
      canvas.toBlob(async (blob) => {
        quoteBox.removeChild(watermark);
        if (navigator.share && blob) {
          const file = new File([blob], "quote.png", { type: "image/png" });
          try {
            await navigator.share({
              title: "Words of Wisdom",
              text: `${qText.textContent} - ${qAuth.textContent}`,
              files: [file]
            });
          } catch {
            downloadImage(blob);
          }
        } else {
          downloadImage(blob);
        }
      }, "image/png");
    } catch {
      quoteBox.removeChild(watermark);
      shareQuoteText();
    }
  });
  function downloadImage(blob) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "quote.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  function shareQuoteText() {
    if (navigator.share) {
      navigator.share({
        title: "Words of Wisdom",
        text: `${qText.textContent} - ${qAuth.textContent}\n\nFrom wordsofwisdom.in`
      }).catch(console.error);
    } else {
      alert(`${qText.textContent} - ${qAuth.textContent}`);
    }
  }

  // --- Copy Button ---
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(`${qText.textContent} - ${qAuth.textContent}`).then(() => {
      copyBtn.classList.add("copied-feedback");
      setTimeout(() => copyBtn.classList.remove("copied-feedback"), 1000);
    });
  });

  // --- Category Modal ---
  openMenuBtn.addEventListener("click", () => categoryModal.classList.add("open"));
  closeMenuBtn.addEventListener("click", () => categoryModal.classList.remove("open"));

  // --- Author Search ---
  authorSearchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    authorSuggestions.innerHTML = "";
    if (searchTerm.length < 2) return;
    const matchingAuthors = Object.keys(authors)
      .filter(author => author.includes(searchTerm))
      .sort()
      .slice(0, 10);
    matchingAuthors.forEach(author => {
      const li = document.createElement("li");
      li.textContent = author.charAt(0).toUpperCase() + author.slice(1);
      li.addEventListener("click", () => selectAuthor(author));
      authorSuggestions.appendChild(li);
    });
    authorSuggestions.style.display = matchingAuthors.length ? "block" : "none";
  });
  function selectAuthor(authorName) {
    authorQuotes = authors[authorName] || [];
    if (!authorQuotes.length) {
      alert("No quotes found for this author");
      return;
    }
    authorSearchInput.value = authorName;
    authorSuggestions.innerHTML = "";
    authorSuggestions.style.display = "none";
    displayMode = "author";
    currentAuthorQuoteIndex = 0;
    displayAuthorQuote();
    currentCategory.textContent = `${authorName.charAt(0).toUpperCase() + authorName.slice(1)} (${authorQuotes.length} quotes)`;
    categoryModal.classList.remove("open");
  }
  function displayAuthorQuote() {
    if (!authorQuotes.length) return;
    const quote = authorQuotes[currentAuthorQuoteIndex];
    qText.textContent = quote.text;
    qAuth.textContent = Object.keys(authors).find(a => authors[a].includes(quote)) || "";
    applyCategoryFont(quote.category);
    quoteBox.classList.add("quote-glow");
    setTimeout(() => quoteBox.classList.remove("quote-glow"), 800);
    currentAuthorQuoteIndex = (currentAuthorQuoteIndex + 1) % authorQuotes.length;
  }

  // --- Feedback Modal ---
  feedbackBtn.addEventListener("click", () => feedbackModal.classList.add("open"));
  closeFeedbackBtn.addEventListener("click", () => feedbackModal.classList.remove("open"));
  feedbackForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const feedback = feedbackText.value.trim();
    if (!feedback) return;
    const subject = encodeURIComponent("Words of Wisdom App Feedback");
    const body = encodeURIComponent(feedback);
    window.location.href = `mailto:info@wordsofwisdom.in?subject=${subject}&body=${body}`;
    feedbackModal.classList.remove("open");
    feedbackText.value = "";
  });

  // --- Theme Switch ---
  themeSw.addEventListener("change", () => {
    document.body.classList.toggle("dark", themeSw.checked);
    localStorage.setItem("wow-theme", themeSw.checked ? "dark" : "light");
  });
  const savedTheme = localStorage.getItem("wow-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeSw.checked = true;
  }
  loadCategoriesAndQuotes();
});

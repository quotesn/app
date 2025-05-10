document.addEventListener("DOMContentLoaded", () => {
  // DOM references
  const qText = document.getElementById("quoteText"),
    qAuth = document.getElementById("quoteAuthor"),
    quoteBox = document.getElementById("quoteBox"),
    quoteMark = document.getElementById("quoteMark"),
    genBtn = document.getElementById("generateBtn"),
    shareBtn = document.getElementById("shareBtn"),
    copyBtn = document.getElementById("copyBtn"),
    favBtn = document.getElementById("favBtn"),
    themeSw = document.getElementById("themeSwitch"),
    openMenuBtn = document.getElementById("openMenuBtn"),
    categoryModal = document.getElementById("categoryModal"),
    closeMenuBtn = document.getElementById("closeMenuBtn"),
    currentCategory = document.getElementById("currentCategory"),
    categoryMenu = document.getElementById("categoryMenu"),
    streakBadge = document.getElementById("streakBadge"),
    shareMenu = document.getElementById("shareMenu"),
    submitQuoteModal = document.getElementById("submitQuoteModal"),
    closeSubmitQuoteModal = document.getElementById("closeSubmitQuoteModal"),
    customQuoteForm = document.getElementById("customQuoteForm"),
    quoteFormSuccess = document.getElementById("quoteFormSuccess"),
    favModal = document.getElementById('favModal'),
    closeFavModal = document.getElementById('closeFavModal'),
    favQuotesList = document.getElementById('favQuotesList'),
    specialBanner = document.getElementById('specialBanner'),
    bannerText = document.getElementById('bannerText'),
    closeBannerBtn = document.getElementById('closeBannerBtn'),
    closeFavModalLarge = document.getElementById('closeFavModalLarge'),
    undoBtn = document.getElementById('undoBtn'),
    feedbackBtn = document.getElementById('feedbackBtn'),
    feedbackModal = document.getElementById('feedbackModal'),
    closeFeedbackModal = document.getElementById('closeFeedbackModal'),
    feedbackTextarea = document.getElementById('feedbackTextarea'),
    submitFeedbackBtn = document.getElementById('submitFeedbackBtn'),
    feedbackSuccess = document.getElementById('feedbackSuccess'),
    magicSound = document.getElementById('magicSound'),
    sharePngBtn = document.getElementById('sharePngBtn'),
    pngPreviewModal = document.getElementById('pngPreviewModal'),
    pngPreviewImg = document.getElementById('pngPreviewImg'),
    downloadPngBtn = document.getElementById('downloadPngBtn'),
    closePngPreviewModal = document.getElementById('closePngPreviewModal'),
    pngRenderBox = document.getElementById('pngRenderBox');

  let categories = [];
  let quotes = {};
  let authors = {};
  let selectedCat = null;
  let lastQuote = null;
  let quoteHistory = [];
  let authorMode = false;
  let authorQuotes = [];
  let authorName = "";
  let authorQuoteIndex = 0;
  let debounceTimer = null;

  // --- Banner themes and styles ---
  const bannerThemes = [
    {cat: "inspiration",    text: "Ignite fresh ideas to fuel your week."},
    {cat: "motivation",     text: "Power up your ambition and take the lead."},
    {cat: "positivethinking", text: "Spotlight on optimism-see possibilities."},
    {cat: "happiness",      text: "Embrace joy in every passing moment."},
    {cat: "love",           text: "Let compassion guide your connections."},
    {cat: "gratitude",      text: "Honor today with a thankful heart."},
    {cat: "resilience",     text: "Stand strong-your strength shines through."},
    {cat: "courage",        text: "Step forward with unwavering bravery."},
    {cat: "change",         text: "Welcome new paths with open arms."},
    {cat: "lifelessons",    text: "Learn, grow, and carry wisdom onward."},
    {cat: "dreams",         text: "Chase bold visions beyond the horizon."},
    {cat: "kindness",       text: "Extend a gesture that brightens someone’s day."},
    {cat: "beauty",         text: "Discover the elegance in simplicity."},
    {cat: "wisdom",         text: "Let insight illuminate your choices."},
    {cat: "sufiwisdom",     text: "Find depth in every sacred whisper."},
    {cat: "truth",          text: "Stand firm in authentic clarity."},
    {cat: "time",           text: "Value each moment’s fleeting gift."},
    {cat: "mortality",      text: "Reflect on life’s precious fragility."},
    {cat: "freedom",        text: "Celebrate the power of choice."},
    {cat: "society",        text: "Shape community with integrity."},
    {cat: "learning",       text: "Feed your mind with new discoveries."},
    {cat: "simplicity",     text: "Simplify to amplify what matters most."},
    {cat: "selfcare",       text: "Prioritize the well-being you deserve."},
    {cat: "mindfulness",    text: "Anchor yourself in this present breath."},
    {cat: "selfknowledge",  text: "Turn inward to unlock your true depth."},
    {cat: "innerpeace",     text: "Cultivate calm amid the daily rush."},
    {cat: "spirituality",   text: "Connect with what lies beyond the seen."},
    {cat: "perseverance",   text: "Advance onward-steady and unyielding."}
  ];
  const bannerStyles = {
    inspiration:    { color: "#7c5df0", icon: "💡" },
    motivation:     { color: "#ff9800", icon: "⚡" },
    positivethinking: { color: "#43b581", icon: "🌈" },
    happiness:      { color: "#ffd700", icon: "😊" },
    love:           { color: "#e57373", icon: "❤️" },
    gratitude:      { color: "#4caf50", icon: "🙏" },
    resilience:     { color: "#2196f3", icon: "🛡️" },
    courage:        { color: "#ff5722", icon: "🦁" },
    change:         { color: "#00bcd4", icon: "🔄" },
    lifelessons:    { color: "#3f51b5", icon: "📚" },
    dreams:         { color: "#9c27b0", icon: "🌠" },
    kindness:       { color: "#8bc34a", icon: "🤝" },
    beauty:         { color: "#f06292", icon: "🌸" },
    wisdom:         { color: "#607d8b", icon: "🦉" },
    sufiwisdom:     { color: "#009688", icon: "🕊️" },
    truth:          { color: "#795548", icon: "🔎" },
    time:           { color: "#607d8b", icon: "⏳" },
    mortality:      { color: "#455a64", icon: "🌑" },
    freedom:        { color: "#00bfae", icon: "🕊️" },
    society:        { color: "#ffb300", icon: "🌍" },
    learning:       { color: "#3949ab", icon: "🧠" },
    simplicity:     { color: "#bdbdbd", icon: "🍃" },
    selfcare:       { color: "#f48fb1", icon: "🛁" },
    mindfulness:    { color: "#aeea00", icon: "🧘" },
    selfknowledge:  { color: "#ab47bc", icon: "🔮" },
    innerpeace:     { color: "#81d4fa", icon: "🌊" },
    spirituality:   { color: "#ba68c8", icon: "✨" },
    perseverance:   { color: "#6d4c41", icon: "🚀" }
  };

  function capitalize(str) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  function showRotatingBanner() {
    const today = new Date();
    const startDate = new Date("2025-05-05");
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const idx = ((daysSinceStart % bannerThemes.length) + bannerThemes.length) % bannerThemes.length;
    const theme = bannerThemes[idx];
    const todayStr = today.toISOString().slice(0,10);
    const lastBannerDate = localStorage.getItem("wowBannerDate");
    if (lastBannerDate === todayStr) return;
    let bannerHTML = "";
    const style = bannerStyles[theme.cat] || {};
    if (style.icon) bannerHTML += `<span style="font-size:1.6em;margin-right:0.5em;">${style.icon}</span>`;
    bannerHTML += `<span>${theme.text}</span>`;
    bannerText.innerHTML = bannerHTML;
    specialBanner.style.display = "block";
    specialBanner.style.background = style.color ? style.color : "";
    specialBanner.style.color = "#fff";
    closeBannerBtn.onclick = () => {
      specialBanner.style.display = "none";
      localStorage.setItem("wowBannerDate", todayStr);
    };
    setTimeout(() => {
      specialBanner.style.display = "none";
    }, 8000);
    selectedCat = theme.cat;
    currentCategory.textContent = capitalize(theme.cat.replace(/_/g, " "));
    displayQuote();
    localStorage.setItem("wowBannerDate", todayStr);
  }

  // --- Caching: Try to load from localStorage first ---
  async function fetchJSON(url, cacheKey) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
      const res = await fetch(url);
      const data = await res.json();
      localStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) {
      console.error(`Failed to fetch ${url}:`, e);
      return [];
    }
  }

  // --- Load categories and quotes ---
  async function loadCategoriesAndQuotes() {
    try {
      categories = await fetchJSON('data/categories.json', 'wowCategories');
      const quotePromises = [];
      function collectCategories(catArray) {
        catArray.forEach(cat => {
          if (cat.children) collectCategories(cat.children);
          else if (cat.file) {
            quotePromises.push(
              fetchJSON(cat.file, 'wowQuotes_' + cat.id)
                .then(data => {
                  quotes[cat.id] = data;
                  buildAuthorIndex(data, cat.id);
                })
            );
          }
        });
      }
      collectCategories(categories);
      if (localStorage.getItem('userQuotes')) {
        quotes['user'] = JSON.parse(localStorage.getItem('userQuotes'));
        buildAuthorIndex(quotes['user'], 'user');
      }
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
        authors[authorKey].push({
          text: quote.text || quote.quote || quote.message,
          author: by,
          category: categoryId
        });
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
          const sec = document.createElement("div");
          sec.className = "section search-section";
          sec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-user section-icon"></i>Search by Author <i class="fa-solid fa-chevron-down"></i></button>
            <div class="author-search-wrapper">
              <input id="authorSearch" type="text" placeholder="Type author name…" autocomplete="off" />
              <ul id="authorList" class="suggestions-list"></ul>
            </div>`;
          categoryMenu.appendChild(sec);

          // --- Favorites Section: Inserted right after Search by Author ---
          const favSec = document.createElement("div");
          favSec.className = "section";
          favSec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-heart section-icon"></i>View Favorites</button>`;
          favSec.querySelector(".section-btn").addEventListener("click", () => {
            openFavoritesModal();
            closeMenu();
          });
          categoryMenu.appendChild(favSec);

          // --- My Favorites as a Category ---
          const myFavCatSec = document.createElement("div");
          myFavCatSec.className = "section";
          myFavCatSec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-heart section-icon"></i>My Favorites</button>`;
          myFavCatSec.querySelector(".section-btn").addEventListener("click", () => {
            selectedCat = "myfavorites";
            authorMode = false;
            currentCategory.textContent = "My Favorites";
            closeMenu();
            displayQuote();
          });
          categoryMenu.appendChild(myFavCatSec);

          // --- Submit a Quote Section ---
          const submitSec = document.createElement("div");
          submitSec.className = "section";
          submitSec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-plus section-icon"></i>Submit a Quote</button>`;
          submitSec.querySelector(".section-btn").addEventListener("click", () => {
            submitQuoteModal.classList.add('open');
            document.body.style.overflow = "hidden";
            customQuoteForm.reset();
            quoteFormSuccess.style.display = "none";
            closeMenu();
          });
          categoryMenu.appendChild(submitSec);

        } else {
          const sec = document.createElement("div");
          sec.className = "section";
          sec.innerHTML = `<button class="section-btn">
            ${cat.icon ? `<i class="fa-solid ${cat.icon} section-icon"></i>` : ""}
            ${cat.name} <i class="fa-solid fa-chevron-down"></i>
          </button>
          <ul class="section-list"></ul>`;
          const ul = sec.querySelector(".section-list");
          if (cat.children) {
            cat.children.forEach(child => {
              if (child.children) {
                // Subcategory
                const li = document.createElement("li");
                li.className = "has-children";
                li.innerHTML = `<span>
                  ${child.icon ? `<i class="fa-solid ${child.icon}"></i>` : ""}
                  ${child.name} <i class="fa-solid fa-caret-right"></i>
                </span>
                <ul class="nested-list"></ul>`;
                const subul = li.querySelector(".nested-list");
                child.children.forEach(sub => {
                  const subli = document.createElement("li");
                  subli.innerHTML = `<a href="#" data-cat="${sub.id}">
                    ${sub.icon ? `<i class="fa-solid ${sub.icon}"></i>` : ""}
                    ${sub.name}
                  </a>`;
                  subul.appendChild(subli);
                });
                ul.appendChild(li);
              } else {
                const li = document.createElement("li");
                li.innerHTML = `<a href="#" data-cat="${child.id}">
                  ${child.icon ? `<i class="fa-solid ${child.icon}"></i>` : ""}
                  ${child.name}
                </a>`;
                ul.appendChild(li);
              }
            });
          }
          categoryMenu.appendChild(sec);
        }
      });
    }
    renderCategoryList(categories, categoryMenu);

    // Accordion
    categoryMenu.querySelectorAll('.section-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        categoryMenu.querySelectorAll('.section').forEach(sec => {
          if (sec.querySelector('.section-btn') !== btn) sec.classList.remove('open');
        });
        btn.closest('.section').classList.toggle('open');
      });
    });
    // Subcategory toggles
    categoryMenu.querySelectorAll('.has-children > span').forEach(span => {
      span.addEventListener('click', function(e) {
        e.stopPropagation();
        const li = span.parentElement;
        li.classList.toggle('open');
      });
    });
    // Category selection
    categoryMenu.querySelectorAll('.section-list a, .nested-list a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        selectedCat = link.dataset.cat;
        authorMode = false;
        currentCategory.textContent = link.textContent.replace(/^[^\w]*([\w\s]+)/, '$1').trim();
        closeMenu();
        displayQuote();
        recordCategoryUse(selectedCat);
      });
    });

    // --- ENHANCED AUTHOR SEARCH ---
    const authorInput = categoryMenu.querySelector("#authorSearch");
    const authorList = categoryMenu.querySelector("#authorList");
    if (authorInput && authorList) {
      authorInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const q = authorInput.value.toLowerCase();
          authorList.innerHTML = "";
          if (!q) return;
          Object.keys(authors)
            .filter(name => name.includes(q))
            .sort()
            .slice(0, 10)
            .forEach(name => {
              const li = document.createElement("li");
              li.textContent = authors[name][0].author; // Display proper-cased author name
              li.addEventListener("click", () => {
                authorMode = true;
                authorName = name;
                authorQuotes = authors[name].slice(); // Copy
                authorQuoteIndex = 0;
                currentCategory.textContent = "Author: " + authors[name][0].author;
                closeMenu();
                showAuthorQuote();
              });
              authorList.appendChild(li);
            });
        }, 250);
      });
    }
  }

  // --- Modal Menu Open/Close ---
  function openMenu() {
    renderMenu();
    categoryModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    categoryModal.classList.remove("open");
    document.body.style.overflow = "";
  }
  openMenuBtn.addEventListener("click", openMenu);
  closeMenuBtn.addEventListener("click", closeMenu);
  categoryModal.addEventListener("click", function(e) {
    if (e.target === categoryModal) closeMenu();
  });

  // --- Submit Quote Modal Close ---
  closeSubmitQuoteModal.addEventListener('click', () => {
    submitQuoteModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  // --- Submit Quote Form Handling with Progress Spinner ---
  customQuoteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const submitBtn = customQuoteForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    // Show spinner and disable button
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    submitBtn.disabled = true;

    // Simulate async submission (replace with real submission if needed)
    setTimeout(() => {
      // Hide spinner, enable button, restore text
      btnSpinner.style.display = 'none';
      btnText.style.display = '';
      submitBtn.disabled = false;

      quoteFormSuccess.style.display = 'block';
      setTimeout(() => {
        quoteFormSuccess.style.display = 'none';
        submitQuoteModal.classList.remove('open');
        document.body.style.overflow = "";
      }, 1800);
      customQuoteForm.reset();
    }, 1200);
  });

  // --- Undo/Go Back for Previous Quotes ---
  function showQuote(item, cat, fromUndo = false) {
    if (!fromUndo && lastQuote) {
      quoteHistory.unshift(lastQuote);
      if (quoteHistory.length > 3) quoteHistory.length = 3;
    }
    undoBtn.style.display = quoteHistory.length > 0 ? "" : "none";
    qText.classList.add('fade-out');
    qAuth.classList.add('fade-out');
    setTimeout(() => {
      const txt = item.text || item.quote || item.message || "Quote text missing.";
      let by = item.author || item.by || "";
      by = by.replace(/^[-–-―\s]+/, "");
      if (!by || by.toLowerCase() === "anonymous" || by.toLowerCase() === "unknown") {
        qAuth.textContent = "";
      } else {
        qAuth.innerHTML = `<span style="font-size:1.3em;vertical-align:middle;">&#8213;</span> ${by}`;
      }
      qText.textContent = txt;
      quoteMark.textContent = "“";
      quoteMark.style.opacity = 0.18;
      qText.classList.remove('fade-out');
      qAuth.classList.remove('fade-out');
      lastQuote = { text: txt, author: by, category: cat };
      updateStreak();
    }, 300);
  }

  function showAuthorQuote() {
    if (!authorQuotes.length) {
      qText.textContent = "No quotes found for this author.";
      qAuth.textContent = "";
      return;
    }
    const quote = authorQuotes[authorQuoteIndex % authorQuotes.length];
    showQuote(quote, quote.category);
    authorQuoteIndex = (authorQuoteIndex + 1) % authorQuotes.length;
  }

  function displayQuote() {
    if (authorMode && authorQuotes.length > 0) {
      showAuthorQuote();
      return;
    }
    let pool = [];
    if (selectedCat === 'myfavorites') {
      pool = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    } else if (selectedCat === 'user' && quotes['user']) {
      pool = quotes['user'];
    } else {
      pool = quotes[selectedCat] || [];
      if (quotes['user']) pool = pool.concat(quotes['user']);
    }
    if (!pool.length) {
      qText.textContent = "No quotes found for this category.";
      qAuth.textContent = "";
      return;
    }
    showQuote(pool[Math.floor(Math.random() * pool.length)], selectedCat);
  }

  undoBtn.addEventListener("click", () => {
    if (quoteHistory.length > 0) {
      const prev = quoteHistory.shift();
      showQuote(prev, prev.category, true);
    }
    undoBtn.style.display = quoteHistory.length > 0 ? "" : "none";
  });

  // --- Ripple and Touch/Animation for Generate Button ---
  function triggerGenerateEffects() {
    if (magicSound) {
      magicSound.currentTime = 0;
      magicSound.play();
    }
    quoteBox.classList.add('glow');
    setTimeout(() => quoteBox.classList.remove('glow'), 400);
    const wand = genBtn.querySelector('.magic-wand-icon');
    if (wand) {
      wand.classList.add('animated');
      setTimeout(() => wand.classList.remove('animated'), 700);
    }
    genBtn.classList.add('touched');
    setTimeout(() => genBtn.classList.remove('touched'), 400);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = "50%";
    ripple.style.top = "50%";
    genBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }
  genBtn.addEventListener("click", e => {
    triggerGenerateEffects();
    displayQuote();
  });
  genBtn.addEventListener("touchstart", e => {
    triggerGenerateEffects();
    e.preventDefault();
    displayQuote();
  }, {passive: false});

  // --- Remove tap highlight for all icon-btns ---
  document.querySelectorAll('.icon-btn, .feedback-btn, .home-btn, .generate-btn').forEach(btn => {
    btn.style.webkitTapHighlightColor = "transparent";
    btn.addEventListener('touchstart', e => {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = (e.touches[0].clientX - btn.getBoundingClientRect().left) + 'px';
      ripple.style.top = (e.touches[0].clientY - btn.getBoundingClientRect().top) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }, {passive: true});
  });

  // --- Unified Share Menu Logic ---
  shareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    shareMenu.classList.toggle("open");
    document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
  });
  function closeShareMenuOnClickOutside(event) {
    if (!shareMenu.contains(event.target) && event.target !== shareBtn) {
      shareMenu.classList.remove("open");
    }
  }
  shareMenu.querySelectorAll('.share-option').forEach(btn => {
    if (btn === sharePngBtn) return; // PNG handled separately
    btn.addEventListener('click', function() {
      const textToShare = `${qText.textContent} ${qAuth.textContent}`.trim();
      let shareUrl = '';
      switch (btn.dataset.network) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(textToShare)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(textToShare)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
          break;
      }
      if (shareUrl) window.open(shareUrl, "_blank");
      shareMenu.classList.remove("open");
    });
  });

  // --- Share as PNG with Preview (includes UI for user-friendliness) ---
  async function shareQuoteAsPNG() {
    // Clone the quote box including UI for a friendly share image
    const node = quoteBox.cloneNode(true);
    node.style.width = "1080px";
    node.style.height = "1080px";
    node.style.maxWidth = "none";
    node.style.maxHeight = "none";
    node.style.position = "absolute";
    node.style.left = "-9999px";
    node.style.top = "0";
    node.style.background = document.body.classList.contains("dark") ? "#232336" : "#fff";
    node.style.color = document.body.classList.contains("dark") ? "#fff" : "#232336";
    node.style.padding = "120px 80px 160px 80px";
    node.style.display = "flex";
    node.style.flexDirection = "column";
    node.style.justifyContent = "center";
    node.style.alignItems = "center";
    node.style.borderRadius = "40px";
    // Remove fade-out if present
    node.querySelector("#quoteText")?.classList.remove("fade-out");
    node.querySelector("#quoteAuthor")?.classList.remove("fade-out");

    // Remove any tooltips, ripples, etc.
    node.querySelectorAll('.btn-tooltip, .ripple').forEach(el => el.remove());

    // Add watermark
    let watermark = node.querySelector('.png-watermark');
    if (!watermark) {
      watermark = document.createElement('div');
      watermark.className = 'png-watermark';
      watermark.textContent = "wordsofwisdom.in";
      watermark.style.position = "absolute";
      watermark.style.right = "60px";
      watermark.style.bottom = "60px";
      watermark.style.fontSize = "1.6rem";
      watermark.style.color = document.body.classList.contains("dark") ? "#ffd700" : "#7c5df0";
      watermark.style.opacity = "0.82";
      watermark.style.fontFamily = "Poppins, sans-serif";
      watermark.style.fontWeight = "bold";
      node.appendChild(watermark);
    }

    // Adjust text size dynamically
    const quoteText = node.querySelector("#quoteText");
    const authorText = node.querySelector("#quoteAuthor");
    if (quoteText) {
      quoteText.style.fontSize = "2.1rem";
      quoteText.style.textAlign = "center";
      quoteText.style.width = "100%";
      quoteText.style.wordBreak = "break-word";
      quoteText.style.lineHeight = "1.3";
      quoteText.style.marginBottom = "2.2rem";
      // Shrink font if too long
      if (quoteText.textContent.length > 180) quoteText.style.fontSize = "1.5rem";
      else if (quoteText.textContent.length > 120) quoteText.style.fontSize = "1.7rem";
    }
    if (authorText) {
      authorText.style.fontSize = "1.3rem";
      authorText.style.textAlign = "center";
      authorText.style.width = "100%";
      authorText.style.marginTop = "1.2rem";
      authorText.style.color = document.body.classList.contains("dark") ? "#ffd700" : "#7c5df0";
    }
    document.body.appendChild(node);

    // Render to PNG
    const dataUrl = await htmlToImage.toPng(node, { width: 1080, height: 1080, pixelRatio: 2 });
    document.body.removeChild(node);

    pngPreviewImg.src = dataUrl;
    pngPreviewModal.classList.add('open');
    document.body.style.overflow = "hidden";
    downloadPngBtn.onclick = async function() {
      const file = await (await fetch(dataUrl)).blob();
      const pngFile = new File([file], "wow-quote.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [pngFile] })) {
        await navigator.share({ files: [pngFile], title: "WOW Quote" });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = "wow-quote.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      pngPreviewModal.classList.remove('open');
      document.body.style.overflow = "";
    };
  }
  sharePngBtn.addEventListener('click', shareQuoteAsPNG);
  closePngPreviewModal.onclick = function() {
    pngPreviewModal.classList.remove('open');
    document.body.style.overflow = "";
  };

  // --- Copy logic ---
  copyBtn.addEventListener("click", () => {
    const textToCopy = `${qText.textContent} ${qAuth.textContent}`.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalIcon = copyBtn.querySelector("i").className;
      copyBtn.querySelector("i").className = "fa-solid fa-check";
      copyBtn.classList.add('copied-feedback');
      setTimeout(() => {
        copyBtn.querySelector("i").className = originalIcon;
        copyBtn.classList.remove('copied-feedback');
      }, 1200);
    });
  });

  // --- Favorite logic ---
  favBtn.addEventListener('click', () => {
    let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    const quote = { text: qText.textContent, author: qAuth.textContent.replace(/^[-–-―\s]+/, "") };
    favs.push(quote);
    localStorage.setItem('favQuotes', JSON.stringify(favs));
    favBtn.classList.add('copied-feedback');
    setTimeout(() => favBtn.classList.remove('copied-feedback'), 1000);
  });

  // --- Theme switcher ---
  const savedTheme = localStorage.getItem("wowDark");
  if (savedTheme === "true") {
    themeSw.checked = true;
    document.body.classList.add("dark");
  }
  themeSw.addEventListener("change", () => {
    const isDark = themeSw.checked;
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("wowDark", isDark);
  });

  // --- Gamification: Streaks ---
  function updateStreak() {
    const today = new Date().toISOString().slice(0,10);
    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    if (streak.last !== today) {
      streak.count = (streak.last === getYesterday()) ? streak.count + 1 : 1;
      streak.last = today;
      localStorage.setItem('wowStreak', JSON.stringify(streak));
    }
    showStreak(streak.count);
  }
  function getYesterday() {
    const d = new Date(); d.setDate(d.getDate()-1);
    return d.toISOString().slice(0,10);
  }
  function showStreak(count) {
    streakBadge.textContent = count > 1 ? `🔥 ${count} day streak!` : '';
  }

  // --- Custom Google Forms Feedback Submission with Progress Spinner ---
  submitFeedbackBtn.addEventListener('click', () => {
    const feedback = feedbackTextarea.value.trim();
    if (!feedback) return;
    const submitBtn = submitFeedbackBtn;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    // Show spinner and disable button
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    submitBtn.disabled = true;

    // Simulate async submission (replace with real submission if needed)
    setTimeout(() => {
      btnSpinner.style.display = 'none';
      btnText.style.display = '';
      submitBtn.disabled = false;
      feedbackSuccess.style.display = '';
      setTimeout(() => {
        feedbackSuccess.style.display = 'none';
        feedbackModal.classList.remove('open');
        document.body.style.overflow = "";
      }, 1800);
    }, 1200);

    // Uncomment and use this for real Google Forms submission:
    /*
    const formData = new FormData();
    formData.append("entry.1612485699", feedback);
    fetch("https://docs.google.com/forms/d/e/1FAIpQLSfv0KdY_skqOC2KF97FgMUqhDzAEe8Z4Jk3ZtuG6freUO-Y1A/formResponse", {
      method: "POST",
      mode: "no-cors",
      body: formData
    }).then(() => {
      btnSpinner.style.display = 'none';
      btnText.style.display = '';
      submitBtn.disabled = false;
      feedbackSuccess.style.display = '';
      setTimeout(() => {
        feedbackSuccess.style.display = 'none';
        feedbackModal.classList.remove('open');
        document.body.style.overflow = "";
      }, 1800);
    }).catch(() => {
      alert("Failed to send feedback. Please try again.");
      btnSpinner.style.display = 'none';
      btnText.style.display = '';
      submitBtn.disabled = false;
    });
    */
  });

  // --- Feedback Modal Open/Close ---
  feedbackBtn.addEventListener('click', () => {
    feedbackModal.classList.add('open');
    document.body.style.overflow = "hidden";
    feedbackTextarea.value = '';
    feedbackSuccess.style.display = 'none';
    const submitBtn = feedbackModal.querySelector('.feedback-submit-btn');
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-spinner').style.display = 'none';
    submitBtn.querySelector('.btn-text').style.display = '';
  });
  closeFeedbackModal.addEventListener('click', () => {
    feedbackModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  // --- Favorites Modal Logic ---
  function openFavoritesModal() {
    favModal.classList.add('open');
    document.body.style.overflow = "hidden";
    showFavorites();
  }
  closeFavModal.addEventListener('click', () => {
    favModal.classList.remove('open');
    document.body.style.overflow = "";
  });
  closeFavModalLarge?.addEventListener('click', () => {
    favModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  function showFavorites() {
    const favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    favQuotesList.innerHTML = favs.length
      ? favs.map((q, idx) => `
        <div class="fav-quote">
          <p>${q.text}</p>
          <p class="author">${q.author || ''}</p>
          <div class="fav-actions">
            <button onclick="removeFavorite(${idx})" title="Remove"><i class="fa-solid fa-trash"></i></button>
            <button onclick="copyFavorite('${encodeURIComponent(q.text)}','${encodeURIComponent(q.author || '')}')" title="Copy"><i class="fa-solid fa-copy"></i></button>
            <button onclick="shareFavorite('${encodeURIComponent(q.text)}','${encodeURIComponent(q.author || '')}')" title="Share"><i class="fa-solid fa-share-nodes"></i></button>
          </div>
        </div>
      `).join('')
      : "<p>No favorites yet.</p>";
  }
  window.removeFavorite = function(idx) {
    let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    favs.splice(idx, 1);
    localStorage.setItem('favQuotes', JSON.stringify(favs));
    showFavorites();
  };
  window.copyFavorite = function(text, author) {
    const t = decodeURIComponent(text);
    const a = decodeURIComponent(author);
    navigator.clipboard.writeText(`${t} ${a}`.trim());
  };
  window.shareFavorite = function(text, author) {
    const t = decodeURIComponent(text);
    const a = decodeURIComponent(author);
    const shareText = `${t} ${a}`.trim();
    if (navigator.share) {
      navigator.share({ title: 'WOW Quote', text: shareText });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
    }
  };

  // --- Accessibility: Keyboard navigation ---
  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
      categoryModal.classList.remove("open");
      submitQuoteModal.classList.remove("open");
      shareMenu.classList.remove("open");
      favModal.classList.remove("open");
      feedbackModal.classList.remove("open");
      pngPreviewModal.classList.remove("open");
      document.body.style.overflow = "";
    }
    if (e.key === "Enter" && document.activeElement === genBtn) {
      triggerGenerateEffects();
      displayQuote();
    }
  });

  // --- Category Usage Tracking ---
  function recordCategoryUse(cat) {
    let usage = JSON.parse(localStorage.getItem('catUsage') || '{}');
    usage[cat] = (usage[cat] || 0) + 1;
    localStorage.setItem('catUsage', JSON.stringify(usage));
  }
  function getTopCategory() {
    let usage = JSON.parse(localStorage.getItem('catUsage') || '{}');
    return Object.entries(usage).sort((a,b) => b[1]-a[1])[0]?.[0];
  }

  // --- Daily Quote Notifications ---
  if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
  function sendDailyQuoteNotification() {
    if (Notification.permission === 'granted') {
      const text = `${qText.textContent} ${qAuth.textContent}`.trim();
      new Notification('WOW Quote of the Day', { body: text });
    }
  }
  function scheduleDailyNotification() {
    const now = new Date();
    const target = new Date();
    target.setHours(9, 0, 0, 0);
    if (now > target) target.setDate(target.getDate() + 1);
    setTimeout(() => {
      sendDailyQuoteNotification();
      setInterval(sendDailyQuoteNotification, 24 * 60 * 60 * 1000);
    }, target - now);
  }
  scheduleDailyNotification();

  // --- Init ---
  (async function(){
    qText.textContent = "✨ Loading Wisdom...";
    qAuth.textContent = "";
    quoteMark.textContent = "“";
    quoteMark.style.opacity = 0.18;
    await loadCategoriesAndQuotes();
    renderMenu();
    showRotatingBanner();

    // Always ensure a quote is loaded
    if (!qText.textContent || qText.textContent === "✨ Loading Wisdom..." || qText.textContent === "" || qText.textContent === "No inspiration quotes found. Please check your data.") {
      selectedCat = selectedCat || "inspiration";
      currentCategory.textContent = capitalize(selectedCat.replace(/_/g, " "));
      displayQuote();
    }

    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    showStreak(streak.count);
  })();
});




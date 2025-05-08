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
        themeSw = document.getElementById("themeSwitch"),
        openMenuBtn = document.getElementById("openMenuBtn"),
        categoryModal = document.getElementById("categoryModal"),
        closeMenuBtn = document.getElementById("closeMenuBtn"),
        currentCategory = document.getElementById("currentCategory"),
        categoryMenu = document.getElementById("categoryMenu"),
        backBtn = document.getElementById("backBtn"),
        feedbackBtn = document.getElementById("feedbackBtn"),
        feedbackModal = document.getElementById("feedbackModal"),
        closeFeedback = document.querySelector(".close-feedback"),
        feedbackText = document.getElementById("feedbackText"),
        submitFeedback = document.getElementById("submitFeedback");

  let categories = [];
  let quotes = {};
  let authors = {};
  let selectedCat = "inspiration";

  let quoteHistory = [];
  let currentAuthorQuotes = [];
  let currentAuthorIndex = 0;
  let authorMode = false;
  let currentAuthorName = "";

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
        authors[authorKey].push({
          text: quote.text || quote.quote || quote.message,
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
          const sec = document.createElement("div");
          sec.className = "section search-section";
          sec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-user section-icon"></i>Search by Author <i class="fa-solid fa-chevron-down"></i></button>
            <div class="author-search-wrapper">
              <input id="authorSearch" type="text" placeholder="Type author name…" autocomplete="off" />
              <ul id="authorList" class="suggestions-list"></ul>
            </div>`;
          categoryMenu.appendChild(sec);
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

    categoryMenu.querySelectorAll('.section-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        categoryMenu.querySelectorAll('.section').forEach(sec => {
          if (sec.querySelector('.section-btn') !== btn) sec.classList.remove('open');
        });
        btn.closest('.section').classList.toggle('open');
      });
    });

    categoryMenu.querySelectorAll('.has-children > span').forEach(span => {
      span.addEventListener('click', function(e) {
        e.stopPropagation();
        const li = span.parentElement;
        li.classList.toggle('open');
      });
    });

    categoryMenu.querySelectorAll('.section-list a, .nested-list a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        selectedCat = link.dataset.cat;
        currentCategory.textContent = link.textContent.replace(/^[^\w]*([\w\s]+)/, '$1').trim();
        authorMode = false;
        currentAuthorQuotes = [];
        currentAuthorIndex = 0;
        currentAuthorName = "";
        quoteHistory = [];
        closeMenu();
        displayQuote(true);
      });
    });

    const authorInput = categoryMenu.querySelector("#authorSearch");
    const authorList = categoryMenu.querySelector("#authorList");
    if (authorInput && authorList) {
      authorInput.addEventListener("input", () => {
        const q = authorInput.value.toLowerCase();
        authorList.innerHTML = "";
        if (!q) return;
        Object.keys(authors)
          .filter(name => name.includes(q))
          .slice(0, 10)
          .forEach(name => {
            const li = document.createElement("li");
            li.textContent = name;
            li.addEventListener("click", () => {
              const found = authors[name];
              if (found && found.length) {
                currentAuthorQuotes = found;
                currentAuthorIndex = 0;
                authorMode = true;
                currentAuthorName = name;
                showQuote(currentAuthorQuotes[currentAuthorIndex], currentAuthorQuotes[currentAuthorIndex].category);
                closeMenu();
              }
              authorInput.value = "";
              authorList.innerHTML = "";
            });
            authorList.appendChild(li);
          });
      });
    }
  }

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

  function showQuote(item, cat) {
    let fonts = fontMap[cat];
    if (!Array.isArray(fonts) || fonts.length !== 2) fonts = defaultFonts;
    const [qFont, aFont] = fonts;
    const txt = item.text || item.quote || item.message || "Quote text missing.";
    const by = item.author || item.by || "";
    qText.style.fontFamily = `'${qFont}', serif, sans-serif`;
    qAuth.style.fontFamily = `'${aFont}', serif, sans-serif`;
    qText.textContent = txt;
    if (!by || by.toLowerCase() === "anonymous" || by.toLowerCase() === "unknown") {
      qAuth.textContent = "";
    } else {
      qAuth.innerHTML = `<span style="font-size:1.3em;vertical-align:middle;">&#8213;</span> ${by}`;
    }
    if (cat === "goodvibes_affirmations") {
      quoteMark.style.opacity = 0;
    } else {
      quoteMark.textContent = "“";
      quoteMark.style.opacity = 0.18;
    }
    speakQuote();
  }

  function displayQuote(pushToHistory = true) {
    if (authorMode && currentAuthorQuotes.length) {
      if (pushToHistory) quoteHistory.push({...currentAuthorQuotes[currentAuthorIndex], cat: currentAuthorQuotes[currentAuthorIndex].category});
      showQuote(currentAuthorQuotes[currentAuthorIndex], currentAuthorQuotes[currentAuthorIndex].category);
    } else {
      const pool = quotes[selectedCat] || [];
      if (!pool.length) {
        qText.textContent = "Sorry, no quotes found for this category.";
        qAuth.textContent = "";
        return;
      }
      const randomQuote = pool[Math.floor(Math.random() * pool.length)];
      if (pushToHistory) quoteHistory.push({...randomQuote, cat: selectedCat});
      showQuote(randomQuote, selectedCat);
    }
  }

  // Back button
  backBtn.addEventListener("click", () => {
    if (quoteHistory.length > 1) {
      quoteHistory.pop();
      const prev = quoteHistory[quoteHistory.length - 1];
      if (prev) showQuote(prev, prev.cat);
    }
  });

  // Generate button cycles author quotes or random
  genBtn.addEventListener("click", () => {
    if (authorMode && currentAuthorQuotes.length) {
      currentAuthorIndex = (currentAuthorIndex + 1) % currentAuthorQuotes.length;
      displayQuote(true);
    } else {
      displayQuote(true);
    }
  });

  // Ripple effect and glow on generate button touch
  genBtn.addEventListener('touchstart', () => {
    genBtn.querySelector('i').classList.add('magic-animate');
    quoteBox.classList.add('glow');
    setTimeout(() => {
      genBtn.querySelector('i').classList.remove('magic-animate');
      quoteBox.classList.remove('glow');
    }, 400);
  }, {passive: true});

  // Share as PNG with watermark
  shareBtn.addEventListener("click", () => {
    html2canvas(quoteBox, {backgroundColor: null, scale: 2}).then(canvas => {
      const ctx = canvas.getContext("2d");
      ctx.font = "bold 32px Poppins";
      ctx.fillStyle = "rgba(124,93,240,0.7)";
      ctx.textAlign = "right";
      ctx.fillText("wordsofwisdom.in", canvas.width - 40, canvas.height - 30);
      canvas.toBlob(blob => {
        if (navigator.canShare && navigator.canShare({ files: [new File([blob], "quote.png", {type: blob.type})] })) {
          navigator.share({
            files: [new File([blob], "quote.png", {type: blob.type})],
            title: "WOW Quote",
            text: qText.textContent + " " + qAuth.textContent
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "quote.png";
          a.click();
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    });
  });

  // Copy to clipboard
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

  // Theme switcher
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

  // Feedback modal
  feedbackBtn.addEventListener("click", () => feedbackModal.classList.add("open"));
  closeFeedback.addEventListener("click", () => feedbackModal.classList.remove("open"));
  submitFeedback.addEventListener("click", () => {
    const text = feedbackText.value.trim();
    if (text) {
      window.open(`mailto:your@email.com?subject=WOW%20Quotes%20Feedback&body=${encodeURIComponent(text)}`);
      feedbackModal.classList.remove("open");
      feedbackText.value = "";
    }
  });

  // Speak quote
  function speakQuote() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = qText.textContent + " " + qAuth.textContent.replace(/^―\s*/, "");
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  }

  // Ripple effect for buttons
  [genBtn, shareBtn, copyBtn].forEach(btn => {
    btn.addEventListener('click', e => {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Init
  (async function(){
    qText.textContent = "✨ Loading Wisdom...";
    qAuth.textContent = "";
    quoteMark.textContent = "“";
    quoteMark.style.opacity = 0.18;
    currentCategory.textContent = "Inspiration";
    selectedCat = "inspiration";

    await loadCategoriesAndQuotes();
    renderMenu();

    if (quotes["inspiration"] && quotes["inspiration"].length > 0) {
      const firstQuote = quotes["inspiration"][Math.floor(Math.random() * quotes["inspiration"].length)];
      quoteHistory.push({...firstQuote, cat: "inspiration"});
      showQuote(firstQuote, "inspiration");
    } else {
      qText.textContent = "No inspiration quotes found. Please check your data.";
      qAuth.textContent = "";
    }
  })();
});

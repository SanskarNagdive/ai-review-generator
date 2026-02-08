/* ================= GLOBAL VARIABLES ================= */

let selectedStars = 5;
let lastReviews = [];

/* ================= STAR RATING SYSTEM ================= */

document.querySelectorAll(".stars span").forEach(star => {
  star.addEventListener("click", () => {
    selectedStars = parseInt(star.getAttribute("data-value"));
    highlightStars(selectedStars);
  });
});

function highlightStars(value) {
  document.querySelectorAll(".stars span").forEach(star => {
    star.style.opacity =
      parseInt(star.getAttribute("data-value")) <= value ? "1" : "0.3";
  });
}

// Default 5 stars selected
highlightStars(5);

/* ================= GENERATE REVIEW ================= */

async function generateReview() {
  const doctor = document.getElementById("doctor").value.trim();
  const city = document.getElementById("city").value.trim();
  const treatment = document.getElementById("treatment").value.trim();
  const tone = document.getElementById("tone").value;
  const language = document.getElementById("language").value;
  const emoji = document.getElementById("emoji").checked;
  const length = document.getElementById("length").value;
  const loading = document.getElementById("loading");

  if (!doctor || !city || !treatment) {
    alert("Please fill all required fields.");
    return;
  }

  const payload = {
    doctor,
    city,
    treatment,
    stars: selectedStars,
    tone,
    language,
    emoji,
    length
  };

  try {
    loading.classList.remove("hidden");

    const response = await fetch("/.netlify/functions/generate-review", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    await displayReviews(result.review);

  } catch (error) {
    console.error(error);
    alert("Error generating review.");
  } finally {
    loading.classList.add("hidden");
  }
}

/* ================= DISPLAY REVIEWS ================= */

async function displayReviews(textBlock) {
  const reviewsContainer = document.getElementById("reviews");
  reviewsContainer.innerHTML = "";

  const reviewList = textBlock
    .split(/\n\s*\n/)
    .map(r => r.trim())
    .filter(r => r.length > 20);

  let uniqueReviews = [];

  reviewList.forEach(review => {
    if (!isDuplicate(review) && !isTooSimilar(review, uniqueReviews)) {
      uniqueReviews.push(review);
      lastReviews.push(review);
    }
  });

  if (uniqueReviews.length === 0) {
    alert("Duplicate detected. Regenerating...");
    generateReview();
    return;
  }

  for (let review of uniqueReviews) {
    await typeReview(review, reviewsContainer);
  }
}

/* ================= TYPING ANIMATION ================= */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeReview(text, container) {
  const div = document.createElement("div");
  div.className = "review-card";

  const p = document.createElement("p");
  div.appendChild(p);

  container.appendChild(div);

  // Typewriter effect
  for (let i = 0; i < text.length; i++) {
    p.textContent += text.charAt(i);
    await sleep(15); // typing speed
  }

  // Buttons after typing finishes
  const buttonWrapper = document.createElement("div");
  buttonWrapper.style.marginTop = "8px";
  buttonWrapper.style.display = "flex";
  buttonWrapper.style.gap = "8px";

  const copyBtn = document.createElement("button");
  copyBtn.innerText = "Copy";
  copyBtn.onclick = () => copyText(text);

  const postBtn = document.createElement("button");
  postBtn.innerText = "Post on Google";
  postBtn.onclick = () => postGoogle();

  buttonWrapper.appendChild(copyBtn);
  buttonWrapper.appendChild(postBtn);
  div.appendChild(buttonWrapper);

  await sleep(300);
}

/* ================= COPY FUNCTION ================= */

function copyText(text) {
  navigator.clipboard.writeText(text);
  alert("Copied!");
}

/* ================= POST TO GOOGLE ================= */

function postGoogle() {
  window.open(
    "https://share.google/2SJgnqVnUBYMV3awC",
    "_blank"
  );
}


/* ================= DUPLICATE CHECK ================= */

function isDuplicate(review) {
  return lastReviews.includes(review);
}

/* ================= SIMILARITY DETECTION ================= */

function isTooSimilar(newReview, existingReviews) {
  return existingReviews.some(oldReview => {
    const similarity = calculateSimilarity(newReview, oldReview);
    return similarity > 0.8; // 80% similarity threshold
  });
}

/* ================= BASIC TEXT SIMILARITY ================= */

function calculateSimilarity(str1, str2) {
  const words1 = str1.toLowerCase().split(/\W+/);
  const words2 = str2.toLowerCase().split(/\W+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));

  return intersection.size / Math.max(set1.size, set2.size);
}


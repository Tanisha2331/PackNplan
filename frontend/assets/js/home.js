// ===============================
// FIREBASE INIT
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

let myMap;

const firebaseConfig = {
  apiKey: "AIzaSyDfP1XaMtkGuBeSrl4fRw-Zi3l7_5sPm_w",
  authDomain: "packnplan-3312d.firebaseapp.com",
  projectId: "packnplan-3312d",
  storageBucket: "packnplan-3312d.firebasestorage.app",
  messagingSenderId: "976654836537",
  appId: "1:976654836537:web:4d9b292611ccd5328b3ee8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===============================
// DOM ELEMENTS
// ===============================
const accountBtn = document.getElementById("accountBtn");
const accountMenu = document.getElementById("accountMenu");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const profileBtn = document.getElementById("profileBtn");
const settingsBtn = document.getElementById("settingsBtn");
const logoutBtn = document.getElementById("logoutBtn");

const drawer = document.getElementById("drawer");
const hamburger = document.getElementById("hamburger");
const overlay = document.getElementById("overlay");

const savedTrips = document.getElementById("savedTrips");
const visitedTrips = document.getElementById("visitedTrips");

const modal = document.getElementById("msgModal");
const modalClose = document.getElementById("modalClose");
const modalLogin = document.getElementById("modalLogin");

const avatar = document.getElementById("userAvatar");
const welcomeText = document.getElementById("drawerWelcome");

// --- 2. CAROUSEL LOGIC (Kept exactly as you had it) ---
const track = document.getElementById("carouselTrack");
const container = document.querySelector(".carousel-container");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const dotsContainer = document.querySelector(".carousel-dots");

// Chatbot Elements
const chatbotTrigger = document.getElementById('chatbotTrigger');
const chatWidget = document.getElementById('chatWidget');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendChat');
// ===================================
// ALLOW "ENTER" KEY TO SEND MESSAGES
// ===================================
chatInput.addEventListener("keypress", function(event) {
  // Check if the key pressed is "Enter"
  if (event.key === "Enter") {
    // Prevent the default action (like adding a new line)
    event.preventDefault();
    // Click the send button programmatically
    sendBtn.click();
  }
});
const chatMessages = document.getElementById('chatMessages');
const closeChat = document.getElementById('closeChat');

if (chatbotTrigger) {
  chatbotTrigger.addEventListener('click', () => {
    console.log("Chatbot opened");
    chatWidget.classList.remove('hidden');
    closeDrawer();
    if (chatMessages.innerHTML.trim() === ""){
      setTimeout(() => {
        if(typeof addMessage === "function"){
        addMessage("Hello! I'm your Pack & Plan assistant, ready to turn your 'someday' into a 'Saturday.' Where should we escape to first?")
      }
      },400)
    }
  });
}
  closeChat.addEventListener('click', () => {
  chatWidget.classList.add('hidden');
});


// ===============================
// AUTH UI HANDLER
// ===============================
function updateUI(user) {
  const guestEls = document.querySelectorAll(".guest-only");
  const userEls = document.querySelectorAll(".user-only");

  if (user) {
    // LOGGED IN
    const name =
      user.displayName ||
      localStorage.getItem("userName") ||
      user.email.split("@")[0];

    accountBtn.innerHTML = `<span class="profile-circle">${name[0].toUpperCase()}</span>`;
    avatar.textContent = name[0].toUpperCase();
    welcomeText.textContent = `Welcome ${name}!`;

    guestEls.forEach(el => el.classList.add("hidden"));
    userEls.forEach(el => el.classList.remove("hidden"));

  } else {
    // GUEST
    accountBtn.textContent = "Account";
    avatar.textContent = "G";
    welcomeText.textContent = "Welcome, Guest";

    guestEls.forEach(el => el.classList.remove("hidden"));
    userEls.forEach(el => el.classList.add("hidden"));
  }
}

// Firebase auth listener
onAuthStateChanged(auth, updateUI);
// ===============================
// 5. CHATBOT AI LOGIC (UPDATED)
// ===============================
function addMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  
  if (sender === 'bot') {
    // Use marked to parse the AI response and remove asterisks
    // Ensure you added the marked.js script to your home.html
    msgDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
  } else {
    msgDiv.textContent = text;
  }
  
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.addEventListener('click', async () => {
  const userText = chatInput.value.trim();
  if (!userText) return;

  addMessage(userText, 'user');
  chatInput.value = "";

  const typingId = "typing-" + Date.now();
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('message', 'bot');
  typingDiv.id=typingId
  typingDiv.innerHTML=`
  <div class="typing-dots">
  <span></span><span></span><span></span>
  </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop=chatMessages.scrollHeight;

  try {
    const response = await fetch('https://packn-plan.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userText })
    });
    const data = await response.json();
    
    // Remove the typing indicator
    const indicator = document.getElementById(typingId);
    if (indicator) indicator.remove();
    
    // Add the real parsed message
    addMessage(data.reply, 'bot');
  } catch (error) {
    const indicator = document.getElementById(typingId);
    if (indicator) indicator.textContent = "Error: Could not connect to AI server.";
  }
});
// =========================================
// SAVED TRIPS LOGIC (UPDATED WITH AUTH CHECK)
// =========================================
const savedTripsTrigger = document.getElementById("savedTrips");
const savedModal = document.getElementById("savedTripsModal");
const closeSavedBtn = document.getElementById("closeSavedModal");
const savedList = document.getElementById("savedTripsList");

if (savedTripsTrigger) {
    savedTripsTrigger.addEventListener("click", (e) => {
        
        // 🛑 THE GATEKEEPER: Check if user is logged out
        // Based on your HTML, if the "Login" button doesn't have the 'hidden' class, they are a guest.
        const loginBtn = document.getElementById("loginBtn");
        const isGuest = loginBtn && !loginBtn.classList.contains("hidden");

        if (isGuest) {
            // STOP! The user is not logged in. 
            // We exit this function so ONLY your "Please login" modal shows up.
            return; 
        }

        // ✅ IF LOGGED IN: Proceed to show the Saved Trips modal
        if (typeof closeDrawer === "function") closeDrawer();

        savedModal.classList.remove("hidden");

        savedList.innerHTML = `
            <span class="empty-state-img">🎒</span>
            <h3 style="color: #333; margin-bottom: 5px;">No saved trips yet</h3>
            <p class="empty-text">Your itinerary is looking a bit empty. Let's fix that!</p>
            <button onclick="document.getElementById('savedTripsModal').classList.add('hidden')" class="plan-btn">Plan a Trip Now</button>
        `;
    });
}
// =========================================
// VISITED TRIPS LOGIC
// =========================================
const visitedTripsTrigger = document.getElementById("visitedTrips");
const visitedModal = document.getElementById("visitedTripsModal");
const closeVisitedBtn = document.getElementById("closeVisitedModal");
const visitedList = document.getElementById("visitedTripsList");

if (visitedTripsTrigger) {
    visitedTripsTrigger.addEventListener("click", (e) => {
        
        // 🛑 THE GATEKEEPER: Check if user is logged out
        const loginBtn = document.getElementById("loginBtn");
        const isGuest = loginBtn && !loginBtn.classList.contains("hidden");

        if (isGuest) {
            return; // Exit and let the "Please Login" modal show up
        }

        // ✅ IF LOGGED IN: Show the Visited Trips modal
        if (typeof closeDrawer === "function") closeDrawer();

        visitedModal.classList.remove("hidden");

        // Show the "Empty State" message
        visitedList.innerHTML = `
            <span class="empty-state-img">✈️</span>
            <h3 style="color: #333; margin-bottom: 5px;">No visited trips yet</h3>
            <p class="empty-text">You haven't marked any trips as completed. Time to start exploring!</p>
            <button onclick="document.getElementById('visitedTripsModal').classList.add('hidden')" class="plan-btn">Find a Destination</button>
        `;
    });
}

// Close Modal Logic (Clicking the "X")
if (closeVisitedBtn) {
    closeVisitedBtn.addEventListener("click", () => {
        visitedModal.classList.add("hidden");
    });
}

// Close if clicking outside the white box
window.addEventListener("click", (e) => {
    if (e.target === visitedModal) {
        visitedModal.classList.add("hidden");
    }
});
// ===============================
// MAP LOGIC 
// ===============================
const mapsTrigger = document.getElementById('mapsTrigger');
const mapSection = document.getElementById('mapSection');
const pageWrapper = document.querySelector('.page-wrapper');
const closeMapBtn = document.getElementById('closeMap');

if (mapsTrigger) {
  mapsTrigger.addEventListener('click', () => {
  pageWrapper.style.display = 'none'; 
  mapSection.classList.remove('hidden');
  mapSection.style.display = 'block'; 
  closeDrawer(); 

  if (!myMap) {
    // 1. Create the map with a "Fly" animation feel
    myMap = L.map('map', {
      zoomControl: false, // We'll move this to a better spot
      scrollWheelZoom: true
    }).setView([20.5937, 78.9629], 5); // Default to a central location (e.g., India)

    // 2. Add high-quality Voyager tiles immediately
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap'
    }).addTo(myMap);

    // 3. Move zoom buttons to bottom-right (looks cleaner)
    L.control.zoom({ position: 'bottomright' }).addTo(myMap);

  } else {
    // If it exists, reset it to a "clean" starting zoom
    myMap.setView([20.5937, 78.9629], 5);
  }
  
  // 4. Force refresh with almost zero delay
  setTimeout(() => { myMap.invalidateSize(); }, 50);
});
}

// Logic for the "Back to Search" button
if (closeMapBtn) {
  closeMapBtn.addEventListener('click', () => {
    // Hide map
    mapSection.style.display = 'none';
    mapSection.classList.add('hidden');
    
    // Bring back the main site
    pageWrapper.style.display = 'block';
  });
}
// Close Modal Logic (When clicking the "X")
if (closeSavedBtn) {
    closeSavedBtn.addEventListener("click", () => {
        savedModal.classList.add("hidden");
    });
}

// Close if clicking outside the white box
window.addEventListener("click", (e) => {
    if (e.target === savedModal) {
        savedModal.classList.add("hidden");
    }
});
// ===============================
// ACCOUNT MENU
// ===============================
accountBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  accountMenu.classList.toggle("show");
});
// Close account menu on outside click
document.addEventListener("click", (e) => {
  if (!accountMenu.contains(e.target) && e.target !== accountBtn) {
    accountMenu.classList.remove("show");
  }
});

// ===============================
// DRAWER
// ===============================
hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  drawer.classList.toggle("open");
  overlay.classList.toggle("show");
});

function closeDrawer() {
  drawer.classList.remove("open");
  overlay.classList.remove("show");
}

overlay.addEventListener("click", () => {
  closeDrawer();
});
// ===============================
// black tabs logic
// ===============================
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // 1. Remove 'active' class from all tabs
    tabs.forEach(t => t.classList.remove("active"));
    
    // 2. Hide all panels
    panels.forEach(p => {
      p.classList.remove("active");
      p.style.display = "none"; // Force hide
    });

    // 3. Activate the clicked tab
    tab.classList.add("active");

    // 4. Find the matching panel using your 'data-for' attribute
    const targetName = tab.getAttribute("data-for");
    const targetPanel = document.getElementById(targetName);
    
    // 5. Show the matching panel
    if (targetPanel) {
      targetPanel.classList.add("active");
      targetPanel.style.display = "block"; // Force show
      
      // Optional: Add a smooth fade-in animation
      targetPanel.style.animation = "fadeIn 0.5s ease";
    }
  });
});
// Add this animation style via JS just to be safe
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
// ===============================
// MODAL
// ===============================
function showLoginModal() {
  modal.classList.remove("hidden");
}

function hideLoginModal() {
  modal.classList.add("hidden");
}

// IMPORTANT: modal should NOT affect drawer
modal.querySelector(".modal-inner").addEventListener("click", e => e.stopPropagation());

modalClose.addEventListener("click", hideLoginModal);
modalLogin.addEventListener("click", () => window.location.href = "login.html");

// ===============================
// PROTECTED FEATURES
// ===============================
function requireAuth(action) {
  if (!auth.currentUser) {
    showLoginModal();
    return;
  }
  action();
}

savedTrips.addEventListener("click", () => {
  requireAuth(() => {
    console.log("Open Saved Trips");
  });
});

visitedTrips.addEventListener("click", () => {
  requireAuth(() => {
    console.log("Open Visited Trips");
  });
});

// ===============================
// NAV BUTTONS
// ===============================
loginBtn.onclick = () => window.location.href = "login.html";
signupBtn.onclick = () => window.location.href = "signup.html";
profileBtn.onclick = () => {
  window.location.href = "profile.html";
};
settingsBtn.onclick = () => {
  window.location.href = "settings.html";
};
logoutBtn.onclick = async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.reload();
};
// state
let slides = [];
let index = 0;
let visibleCount = 3;
const GAP = 20; // must match CSS margin-right
let slideWidth = 0;
let autoplayId = null;

// determine visibleCount by width
function calcVisibleCount() {
  const w = window.innerWidth;
  if (w > 900) return 3;
  if (w > 600) return 2;
  return 1;
}

// load slides from Firestore (creates .carousel-slide elements)
/*async function loadDestinations() {
  track.innerHTML = "";
  
  const snap = await getDocs(collection(db, "destinations"));

  snap.forEach(doc => {
    const d = doc.data();
    const slide = document.createElement("div");
    slide.className = "carousel-slide";
    // ensure data-link if you use links
    if (d.link) slide.dataset.link = d.link;

    // build image + title nodes (avoid innerHTML for safer load control)
    const img = document.createElement("img");
    img.src = d.image;
    img.alt = d.name || "";

    const p = document.createElement("p");
    p.textContent = d.name || "";

    slide.appendChild(img);
    slide.appendChild(p);
    track.appendChild(slide);
  });

  // wait for all images to load (so widths are accurate)
  const imgs = [...track.querySelectorAll("img")];
  await Promise.all(imgs.map(img => (img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; }))));

  // refresh slides list
  slides = Array.from(track.querySelectorAll(".carousel-slide"));
}*/
// ===============================
// LOAD DESTINATIONS (With Click Logic)
// ===============================
async function loadDestinations() {
  track.innerHTML = "";
  try {
    const snap = await getDocs(collection(db, "destinations"));

    snap.forEach(docSnap => {
      const d = docSnap.data();
      const slide = document.createElement("div");
      slide.className = "carousel-slide";
      
      // --- NEW: CLICK EVENT ---
      slide.addEventListener("click", () => {
         console.log("Clicked:", d.name);
        // We encode the image URL so it doesn't break the browser link
         const targetUrl = `destination-details.html?city=${encodeURIComponent(d.name)}&hero=${encodeURIComponent(d.image)}`;
         window.location.href = targetUrl;
      });

      const img = document.createElement("img");
      img.src = d.image; 
      img.alt = d.name || "Destination";

      const p = document.createElement("p");
      p.textContent = d.name || "Unknown";

      slide.appendChild(img);
      slide.appendChild(p);
      track.appendChild(slide);
    });

    // Wait for images to load so layout doesn't break
    const imgs = [...track.querySelectorAll("img")];
    await Promise.all(imgs.map(img => (img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; }))));

    // Refresh slides array
    slides = Array.from(track.querySelectorAll(".carousel-slide"));
    
    // Recalculate dots and layout
    applySlideSizing();
    buildDots();

  } catch (error) {
    console.error("Error loading destinations:", error);
  }
}
// ===============================
// SEARCH BAR LOGIC
// ===============================

// 1. HOTELS SEARCH
const hotelBtn = document.querySelector("#hotels .search-btn");
const hotelInput = document.querySelector("#hotels input[placeholder='City']"); // More specific selector

if (hotelBtn) {
  hotelBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Stop page reload
    const city = hotelInput.value.trim();
    
    if (city) {
      console.log("Searching for hotel in:", city);
      // Redirect to your details page
      window.location.href = `destination-details.html?city=${encodeURIComponent(city)}`;
    } else {
      alert("Please enter a city name first!");
    }
  });
}

// 2. DESTINATION SEARCH (The "Explore" Tab)
const destBtn = document.querySelector("#destination .search-btn");
const destInput = document.querySelector("#destination input[placeholder*='Search places']"); // Matches placeholder "Search places..."

if (destBtn) {
  destBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const place = destInput.value.trim();
    
    if (place) {
      window.location.href = `destination-details.html?city=${encodeURIComponent(place)}`;
    } else {
      alert("Please tell us where you want to go!");
    }
  });
}

// 3. TRANSPORT SEARCH (Optional - Sends you to the "To" city)
const transBtn = document.querySelector("#transport .search-btn");
const transInputs = document.querySelectorAll("#transport input"); 
// 0=From, 1=To, 2=Date

if (transBtn) {
  transBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const fromCity = transInputs[0].value;
    const toCity = transInputs[1].value;
    
    if (toCity) {
      window.location.href = `transport.html?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}`;
    } else {
      alert("Please enter From and To locations.");
    }
  });
}
// ===============================
// 4. ITINERARY SEARCH LOGIC
// ===============================
const planBtn = document.querySelector("#itinerary .search-btn");
const planDestInput = document.querySelector("#itinerary input[placeholder='Destination']");
const planDaysInput = document.querySelector("#itinerary input[placeholder='Days']");

if (planBtn) {
  planBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const dest = planDestInput.value.trim();
    const days = planDaysInput.value.trim();

    if (dest && days) {
      // Redirect to the new Itinerary page
      window.location.href = `itinerary.html?city=${encodeURIComponent(dest)}&days=${days}`;
    } else {
      alert("Please enter both a destination and the number of days.");
    }
  });
}
// apply widths to slides according to visibleCount
function applySlideSizing() {
  visibleCount = calcVisibleCount();
  const containerWidth = container.clientWidth;
  const totalGaps = (visibleCount - 1) * GAP;
  slideWidth = Math.floor((containerWidth - totalGaps) / visibleCount);

  slides.forEach((s, i) => {
    s.style.width = `${slideWidth}px`;
    s.style.marginRight = (i === slides.length - 1) ? "0px" : `${GAP}px`;
  });
}

// build dots (one dot per valid start index)
function buildDots() {
  dotsContainer.innerHTML = "";
  if (!slides.length) return;
  const maxStart = Math.max(0, slides.length - visibleCount);
  for (let i = 0; i <= maxStart; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.dataset.index = i;
    dot.addEventListener("click", () => {
      stopAutoplay();
      index = i;
      moveToIndex();
      startAutoplay();
    });
    dotsContainer.appendChild(dot);
  }
  updateDots();
}

function updateDots() {
  const dots = dotsContainer.querySelectorAll(".dot");
  if (!dots || dots.length === 0) return;
  const maxStart = Math.max(0, slides.length - visibleCount);
  let showIndex = Math.max(0, Math.min(maxStart, Math.round(index)));
  dots.forEach(d => d.classList.remove("active"));
  const chosen = dots[showIndex];
  if (chosen) chosen.classList.add("active");
}

// move the track to current index
function moveToIndex(animate = true) {
  const offset = index * (slideWidth + GAP);
  if (!animate) {
    track.style.transition = "none";
  } else {
    track.style.transition = "transform 0.5s cubic-bezier(.2,.9,.3,1)";
  }
  track.style.transform = `translateX(-${offset}px)`;
  if (!animate) {
    // force reflow then restore
    track.offsetHeight;
    track.style.transition = "transform 0.5s cubic-bezier(.2,.9,.3,1)";
  }
  updateDots();
}

// next / prev
function next() {
  const maxStart = Math.max(0, slides.length - visibleCount);
  index = index + 1;
  if (index > maxStart) index = 0; // wrap
  moveToIndex();
}
function prev() {
  const maxStart = Math.max(0, slides.length - visibleCount);
  index = index - 1;
  if (index < 0) index = maxStart;
  moveToIndex();
}

// autoplay
function startAutoplay() {
  stopAutoplay();
  autoplayId = setInterval(next, 3000);
}
function stopAutoplay() {
  if (autoplayId) {
    clearInterval(autoplayId);
    autoplayId = null;
  }
}

// click on slide -> open link if present
track.addEventListener("click", (e) => {
  const slide = e.target.closest(".carousel-slide");
  if (!slide) return;
  const link = slide.dataset.link;
  if (link) window.location.href = link;
});

// wire buttons
if (nextBtn) nextBtn.addEventListener("click", () => { stopAutoplay(); next(); startAutoplay(); });
if (prevBtn) prevBtn.addEventListener("click", () => { stopAutoplay(); prev(); startAutoplay(); });

// handle resize
let resizeTO;
window.addEventListener("resize", () => {
  stopAutoplay();
  clearTimeout(resizeTO);
  resizeTO = setTimeout(() => {
    applySlideSizing();
    // clamp index
    const maxStart = Math.max(0, slides.length - visibleCount);
    if (index > maxStart) index = maxStart;
    moveToIndex(false);
    startAutoplay();
  }, 150);
});

// main init
async function boot() {
  await loadDestinations();   // loads DOM slides + waits for images
  if (!slides.length) slides = Array.from(track.querySelectorAll(".carousel-slide"));
  applySlideSizing();
  buildDots();
  index = 0;
  moveToIndex(false);
  startAutoplay();
}

boot();
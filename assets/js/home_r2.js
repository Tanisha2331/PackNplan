// --- 1. Global Variables & Theme Sync ---
const MAPTILER_KEY = '4G7v9b1O1Y7yMoUxDgSM'; 
let myMap; // Declare map variable globally

function syncTheme() {
    const savedTheme = localStorage.getItem('theme');
    const root = document.documentElement;

    if (savedTheme === 'dark') {
        root.classList.add('dark-mode');
        // Only update style if map is initialized AND loaded
        if (myMap && myMap.loaded()) {
            myMap.setStyle(`https://api.maptiler.com/maps/chapt-dark/style.json?key=${MAPTILER_KEY}`);
        }
    } else {
        root.classList.remove('dark-mode');
        if (myMap && myMap.loaded()) {
            myMap.setStyle(`https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`);
        }
    }
}

// RUN IMMEDIATELY (Add this line right here)
syncTheme();

// Force check when returning from Settings
window.addEventListener('pageshow', syncTheme);

// ===============================
// FIREBASE INIT
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut,sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const famousPlaces = [
  { name: "Taj Mahal", coords: [27.1751, 78.0421], desc: "Agra, Uttar Pradesh" },
  { name: "Munnar Tea Gardens", coords: [10.0889, 77.0595], desc: "Munnar, Kerala" },
  { name: "Golden Temple", coords: [31.6200, 74.8765], desc: "Amritsar, Punjab" },
  { name: "Hawa Mahal", coords: [26.9239, 75.8267], desc: "Jaipur, Rajasthan" },
  { name: "Gateway of India", coords: [18.9220, 72.8347], desc: "Mumbai, Maharashtra" },
  { name: "Meenakshi Temple", coords: [9.9195, 78.1193], desc: "Madurai, Tamil Nadu" },
  { name: "Victoria Memorial", coords: [22.5448, 88.3426], desc: "Kolkata, West Bengal" },
  { name: "Qutub Minar", coords: [28.5245, 77.1855], desc: "Delhi" },
  { name: "Varanasi Ghats", coords: [25.3176, 83.0062], desc: "Varanasi - The oldest living city on Earth." },
  { name: "Mysore Palace", coords: [12.3052, 76.6552], desc: "Mysore - A masterpiece of Indo-Saracenic architecture." },
  { name: "Hampi Ruins", coords: [15.3350, 76.4600], desc: "Hampi - UNESCO world heritage boulder-strewn landscape." },
  { name: "Sri Harmandir Sahib", coords: [31.6200, 74.8765], desc: "Amritsar - The Golden Temple." },
  { name: "Red Fort", coords: [28.6562, 77.2410], desc: "Delhi - The iconic Mughal residence." },
  { name: "India Gate", coords: [28.6129, 77.2295], desc: "Delhi - The war memorial archway." },
  { name: "Taj Mahal", coords: [27.1751, 78.0421], desc: "Agra - The white marble masterpiece." },
  { name: "Amber Palace", coords: [26.9855, 75.8513], desc: "Jaipur - The majestic hilltop fort." },
  { name: "Mehrangarh Fort", coords: [26.2981, 73.0189], desc: "Jodhpur - One of the largest forts in India." },
  { name: "Statue of Unity", coords: [21.8380, 73.7191], desc: "Gujarat - The world's tallest statue." },
  { name: "Ellora Caves", coords: [20.0258, 75.1780], desc: "Maharashtra - Ancient rock-cut temples." },
  { name: "Charminar", coords: [17.3616, 78.4747], desc: "Hyderabad - The four-minaret monument." },
  { name: "Mysore Palace", coords: [12.3052, 76.6552], desc: "Mysore - A palace of 97,000 lightbulbs." },
  { name: "Marine Drive", coords: [18.9431, 72.8230], desc: "The Queen's Necklace - Mumbai’s iconic seaside promenade." },
    { name: "Hanging Gardens", coords: [18.9564, 72.8055], desc: "Terraced gardens perched atop Malabar Hill." },
    { name: "Haji Ali Dargah", coords: [18.9827, 72.8089], desc: "The stunning mosque and tomb located in the middle of the sea." },
    { name: "Jehangir Art Gallery", coords: [18.9274, 72.8317], desc: "The center of Mumbai's vibrant art scene." },
    { name: "Shree Siddhivinayak Temple", coords: [19.0170, 72.8302], desc: "The famous temple dedicated to Lord Ganesha." },
    { name: "Nehru Science Center", coords: [18.9912, 72.8190], desc: "India's largest interactive science museum." },
    { name: "Bandra Fort", coords: [19.0413, 72.8185], desc: "Castella de Aguada - Historic fort with Bandra-Worli Sea Link views." },
    { name: "Elephanta Caves", coords: [18.9633, 72.9315], desc: "Ancient rock-cut cave temples on Elephanta Island." },
    { name: "Sanjay Gandhi National Park", coords: [19.2288, 72.9182], desc: "A massive protected forest area within the city." },
    { name: "Kanheri Caves", coords: [19.2059, 72.9069], desc: "Buddhist caves carved into the basalt hills inside the park." }
];


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
    const response = await fetch('http://localhost:5000/api/chat', {
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
const destInput = document.querySelector("#destination input[placeholder*='Search places']");

if (destBtn) {
  destBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const place = destInput.value.trim();
    if (place) {
      flyToCity(place); // This opens the map instead of a new page
    } else {
      alert("Where would you like to explore?");
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
      window.location.href = `itinerary.html?dest=${encodeURIComponent(dest)}&days=${days}`;
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
      // 2. INITIALIZE MAPLIBRE (The "Credit Card Free" Mapbox)
      myMap = new maplibregl.Map({
        container: 'map',
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
        center: [78.9629, 20.5937], // [Lng, Lat]
        zoom: 4,
        pitch: 45,    // 3D Tilt
        bearing: -10  // Slight Rotation
      });

      myMap.addControl(new maplibregl.NavigationControl());

      myMap.on('load', () => {
        addMarkersToMap();
        myMap.addSource('famous-locations', {
    'type': 'geojson',
    'data': getFamousPlacesGeoJSON()
});

myMap.addLayer({
    'id': 'famous-labels',
    'type': 'symbol',
    'source': 'famous-locations',
    'layout': {
        'text-field': ['get', 'title'],
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-offset': [0, 0.6], // Positions text slightly below/beside the marker
        'text-anchor': 'top',
        'text-size': 14,
        'text-ignore-placement': false, // This hides labels if they overlap with others
        'text-allow-overlap': false     // Keeps the map from looking cluttered
    },
    'paint': {
        'text-color': '#007cbf', // Matches your blue marker
        'text-halo-color': '#ffffff', // White outline so it's readable over any background
        'text-halo-width': 2
    }
});
        // 3. Add 3D Buildings (MapTiler supports this automatically)
        add3DBuildings();
        highlightFamousPlacesMapLibre();
      });

    } else {
      myMap.flyTo({ center: [78.9629, 20.5937], zoom: 4 });
    }

    setTimeout(() => { myMap.resize(); }, 200);
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
// Data for famous places

// Function to drop these markers
function highlightFamousPlaces() {
  // Define a custom star icon for famous places
  const starIcon = L.divIcon({
    className: 'custom-star-marker',
    html: `<div style="background:#ff9800; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  famousPlaces.forEach(place => {
    L.marker(place.coords, { icon: starIcon })
      .addTo(myMap)
      .bindPopup(`
        <div style="text-align:center;">
          <strong style="color:#ff9800;">⭐ Famous Landmark</strong>
          <h4 style="margin:5px 0;">${place.name}</h4>
          <p style="font-size:12px; margin:0;">${place.desc}</p>
        </div>
      `);
  });
}
// STEP 3: The Marker Logic Function
function highlightFamousPlacesMapbox() {
  famousPlaces.forEach(place => {
    // 1. Create the visual element for the marker
    const el = document.createElement('div');
    el.className = 'mapbox-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.backgroundColor = '#FF9933'; // Saffron
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    el.style.cursor = 'pointer';
    const marker = new mapboxgl.Marker(el)
      .setLngLat([place.coords[1], place.coords[0]])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${place.name}</h3>`))
      .addTo(myMap);

    // --- ADD THE CLICK EVENT HERE ---
    el.addEventListener('click', () => {
      smoothFlyTo(place.coords);
    });
    // 2. Add the marker to the map
    // Remember: Mapbox uses [Longitude, Latitude]
    new mapboxgl.Marker(el)
      .setLngLat([place.coords[1], place.coords[0]]) 
      .setPopup(new mapboxgl.Popup({ offset: 25 }) 
      .setHTML(`<h3 style="color:#FF9933; margin:0;">${place.name}</h3><p style="margin:5px 0 0;">${place.desc}</p>`))
      .addTo(myMap);
  });
}
function smoothFlyTo(coords) {
    if (!myMap) return; // Safety check

    myMap.flyTo({
        center: [coords[1], coords[0]], // [Lng, Lat]
        zoom: 12,                       // Closer zoom for "Famous Places"
        pitch: 60,                      // Dramatic 3D tilt
        bearing: -20,                   // Slight rotation
        essential: true, 
        duration: 3000                  // 3 seconds of smooth travel
    });
}
document.getElementById('resetMap').addEventListener('click', () => {
    myMap.flyTo({
        center: [78.9629, 20.5937],
        zoom: 4,
        pitch: 0,
        bearing: 0,
        essential: true,
        duration: 2000
    });
});
// MARKER FUNCTION
function highlightFamousPlacesMapLibre() {
  famousPlaces.forEach(place => {
    const el = document.createElement('div');
    el.className = 'map-marker';
    el.style.cssText = "width:15px; height:15px; background:#FF9933; border-radius:50%; border:2px solid white; cursor:pointer;";

    new maplibregl.Marker(el)
      .setLngLat([place.coords[1], place.coords[0]])
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<b>${place.name}</b>`))
      .addTo(myMap);

    el.addEventListener('click', () => smoothFlyTo(place.coords));
  });
}

// 3D BUILDINGS FUNCTION
function add3DBuildings() {
    myMap.addLayer({
        'id': '3d-buildings',
        'source': 'openmaptiles',
        'source-layer': 'building',
        'type': 'fill-extrusion',
        'minzoom': 14,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'render_height'],
            'fill-extrusion-base': ['get', 'render_min_height'],
            'fill-extrusion-opacity': 0.7
        }
    });
}

function getFamousPlacesGeoJSON() {
    return {
        'type': 'FeatureCollection',
        'features': famousPlaces.map(place => ({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [place.coords[1], place.coords[0]] // [Lng, Lat]
            },
            'properties': {
                'title': place.name
            }
        }))
    };
}
// --- Put this at the VERY BOTTOM of home.js ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Buttons are now being linked...");

    const tourBtn = document.getElementById('startTour'); // Use your actual button ID
    if (tourBtn) {
        tourBtn.onclick = () => {
            console.log("Tour button clicked!");
            startIndiaTour(); // Your tour function name
        };
    }

    const settingsBtn = document.getElementById('settingsBtn'); // Use your actual button ID
    if (settingsBtn) {
        settingsBtn.onclick = () => {
            window.location.href = 'settings.html';
        };
    }
});
boot();
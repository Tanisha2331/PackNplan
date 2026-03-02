// ===============================
// FIREBASE INIT
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
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

window.initiateBooking = async (name, type) => {
    const user = auth.currentUser;
    // 1. Check if user is logged in
    if (!user) {
        showLoginModal(); 
        return;
    }
    try {
        // 2. Save the booking to YOUR "bookings" collection
        const docRef = await addDoc(collection(db, "bookings"), {
            userId: user.uid,
            userEmail: user.email,
            itemName: name,       // The name of the hotel/attraction
            itemType: type,       // 'Stay' or 'Attraction'
            status: "Reserved",    // You can change this to "Confirmed" later
            bookingDate: serverTimestamp()
        });
        // 3. Give the user feedback on YOUR site
        alert(` Success! Your trip to ${name} has been reserved. View it in your profile.`);
        console.log("Booking saved with ID: ", docRef.id);
    } catch (error) {
        console.error("Firebase Error:", error);
        alert("Booking failed. Please check your connection.");
    }
};
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
const chatMessages = document.getElementById('chatMessages');
const closeChat = document.getElementById('closeChat');

// ===============================
// AUTH UI HANDLER
// ===============================
function updateUI(user) {
  const guestEls = document.querySelectorAll(".guest-only");
  const userEls = document.querySelectorAll(".user-only");

  if (user) {
    const name = user.displayName || localStorage.getItem("userName") || user.email.split("@")[0];
    accountBtn.innerHTML = `<span class="profile-circle">${name[0].toUpperCase()}</span>`;
    avatar.textContent = name[0].toUpperCase();
    welcomeText.textContent = `Welcome ${name}!`;
    guestEls.forEach(el => el.classList.add("hidden"));
    userEls.forEach(el => el.classList.remove("hidden"));
  } else {
    accountBtn.textContent = "Account";
    avatar.textContent = "G";
    welcomeText.textContent = "Welcome, Guest";
    guestEls.forEach(el => el.classList.remove("hidden"));
    userEls.forEach(el => el.classList.add("hidden"));
  }
}
onAuthStateChanged(auth, updateUI);

// ===============================
// CHATBOT LOGIC
// ===============================
chatInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

function addMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.innerHTML = (sender === 'bot' && typeof marked !== 'undefined') ? marked.parse(text) : text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (chatbotTrigger) {
  chatbotTrigger.addEventListener('click', () => {
    chatWidget.classList.remove('hidden');
    closeDrawer();
    if (chatMessages.innerHTML.trim() === "") {
      setTimeout(() => {
        addMessage("Hello! I'm your Pack & Plan assistant! Where should we escape to first?", "bot");
      }, 400);
    }
  });
}
closeChat?.addEventListener('click', () => chatWidget.classList.add('hidden'));

sendBtn?.addEventListener('click', async () => {
  const userText = chatInput.value.trim();
  if (!userText) return;

  addMessage(userText, 'user');
  chatInput.value = "";

  const typingId = "typing-" + Date.now();
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('message', 'bot');
  typingDiv.id = typingId;
  typingDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
  chatMessages.appendChild(typingDiv);

  try {
    const response = await fetch('https://packn-plan.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userText })
    });
    const data = await response.json();
    document.getElementById(typingId)?.remove();
    addMessage(data.reply, 'bot');
  } catch (error) {
    const indicator = document.getElementById(typingId);
    if (indicator) indicator.textContent = "Error: Could not connect to AI server.";
  }
});

// =========================================
// SAVED TRIPS LOGIC
// =========================================
const savedModal = document.getElementById("savedTripsModal");
const savedList = document.getElementById("savedTripsList");
const closeSavedBtn = document.getElementById("closeSavedModal");

if (savedTrips) {
  savedTrips.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      showLoginModal();
      return;
    }
    closeDrawer();
    savedModal.classList.remove("hidden");
    savedList.innerHTML = `<p style="text-align:center; padding:20px;">Loading adventures... 🎒</p>`;

    try {
      const q = query(collection(db, "savedTrips"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      if (snap.empty) {
        savedList.innerHTML = `<div style="text-align:center; padding:20px;"><h3>No saved trips yet</h3></div>`;
        return;
      }
      savedList.innerHTML = "";
      snap.forEach(doc => {
        const trip = doc.data();
        const card = document.createElement("div");
        card.innerHTML = `
          <div style="padding:15px; background:#f8f9fa; border-radius:10px; margin-bottom:10px; border-left:5px solid #0b74e7;">
            <h4>📍 ${trip.city}</h4>
            <p>${trip.days} Days</p>
            <button onclick="window.location.href='itinerary.html?city=${encodeURIComponent(trip.city)}&days=${trip.days}'" style="background:#0b74e7; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">View Plan</button>
          </div>`;
        savedList.appendChild(card);
      });
    } catch (e) { console.error(e); }
  });
}

// =========================================
// VISITED TRIPS LOGIC
// =========================================
const visitedModal = document.getElementById("visitedTripsModal");
const visitedList = document.getElementById("visitedTripsList");
const closeVisitedBtn = document.getElementById("closeVisitedModal");

if (visitedTrips) {
  visitedTrips.addEventListener("click", () => {
    if (!auth.currentUser) { showLoginModal(); return; }
    closeDrawer();
    visitedModal.classList.remove("hidden");
    visitedList.innerHTML = `<div style="text-align:center; padding:20px;"><h3>No visited trips yet</h3></div>`;
  });
}

// ===============================
// MAP LOGIC
// ===============================
const mapsTrigger = document.getElementById('mapsTrigger');
const mapSection = document.getElementById('mapSection');
const pageWrapper = document.querySelector('.page-wrapper');
const closeMapBtn = document.getElementById('closeMap');

mapsTrigger?.addEventListener('click', () => {
  pageWrapper.style.display = 'none';
  mapSection.classList.remove('hidden');
  mapSection.style.display = 'block';
  closeDrawer();
  if (!myMap) {
    myMap = L.map('map', { zoomControl: false }).setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(myMap);
    L.control.zoom({ position: 'bottomright' }).addTo(myMap);
  }
  setTimeout(() => { myMap.invalidateSize(); }, 50);
});

closeMapBtn?.addEventListener('click', () => {
  mapSection.style.display = 'none';
  pageWrapper.style.display = 'block';
});

// ===============================
// UI HELPERS
// ===============================
accountBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  accountMenu.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!accountMenu.contains(e.target) && e.target !== accountBtn) accountMenu.classList.remove("show");
});

hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  drawer.classList.toggle("open");
  overlay.classList.toggle("show");
});

function closeDrawer() {
  drawer.classList.remove("open");
  overlay.classList.remove("show");
}
overlay.addEventListener("click", closeDrawer);

// Tab Logic
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.style.display = "none");
    tab.classList.add("active");
    const target = document.getElementById(tab.getAttribute("data-for"));
    if (target) target.style.display = "block";
  });
});

function showLoginModal() { modal.classList.remove("hidden"); }
function hideLoginModal() { modal.classList.add("hidden"); }
modalClose.addEventListener("click", hideLoginModal);
modalLogin.addEventListener("click", () => window.location.href = "login.html");

loginBtn.onclick = () => window.location.href = "login.html";
signupBtn.onclick = () => window.location.href = "signup.html";
profileBtn.onclick = () => window.location.href = "profile.html";
settingsBtn.onclick = () => window.location.href = "settings.html";
logoutBtn.onclick = async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.reload();
};

// Search Redirection
document.querySelector("#itinerary .search-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  const dest = document.querySelector("#itinerary input[placeholder='Destination']").value.trim();
  const days = document.querySelector("#itinerary input[placeholder='Days']").value.trim();
  if (dest && days) window.location.href = `itinerary.html?city=${encodeURIComponent(dest)}&days=${days}`;
});

// ===============================
// CAROUSEL & OFFERS
// ===============================
let slides = [];
let index = 0;
let visibleCount = 3;
const GAP = 20;
let slideWidth = 0;

async function loadDestinations() {
  track.innerHTML = "";
  const snap = await getDocs(collection(db, "destinations"));
  snap.forEach(docSnap => {
    const d = docSnap.data();
    const slide = document.createElement("div");
    slide.className = "carousel-slide";
    
    // ✅ DYNAMIC BOOKING LOGIC FOR ATTRACTIONS
    slide.addEventListener("click", () => {
      if (d.bookingUrl) {
          window.initiateBooking(d.name, 'Attraction');
      } else {
          window.location.href = `destination-details.html?city=${encodeURIComponent(d.name)}&hero=${encodeURIComponent(d.image)}`;
      }
    });

    slide.innerHTML = `<img src="${d.image}" alt="${d.name}"><p>${d.name}</p>`;
    track.appendChild(slide);
  });
  slides = Array.from(track.querySelectorAll(".carousel-slide"));
  applySlideSizing();
  buildDots();
}

async function loadOffers() {
    const offersCont = document.getElementById("offersContainer");
    const criteriaModal = document.getElementById("criteriaModal");
    const criteriaText = document.getElementById("criteriaText");
    const criteriaTitle = document.getElementById("criteriaTitle");
    const closeBtn = document.getElementById("closeCriteria");
    if (!offersCont) return;

    try {
        const snap = await getDocs(collection(db, "offers"));
        offersCont.innerHTML = ""; 
        snap.forEach(docSnap => {
            const offer = docSnap.data();
            const card = document.createElement("div");
            card.className = "offer-card";
            card.innerHTML = `
                <img src="${offer.image}" alt="Icon" class="offer-img">
                <div class="offer-info">
                    <p>${offer.discount}</p>
                    <h3>${offer.title}</h3>
                </div>`;
            card.addEventListener("click", () => {
                criteriaTitle.innerText = `${offer.title} Rules`;
                criteriaText.innerText = offer.criteria || "Standard terms apply.";
                criteriaModal.classList.remove("hidden");
            });
            offersCont.appendChild(card);
        });
        closeBtn.onclick = () => criteriaModal.classList.add("hidden");
    } catch (error) { console.error("Offers error:", error); }
}

function applySlideSizing() {
  visibleCount = window.innerWidth > 900 ? 3 : window.innerWidth > 600 ? 2 : 1;
  slideWidth = Math.floor((container.clientWidth - (visibleCount - 1) * GAP) / visibleCount);
  slides.forEach((s, i) => {
    s.style.width = `${slideWidth}px`;
    s.style.marginRight = (i === slides.length - 1) ? "0px" : `${GAP}px`;
  });
}

function buildDots() {
  dotsContainer.innerHTML = "";
  for (let i = 0; i <= Math.max(0, slides.length - visibleCount); i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.onclick = () => { index = i; updateSlider(); };
    dotsContainer.appendChild(dot);
  }
}

function updateSlider() {
  track.style.transform = `translateX(-${index * (slideWidth + GAP)}px)`;
  const dots = dotsContainer.querySelectorAll(".dot");
  dots.forEach((d, i) => d.classList.toggle("active", i === index));
}

async function boot() {
  await loadDestinations();
  await loadOffers();
  setInterval(() => {
    index = (index + 1) > (slides.length - visibleCount) ? 0 : index + 1;
    updateSlider();
  }, 3000);
}

boot();
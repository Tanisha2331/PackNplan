
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
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

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
// Replace alert() with this modern toast
window.showToast = (message) => {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
};

// Replace confirm() with a cleaner check
window.confirmAction = (msg, callback) => {
    if (confirm(msg)) callback(); // You can build a custom modal for this later!
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


// SEARCH REDIRECTION
document.getElementById("hotelSearchBtn").onclick = (e) => {
    e.preventDefault();
    const city = document.getElementById("hotelCity").value;
    const checkIn = document.getElementById("checkIn").value;
    const guests = document.getElementById("guestSelect").value;
    if (!city) return alert("Enter a city");
    
    window.location.href = `hotels.html?city=${city}&checkIn=${checkIn}&guests=${guests}`;
};

// GLOBAL VIEW BOOKINGS
window.viewMyBookings = async () => {
    const user = auth.currentUser;
    if (!user) return window.showToast("Please login first!");

    const list = document.getElementById("bookingsList");
    const modal = document.getElementById("myBookingsModal");
    
    modal.classList.remove("hidden");
    list.innerHTML = `<div style="text-align:center; padding:20px;">🔄 Loading your trips...</div>`;

    try {
        const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        list.innerHTML = "";

        if (snap.empty) {
            list.innerHTML = `<div style="text-align:center; padding:30px;">
                <p style="font-size:3rem;">📭</p>
                <p>No trips found. Time to book one!</p>
            </div>`;
            return;
        }

        snap.forEach(docSnap => {
            const b = docSnap.data();
            const card = document.createElement("div");
            card.className = "booking-card";
            
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <span class="status-pill">Confirmed</span>
                        <h4 style="margin:8px 0 2px 0; font-size:1.1rem;">${b.hotelName || b.itemName}</h4>
                        <p style="margin:0; font-size:0.8rem; color:#777;">📅 Check-in: ${b.checkIn}</p>
                    </div>
                    <div style="text-align:right;">
                        <p style="margin:0; font-weight:bold; color:#0b74e7;">₹${b.amount || '0'}</p>
                    </div>
                </div>
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button onclick="window.showToast('Voucher feature coming soon!')" 
                            style="flex:1; background:#0b74e7; color:#fff; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600;">
                        Download Ticket
                    </button>
                    <button onclick="window.confirmAction('Cancel this trip?', () => cancelBooking('${docSnap.id}'))" 
                            style="flex:1; background:#fff; color:#ff4d4d; border:1px solid #ff4d4d; padding:8px; border-radius:6px; cursor:pointer;">
                        Cancel
                    </button>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (e) {
        window.showToast("Error loading bookings");
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
// SAVED TRIPS LOGIC (With Delete & Scroll)
// =========================================
const savedModal = document.getElementById("savedTripsModal");
const savedList = document.getElementById("savedTripsList");
const closeSavedBtn = document.getElementById("closeSavedModal");

// Global function to handle deletion
window.deleteTrip = async (docId) => {
    if (!confirm("Are you sure you want to remove this trip?")) return;
    
    try {
        const { deleteDoc, doc } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js");
        await deleteDoc(doc(db, "savedTrips", docId));
        
        // Refresh the list immediately after deleting
        savedTrips.click(); 
    } catch (e) {
        console.error("Delete failed:", e);
        alert("Error deleting trip.");
    }
};

if (savedTrips) {
    savedTrips.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) { showLoginModal(); return; }
        
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
            snap.forEach(docSnap => {
                const trip = docSnap.data();
                const tripId = docSnap.id;
                const card = document.createElement("div");
                
                card.innerHTML = `
                  <div style="padding:15px; background:#f8f9fa; border-radius:10px; margin-bottom:12px; border-left:5px solid #0b74e7; position:relative; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h4 style="margin:0 0 5px 0;">📍 ${trip.city}</h4>
                    <p style="margin:0 0 10px 0; color:#666; font-size:0.9rem;">${trip.days} Days</p>
                    
                    <div style="display:flex; gap:10px;">
                        <button onclick="window.location.href='itinerary.html?city=${encodeURIComponent(trip.city)}&days=${trip.days}'" 
                                style="background:#0b74e7; color:white; border:none; padding:6px 12px; border-radius:5px; cursor:pointer; font-size:0.85rem;">
                            View Plan
                        </button>
                        
                        <button onclick="deleteTrip('${tripId}')" 
                                style="background:#ff4d4d; color:white; border:none; padding:6px 12px; border-radius:5px; cursor:pointer; font-size:0.85rem;">
                            Delete
                        </button>
                    </div>
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
// Close Modals
closeSavedBtn?.addEventListener("click", () => savedModal.classList.add("hidden"));
closeVisitedBtn?.addEventListener("click", () => visitedModal.classList.add("hidden"));
window.addEventListener("click", (e) => {
  if (e.target === savedModal) savedModal.classList.add("hidden");
  if (e.target === visitedModal) visitedModal.classList.add("hidden");
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
// This tells the "My Bookings" button to open the modal
document.addEventListener('DOMContentLoaded', () => {
    const myBookingsBtn = document.getElementById("myBookingsBtn");
    if (myBookingsBtn) {
        myBookingsBtn.onclick = (e) => {
            e.preventDefault();
            // This line closes your Account Menu so you can see the Modal
            accountMenu.classList.remove("show"); 
            // This line runs the function that gets your trips from Firebase
            window.viewMyBookings();
        };
    }
});
//cancel booking
window.cancelBooking = async (id) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;
    try {
        await deleteDoc(doc(db, "bookings", id));
        alert("Trip cancelled successfully.");
        window.viewMyBookings(); // This refreshes the list automatically
    } catch (e) {
        console.error("Cancel failed:", e);
        alert("Error cancelling booking.");
    }
};
// ===============================
// MAP LOGIC (MapLibre & 3D)
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
      // Initialize MapLibre
      myMap = new maplibregl.Map({
        container: 'map',
        style: localStorage.getItem('theme') === 'dark' 
          ? `https://api.maptiler.com/maps/chapt-dark/style.json?key=${MAPTILER_KEY}`
          : `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
        center: [78.9629, 20.5937], 
        zoom: 4,
        pitch: 45,
        bearing: -10
      });

      myMap.addControl(new maplibregl.NavigationControl());

      myMap.on('load', () => {
        add3DBuildings();
        highlightFamousPlacesMapLibre();
      });
    } else {
      myMap.resize(); // Fix for maps loading in hidden divs
      myMap.flyTo({ center: [78.9629, 20.5937], zoom: 4 });
    }
  });
}

// Logic for the "Back to Search" button
if (closeMapBtn) {
  closeMapBtn.addEventListener('click', () => {
    mapSection.style.display = 'none';
    mapSection.classList.add('hidden');
    pageWrapper.style.display = 'block';
  });
}

// RESET MAP TO INDIA
document.getElementById('resetMap')?.addEventListener('click', () => {
    myMap?.flyTo({
        center: [78.9629, 20.5937],
        zoom: 4,
        pitch: 0,
        bearing: 0,
        essential: true,
        duration: 2000
    });
});

// MARKER FUNCTION (Lng, Lat Order)
function highlightFamousPlacesMapLibre() {
  famousPlaces.forEach(place => {
    const el = document.createElement('div');
    el.className = 'custom-star-marker'; // Use your existing CSS class!
    el.style.cssText = "width:15px; height:15px; background:#FF9933; border-radius:50%; border:2px solid white; cursor:pointer;";

    new maplibregl.Marker(el)
      .setLngLat([place.coords[1], place.coords[0]]) // IMPORTANT: [Lng, Lat]
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<b>${place.name}</b><p>${place.desc}</p>`))
      .addTo(myMap);

    el.addEventListener('click', () => smoothFlyTo(place.coords));
  });
}

function smoothFlyTo(coords) {
    myMap?.flyTo({
        center: [coords[1], coords[0]], 
        zoom: 12,
        pitch: 60,
        duration: 3000
    });
}

function add3DBuildings() {
    // 1. Get all sources currently loaded in your MapTiler style
    const sources = myMap.getStyle().sources;
    
    // 2. Find the one that is a vector source (usually 'maptiler_planet' or 'vector')
    const sourceName = Object.keys(sources).find(key => sources[key].type === 'vector') || 'openmaptiles';

    myMap.addLayer({
        'id': '3d-buildings',
        'source': sourceName, // Now it uses the dynamic name!
        'source-layer': 'building',
        'type': 'fill-extrusion',
        'minzoom': 14,
        'paint': {
            'fill-extrusion-color': localStorage.getItem('theme') === 'dark' ? '#444' : '#aaa',
            'fill-extrusion-height': ['get', 'render_height'],
            'fill-extrusion-base': ['get', 'render_min_height'],
            'fill-extrusion-opacity': 0.7
        }
    });
}
// 1. Target the button by the ID you just added
const exploreBtn = document.getElementById("destExploreBtn");

if (exploreBtn) {
    exploreBtn.onclick = (e) => {
        // 🛑 CRITICAL: This stops the <form> from refreshing the page
        e.preventDefault(); 

        // 2. Get the values from your input and select fields
        const cityInput = document.querySelector("#destination input[type='text']");
        const vibeSelect = document.querySelector("#destination select");
        
        const city = cityInput.value.trim();
        const vibe = vibeSelect.value;

        // 3. Shake validation if empty (Premium TechNirmaan style)
        if (!city) {
            cityInput.classList.add("input-error");
            setTimeout(() => cityInput.classList.remove("input-error"), 500);
            return;
        }

        // 4. Redirect to your details page with the parameters
        // This ensures the "same interface" pops up as requested
        window.location.href = `destination-details.html?city=${encodeURIComponent(city)}&vibe=${vibe}`;
    };
}
boot();
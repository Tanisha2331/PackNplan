// ===============================
// 1. FIREBASE INIT
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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
// 2. DOM ELEMENTS
// ===============================
const accountBtn = document.getElementById("accountBtn");
const accountMenu = document.getElementById("accountMenu");
const hamburger = document.getElementById("hamburger");
const drawerElement = document.querySelector(".drawer"); 
const overlay = document.getElementById("overlay");

// Chatbot Elements
const chatbotTrigger = document.getElementById('chatbotTrigger');
const chatWidget = document.getElementById('chatWidget');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendChat');
const chatMessages = document.getElementById('chatMessages');
const closeChat = document.getElementById('closeChat');

// Carousel Elements
const track = document.getElementById("carouselTrack");
const container = document.querySelector(".carousel-container");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const dotsContainer = document.querySelector(".carousel-dots");

// ===============================
// 3. SIDEBAR & NAVIGATION
// ===============================
hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  drawerElement.classList.add("open"); 
  overlay.classList.add("show");       
});

function closeDrawer() {
  drawerElement.classList.remove("open");
  overlay.classList.remove("show");
}

overlay.addEventListener("click", closeDrawer);

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
// 4. AUTH UI HANDLER
// ===============================
function updateUI(user) {
  const avatar = document.getElementById("userAvatar");
  const welcomeText = document.getElementById("drawerWelcome");
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
// 6. CAROUSEL LOGIC
// ===============================
let slides = [];
let index = 0;
let visibleCount = 3;
const GAP = 20;
let slideWidth = 0;

async function loadDestinations() {
  track.innerHTML = "";
  const snap = await getDocs(collection(db, "destinations"));
  snap.forEach(doc => {
    const d = doc.data();
    const slide = document.createElement("div");
    slide.className = "carousel-slide";
    slide.innerHTML = `<img src="${d.image}"><p>${d.name}</p>`;
    track.appendChild(slide);
  });
  slides = Array.from(track.querySelectorAll(".carousel-slide"));
}

function applySizing() {
  const w = window.innerWidth;
  visibleCount = w > 900 ? 3 : (w > 600 ? 2 : 1);
  slideWidth = Math.floor((container.clientWidth - (visibleCount - 1) * GAP) / visibleCount);
  slides.forEach((s, i) => {
    s.style.width = `${slideWidth}px`;
    s.style.marginRight = i === slides.length - 1 ? "0px" : `${GAP}px`;
  });
}

async function init() {
  await loadDestinations();
  applySizing();
  const maxStart = Math.max(0, slides.length - visibleCount);
  for (let i = 0; i <= maxStart; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.addEventListener("click", () => { index = i; moveToIndex(); });
    dotsContainer.appendChild(dot);
  }
}

function moveToIndex() {
  track.style.transform = `translateX(-${index * (slideWidth + GAP)}px)`;
}

init();

// ===============================
// 7. ACCOUNT MENU & BUTTONS
// ===============================
accountBtn.onclick = (e) => { e.stopPropagation(); accountMenu.classList.toggle("show"); };
document.onclick = (e) => { if (!accountMenu.contains(e.target)) accountMenu.classList.remove("show"); };
document.getElementById("logoutBtn").onclick = async () => { await signOut(auth); window.location.reload(); };
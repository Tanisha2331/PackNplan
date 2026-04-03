
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
import { addDoc, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
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

async function getSavedTripIDsForUser(user) {
  if (!user) return new Set();
  try {
    const q = query(collection(db, 'savedTrips'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const savedCities = new Set();
    snap.forEach(item => savedCities.add(item.data().city));
    return savedCities;
  } catch (e) {
    console.error('Saved trip lookup failed', e);
    return new Set();
  }
}

async function refreshSavedHeartState() {
  const hearts = document.querySelectorAll('.save-heart');
  hearts.forEach(h => h.classList.remove('saved'));

  const user = auth.currentUser;
  if (!user) return;

  const savedCities = await getSavedTripIDsForUser(user);
  hearts.forEach(h => {
    if (savedCities.has(h.dataset.city)) {
      h.classList.add('saved');
      h.innerHTML = '<i class="fa-solid fa-heart"></i>';
    }
  });
}

async function toggleSavedTrip(destination, heartButton) {
  const user = auth.currentUser;
  if (!user) {
    showLoginModal();
    return;
  }

  try {
    const tripQuery = query(collection(db, 'savedTrips'), where('userId', '==', user.uid), where('city', '==', destination.name));
    const tripSnap = await getDocs(tripQuery);

    // If already saved, remove it (toggle behavior)
    if (!tripSnap.empty) {
      await Promise.all(tripSnap.docs.map(docSnap => deleteDoc(doc(db, 'savedTrips', docSnap.id))));
      heartButton.classList.remove('saved');
      heartButton.innerHTML = '<i class="fa-regular fa-heart"></i>';
      window.showToast(`${destination.name} removed from saved trips`);
      return;
    }

    await addDoc(collection(db, 'savedTrips'), {
      userId: user.uid,
      userEmail: user.email,
      city: destination.name,
      description: destination.desc || '',
      image: destination.image || '',
      days: destination.days || 1,
      savedAt: serverTimestamp()
    });

    heartButton.classList.add('saved');
    heartButton.innerHTML = '<i class="fa-solid fa-heart"></i>';
    window.showToast(`${destination.name} added to saved trips`);
  } catch (e) {
    console.error('Error toggling saved trip:', e);
    window.showToast('Could not update saved trips. Try again.');
  }
}

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

    // Get booking details from search form
    const city = document.getElementById("hotelCity")?.value || "";
    const checkIn = document.getElementById("checkIn")?.value || "";
    const checkOut = document.getElementById("checkOut")?.value || "";
    const guests = document.getElementById("guestSelect")?.value || "2 Guests, 1 Room";

    try {
        // 2. Save the booking to YOUR "bookings" collection with complete details
        const docRef = await addDoc(collection(db, "bookings"), {
            userId: user.uid,
            userEmail: user.email,
            hotelName: name,           // Changed from itemName to hotelName
            itemType: type,           // Keep for backward compatibility
            location: city,           // Add location from search
            checkIn: checkIn,         // Add check-in date
            checkOut: checkOut,       // Add check-out date
            guests: guests,           // Add guest information
            totalAmount: 0,           // Placeholder - can be updated later
            status: "Reserved",       // You can change this to "Confirmed" later
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


// SEARCH REDIRECTION WITH VALIDATION
document.getElementById("hotelSearchBtn").onclick = (e) => {
    e.preventDefault();
    
    const cityField = document.getElementById("hotelCity");
    const checkInField = document.getElementById("checkIn");
    const checkOutField = document.getElementById("checkOut");
    
    const cityError = document.getElementById("cityError");
    const checkInError = document.getElementById("checkInError");
    const checkOutError = document.getElementById("checkOutError");
    
    // Reset errors
    [cityField, checkInField, checkOutField].forEach(field => field.classList.remove('error'));
    [cityError, checkInError, checkOutError].forEach(err => {
        err.classList.remove('show');
        err.textContent = '';
    });
    
    const city = cityField.value.trim();
    const checkIn = checkInField.value.trim();
    const checkOut = checkOutField.value.trim();
    const guests = document.getElementById("guestSelect").value;
    
    let hasError = false;
    
    // Validate city
    if (!city) {
        cityField.classList.add('error');
        cityError.textContent = 'Please enter a city';
        cityError.classList.add('show');
        hasError = true;
    }
    
    // Validate check-in
    if (!checkIn) {
        checkInField.classList.add('error');
        checkInError.textContent = 'Please select check-in date';
        checkInError.classList.add('show');
        hasError = true;
    }
    
    // Validate check-out
    if (!checkOut) {
        checkOutField.classList.add('error');
        checkOutError.textContent = 'Please select check-out date';
        checkOutError.classList.add('show');
        hasError = true;
    }
    
    // Validate date logic
    if (checkIn && checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        if (checkOutDate <= checkInDate) {
            checkOutField.classList.add('error');
            checkOutError.textContent = 'Check-out date must be after check-in date';
            checkOutError.classList.add('show');
            hasError = true;
        }
    }
    
    // If there are errors, don't proceed
    if (hasError) {
        return;
    }
    
    // All validation passed, proceed
    window.location.href = `hotels.html?city=${encodeURIComponent(city)}&checkIn=${checkIn}&guests=${encodeURIComponent(guests)}`;
};

// Real-time error clearing when user starts typing/selecting
document.getElementById("hotelCity").addEventListener('input', function() {
    if (this.value.trim()) {
        this.classList.remove('error');
        document.getElementById("cityError").classList.remove('show');
    }
});

document.getElementById("checkIn").addEventListener('change', function() {
    if (this.value) {
        this.classList.remove('error');
        document.getElementById("checkInError").classList.remove('show');
    }
});

document.getElementById("checkOut").addEventListener('change', function() {
    if (this.value) {
        this.classList.remove('error');
        document.getElementById("checkOutError").classList.remove('show');
    }
});

// Real-time error clearing for transport fields
document.getElementById("fromCity").addEventListener('input', function() {
    if (this.value.trim()) {
        this.classList.remove('error');
        document.getElementById("fromCityError").classList.remove('show');
    }
});

document.getElementById("toCity").addEventListener('input', function() {
    if (this.value.trim()) {
        this.classList.remove('error');
        document.getElementById("toCityError").classList.remove('show');
    }
});

document.getElementById("travelDate").addEventListener('change', function() {
    if (this.value) {
        this.classList.remove('error');
        document.getElementById("travelDateError").classList.remove('show');
    }
});

// DESTINATION EXPLORATION VALIDATION
const destExploreBtn = document.getElementById("destExploreBtn");
if (destExploreBtn) {
    destExploreBtn.onclick = (e) => {
        e.preventDefault();
        
        const destPlaceField = document.getElementById("destPlace");
        const destPlaceError = document.getElementById("destPlaceError");
        
        // Reset error
        destPlaceField.classList.remove('error');
        destPlaceError.classList.remove('show');
        destPlaceError.textContent = '';
        
        const destPlace = destPlaceField.value.trim();
        
        // Validate destination
        if (!destPlace) {
            destPlaceField.classList.add('error');
            destPlaceError.textContent = 'Please enter a destination';
            destPlaceError.classList.add('show');
            return;
        }
        
        // Proceed to destination details
        window.location.href = `destination-details.html?city=${encodeURIComponent(destPlace)}`;
    };
}

// Real-time error clearing for destination field
const destPlaceInput = document.getElementById("destPlace");
if (destPlaceInput) {
    destPlaceInput.addEventListener('input', function() {
        if (this.value.trim()) {
            this.classList.remove('error');
            document.getElementById("destPlaceError").classList.remove('show');
        }
    });
}

// ITINERARY CREATION VALIDATION
const itinCreateBtn = document.getElementById("itinCreateBtn");
if (itinCreateBtn) {
    itinCreateBtn.onclick = (e) => {
        e.preventDefault();
        
        const itinDestField = document.getElementById("itinDestination");
        const itinDaysField = document.getElementById("itinDays");
        
        const itinDestError = document.getElementById("itinDestError");
        const itinDaysError = document.getElementById("itinDaysError");
        
        // Reset errors
        [itinDestField, itinDaysField].forEach(field => field.classList.remove('error'));
        [itinDestError, itinDaysError].forEach(err => {
            err.classList.remove('show');
            err.textContent = '';
        });
        
        const itinDest = itinDestField.value.trim();
        const itinDays = itinDaysField.value.trim();
        
        let hasError = false;
        
        // Validate destination
        if (!itinDest) {
            itinDestField.classList.add('error');
            itinDestError.textContent = 'Please enter destination';
            itinDestError.classList.add('show');
            hasError = true;
        }
        
        // Validate days
        if (!itinDays) {
            itinDaysField.classList.add('error');
            itinDaysError.textContent = 'Please enter number of days';
            itinDaysError.classList.add('show');
            hasError = true;
        } else if (parseInt(itinDays) < 1) {
            itinDaysField.classList.add('error');
            itinDaysError.textContent = 'Days must be at least 1';
            itinDaysError.classList.add('show');
            hasError = true;
        }
        
        if (hasError) {
            return;
        }
        
        // Proceed to itinerary page
        window.location.href = `itinerary.html?city=${encodeURIComponent(itinDest)}&days=${itinDays}`;
    };
}

// Real-time error clearing for itinerary fields
document.getElementById("itinDestination").addEventListener('input', function() {
    if (this.value.trim()) {
        this.classList.remove('error');
        document.getElementById("itinDestError").classList.remove('show');
    }
});

document.getElementById("itinDays").addEventListener('change', function() {
    if (this.value && parseInt(this.value) >= 1) {
        this.classList.remove('error');
        document.getElementById("itinDaysError").classList.remove('show');
    }
});

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
            
            // Format the booking date if it exists
            const bookingDate = b.bookingDate ? new Date(b.bookingDate.seconds * 1000).toLocaleDateString() : 'N/A';
            
            // Handle different data structures
            const hotelName = b.hotelName || b.itemName || 'Trip';
            const location = b.location || 'N/A';
            const checkIn = b.checkIn || 'N/A';
            const checkOut = b.checkOut || 'N/A';
            const guests = b.guests || b.guestName || 'N/A';
            const amount = b.totalAmount || b.amount || b.price || 'View Details';
            const itemType = b.itemType || 'N/A';
            
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <span class="status-pill">${b.status || 'Pending'}</span>
                        <h4 style="margin:8px 0 2px 0; font-size:1.1rem;">${hotelName}</h4>
                        <p style="margin:0; font-size:0.8rem; color:#777;">📍 ${location}</p>
                        <p style="margin:0; font-size:0.8rem; color:#777;">📅 Check-in: ${checkIn}</p>
                        <p style="margin:0; font-size:0.8rem; color:#777;">👥 ${guests}</p>
                        <p style="margin:5px 0 0 0; font-size:0.8rem; color:#999;">Type: ${itemType}</p>
                        <p style="margin:0; font-size:0.8rem; color:#777;">📅 Booked: ${bookingDate}</p>
                    </div>
                    <div style="text-align:right;">
                        <p style="margin:0; font-weight:bold; color:#0b74e7;">${amount !== 'View Details' ? '₹' + amount : amount}</p>
                    </div>
                </div>
                <div style="margin-top:15px; display:flex; gap:10px;">
                     <button onclick="window.showToast('Ticket for ${hotelName} - Valid for 30 days')" 
                            style="flex:1; background:#0b74e7; color:#fff; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600;">
                        View Ticket
                    </button> 
                    <button onclick="markAsVisited('${docSnap.id}')" 
                      style="flex:1; background:#28a745; color:#fff; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:600;"> 
                      Mark as Visited
                    </button>
                    <button onclick="window.cancelBooking('${docSnap.id}')" 
                      style="flex:1; background:#fff; color:#ff4d4d; border:1.5px solid #ff4d4d; padding:8px; border-radius:6px; cursor:pointer;"> 
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

// MARK AS VISITED FUNCTION
window.markAsVisited = async (bookingId) => {
    const user = auth.currentUser;
    if (!user) return window.showToast("Please login first!");

    try {
        // Get the booking data
        const bookingRef = doc(db, "bookings", bookingId);
        const bookingSnap = await getDocs(query(collection(db, "bookings"), where("__name__", "==", bookingId)));
        if (bookingSnap.empty) return window.showToast("Booking not found");

        const bookingData = bookingSnap.docs[0].data();

        // Add to visitedTrips
        await addDoc(collection(db, "visitedTrips"), {
            userId: user.uid,
            userEmail: user.email,
            hotelName: bookingData.hotelName || bookingData.itemName || 'Trip',
            location: bookingData.location || 'N/A',
            checkIn: bookingData.checkIn || 'N/A',
            checkOut: bookingData.checkOut || 'N/A',
            guests: bookingData.guests || 'N/A',
            itemType: bookingData.itemType || 'N/A',
            rating: 0,
            suggestions: '',
            visitedDate: serverTimestamp()
        });

        // Delete the booking
        await deleteDoc(bookingRef);

        window.showToast("Trip marked as visited! Check your Visited Trips.");
        // Refresh the bookings list
        viewMyBookings();
    } catch (e) {
        console.error("Error marking as visited:", e);
        window.showToast("Error updating trip status");
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
onAuthStateChanged(auth, async (user) => {
  updateUI(user);
  await refreshSavedHeartState();
});
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

    // Show a temporary loading state
    const typingId = "typing-" + Date.now();
    addMessage("...", 'bot'); 

    try {
        // Use the DIRECT URL to bypass any localhost confusion
        const response = await fetch('https://pack-nplan.vercel.app/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userText })
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        // Remove the "..." and add the real message
        chatMessages.lastElementChild.remove();
        addMessage(data.reply, 'bot');

    } catch (error) {
        console.error("Detailed Chat Error:", error);
        window.showToast("🤖 Bot is sleeping. Check Vercel Logs!");
    }
});

// ==========================================
// TRANSPORT SEARCH LOGIC
// ==========================================

const searchTransportBtn = document.getElementById("searchTransportBtn");
const resultsContainer = document.getElementById("transport-results");

if (searchTransportBtn) {
    searchTransportBtn.onclick = async (e) => {
        e.preventDefault(); // 🛑 Stop the page refresh

        const fromCityField = document.getElementById("fromCity");
        const toCityField = document.getElementById("toCity");
        const travelDateField = document.getElementById("travelDate");
        
        const fromCityError = document.getElementById("fromCityError");
        const toCityError = document.getElementById("toCityError");
        const travelDateError = document.getElementById("travelDateError");
        
        // Reset errors
        [fromCityField, toCityField, travelDateField].forEach(field => field.classList.remove('error'));
        [fromCityError, toCityError, travelDateError].forEach(err => {
            err.classList.remove('show');
            err.textContent = '';
        });
        
        const from = fromCityField.value.trim();
        const to = toCityField.value.trim();
        const travelDate = travelDateField.value.trim();
        const type = document.getElementById("transportType").value;
        
        let hasError = false;
        
        // Validate from city
        if (!from) {
            fromCityField.classList.add('error');
            fromCityError.textContent = 'Please enter departure city';
            fromCityError.classList.add('show');
            hasError = true;
        }
        
        // Validate to city
        if (!to) {
            toCityField.classList.add('error');
            toCityError.textContent = 'Please enter destination city';
            toCityError.classList.add('show');
            hasError = true;
        }
        
        // Validate travel date
        if (!travelDate) {
            travelDateField.classList.add('error');
            travelDateError.textContent = 'Please select travel date';
            travelDateError.classList.add('show');
            hasError = true;
        }
        
        // If there are errors, don't proceed
        if (hasError) {
            return;
        }

        resultsContainer.innerHTML = `<p>🔍 Scanning for available ${type}s to ${to}...</p>`;

        // --- DYNAMIC DATA GENERATOR (NOT HARD-CODED) ---
        // This generates names based on the "toCity" input
        const generateOptions = (city, mode) => {
            const data = [];
            const brands = {
                train: ["Express", "Shatabdi", "Superfast", "Special"],
                flight: ["IndiGo", "Air India", "Vistara", "Akasa Air"],
                bus: ["Volvo AC", "Sleeper", "Intercity", "Express Bus"],
                cab: ["Uber Intercity", "Ola Outstation", "Private Cab"]
            };

            // Generate 3 unique options for the specific city
            for (let i = 0; i < 3; i++) {
                const brand = brands[mode][i] || brands[mode][0];
                const time = `${Math.floor(Math.random() * 12 + 1)}:${Math.random() > 0.5 ? '30' : '00'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`;
                const price = mode === 'flight' ? Math.floor(Math.random() * 3000 + 4000) : Math.floor(Math.random() * 1000 + 500);
                
                data.push({
                    // This makes the name dynamic: e.g., "Amritsar Shatabdi"
                    name: mode === 'flight' ? `${brand} ${Math.floor(Math.random()*900 + 100)}` : `${city} ${brand}`,
                    time: time,
                    price: price,
                    duration: mode === 'flight' ? "2h 15m" : "8h 45m"
                });
            }
            return data;
        };

       // Render logic
        setTimeout(() => {
            resultsContainer.innerHTML = "";
            
            // FIX: You must call the function to get the data!
            const options = generateOptions(to, type); 

            options.forEach(item => {
                resultsContainer.innerHTML += `
                    <div class="booking-card" style="margin-bottom:15px; border-left: 5px solid #0b74e7;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <h4 style="margin:0;">${item.name}</h4>
                                <p style="margin:5px 0 0 0; font-size:0.8rem; color:#777;">🕒 ${item.time} • ₹${item.price}</p>
                            </div>
                            <div style="text-align:right;">
                                <button class="btn-primary-small" onclick="openTransportModal('${item.name}', ${item.price}, '${from}', '${to}', '${travelDate}', '${type}')">Book</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
           
        }, 800);
    };
}
// Get all your tab buttons (update the selector to match your class name)
const tabButtons = document.querySelectorAll('.tab-panel'); 

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // When any tab is clicked, clear the previous transport results
        const results = document.getElementById("transport-results");
        if (results) {
            results.innerHTML = ""; 
        }
    });
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
  visitedTrips.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) { showLoginModal(); return; }
    
    closeDrawer();
    visitedModal.classList.remove("hidden");
    visitedList.innerHTML = `<p style="text-align:center; padding:20px;">Loading visited trips... 🗺️</p>`;

    try {
        const q = query(collection(db, "visitedTrips"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            visitedList.innerHTML = `<div style="text-align:center; padding:20px;"><h3>No visited trips yet</h3><p>Mark your bookings as visited to start building your travel journal!</p></div>`;
            return;
        }
        
        visitedList.innerHTML = "";
        snap.forEach(docSnap => {
            const trip = docSnap.data();
            const tripId = docSnap.id;
            const card = document.createElement("div");
            card.className = "visited-trip-card";
            
            card.innerHTML = `
              <div style="padding:15px; background:#f8f9fa; border-radius:10px; margin-bottom:12px; border-left:5px solid #28a745; position:relative; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <h4 style="margin:0 0 5px 0;">📍 ${trip.location || trip.hotelName}</h4>
                <p style="margin:0 0 10px 0; color:#666; font-size:0.9rem;">Check-in: ${trip.checkIn} | Guests: ${trip.guests}</p>
                
                <div style="margin-bottom:10px;">
                    <label style="font-weight:600; font-size:0.9rem;">Rate your experience:</label>
                    <div class="rating-stars" data-trip-id="${tripId}" data-rating="${trip.rating || 0}">
                        ${[1,2,3,4,5].map(star => `<i class="fa-star ${star <= (trip.rating || 0) ? 'fa-solid' : 'fa-regular'}" data-star="${star}"></i>`).join('')}
                    </div>
                </div>
                
                <div style="margin-bottom:10px;">
                    <label style="font-weight:600; font-size:0.9rem;">Suggestions/Notes:</label>
                    <textarea class="suggestions-textarea" data-trip-id="${tripId}" placeholder="Share your thoughts..." rows="2">${trip.suggestions || ''}</textarea>
                </div>
                
                <div style="display:flex; gap:10px;">
                    <button onclick="saveVisitedTrip('${tripId}')" 
                            style="background:#0b74e7; color:white; border:none; padding:6px 12px; border-radius:5px; cursor:pointer; font-size:0.85rem;">
                        Save Changes
                    </button>
                    
                    <button onclick="deleteVisitedTrip('${tripId}')" 
                            style="background:#ff4d4d; color:white; border:none; padding:6px 12px; border-radius:5px; cursor:pointer; font-size:0.85rem;">
                        Delete
                    </button>
                </div>
              </div>`;
            visitedList.appendChild(card);
        });

        // Add event listeners for rating stars
        document.querySelectorAll('.rating-stars').forEach(starsContainer => {
            starsContainer.querySelectorAll('.fa-star').forEach(star => {
                star.addEventListener('click', () => {
                    const rating = parseInt(star.dataset.star);
                    const tripId = starsContainer.dataset.tripId;
                    starsContainer.dataset.rating = rating;
                    starsContainer.querySelectorAll('.fa-star').forEach((s, index) => {
                        s.classList.toggle('fa-solid', index < rating);
                        s.classList.toggle('fa-regular', index >= rating);
                    });
                });
            });
        });
    } catch (e) { 
        console.error(e); 
        visitedList.innerHTML = `<div style="text-align:center; padding:20px;"><h3>Error loading trips</h3></div>`;
    }
  });
}

// SAVE VISITED TRIP CHANGES
window.saveVisitedTrip = async (tripId) => {
    try {
        const card = document.querySelector(`.rating-stars[data-trip-id="${tripId}"]`).closest('.visited-trip-card');
        const rating = parseInt(card.querySelector('.rating-stars').dataset.rating);
        const suggestions = card.querySelector('.suggestions-textarea').value;
        
        await updateDoc(doc(db, "visitedTrips", tripId), {
            rating: rating,
            suggestions: suggestions
        });
        
        window.showToast("Trip updated successfully!");
    } catch (e) {
        console.error("Error saving trip:", e);
        window.showToast("Error saving changes");
    }
};

// DELETE VISITED TRIP
window.deleteVisitedTrip = async (tripId) => {
    if (!confirm("Are you sure you want to remove this visited trip?")) return;
    
    try {
        await deleteDoc(doc(db, "visitedTrips", tripId));
        window.showToast("Visited trip deleted");
        // Refresh the list
        visitedTrips.click();
    } catch (e) {
        console.error("Delete failed:", e);
        window.showToast("Error deleting trip");
    }
};
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

// ===============================
// TRANSPORT BOOKING FLOW (unified)
// ===============================
window.openTransportModal = (transportName, price, fromCity, toCity, travelDate, transportType) => {
    const user = auth.currentUser;
    if (!user) {
        showLoginModal();
        return;
    }

    // Redirect to unified booking page to keep UX consistent
    const params = new URLSearchParams({
        hotelName: transportName,
        address: `${fromCity} → ${toCity}`,
        price: price,
        city: toCity,
        checkIn: travelDate,
        checkOut: travelDate,
        guests: '1',
        itemType: 'Transport',
        transportMode: transportType
    });
    window.location.href = `booking.html?${params.toString()}`;
};

loginBtn.onclick = () => window.location.href = "login.html";
signupBtn.onclick = () => window.location.href = "signup.html";
profileBtn.onclick = () => window.location.href = "profile.html";
settingsBtn.onclick = () => window.location.href = "settings.html";
logoutBtn.onclick = async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.reload();
};

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
      window.location.href = `destination-details.html?city=${encodeURIComponent(d.name)}&hero=${encodeURIComponent(d.image)}`;
    });

    const heartButton = document.createElement('button');
    heartButton.type = 'button';
    heartButton.className = 'save-heart';
    heartButton.dataset.city = d.name;
    heartButton.innerHTML = '<i class="fa-regular fa-heart"></i>';
    heartButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      await toggleSavedTrip(d, heartButton);
    });

    slide.innerHTML = `<img src="${d.image}" alt="${d.name}"><p>${d.name}</p>`;
    slide.appendChild(heartButton);
    track.appendChild(slide);
  });
  slides = Array.from(track.querySelectorAll(".carousel-slide"));
  applySlideSizing();
  buildDots();
  refreshSavedHeartState();
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
// This tells the "My Bookings" button to open the new dedicated page
document.addEventListener('DOMContentLoaded', () => {
    const myBookingsBtn = document.getElementById("myBookingsBtn");
    if (myBookingsBtn) {
        myBookingsBtn.onclick = (e) => {
            e.preventDefault();
            accountMenu.classList.remove("show");
            window.location.href = "mybookings.html";
        };
    }
});

// 1. Next Button Logic - Increments the index and updates
nextBtn.addEventListener("click", () => {
    const maxIndex = Math.max(0, slides.length - visibleCount);
    index = (index + 1) > maxIndex ? 0 : index + 1; // Loops back to start
    updateSlider();
});

// 2. Previous Button Logic - Decrements the index and updates
prevBtn.addEventListener("click", () => {
    const maxIndex = Math.max(0, slides.length - visibleCount);
    index = (index - 1) < 0 ? maxIndex : index - 1; // Loops to end
    updateSlider();
});
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

// FORCE RESET: Overriding the cancel flow
window.cancelBooking = (id) => {
    const confirmModal = document.getElementById("customConfirmModal");
    
    // 1. Force the modal to show using direct style (bypassing CSS classes)
    confirmModal.classList.remove("hidden");
    confirmModal.style.display = "flex"; 
    confirmModal.style.position = "fixed";
    confirmModal.style.zIndex = "99999";

    // 2. Clear previous listeners to prevent multiple deletions
    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");

    // 3. Set the "Yes" action
    yesBtn.onclick = async () => {
        confirmModal.style.display = "none"; // Hide immediately
        confirmModal.classList.add("hidden");

        try {
            // Reference the specific doc and delete it
            const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js");
            await deleteDoc(doc(db, "bookings", id));
            
            window.showToast("✅ Trip removed successfully.");
            window.viewMyBookings(); // Refresh the list
        } catch (e) {
            console.error(e);
            window.showToast("❌ Error: Permission denied.");
        }
    };

    // 4. Set the "No" action
    noBtn.onclick = () => {
        confirmModal.style.display = "none";
        confirmModal.classList.add("hidden");
    };
};
boot();
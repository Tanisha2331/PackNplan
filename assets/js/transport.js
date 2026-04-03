// ===============================
// TRANSPORT PAGE INITIALIZATION
// ===============================

// Import Firebase modules (if this page uses Firebase)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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
// TRANSPORT BOOKING LOGIC
// ===============================

/**
 * Books a transport service
 * @param {String} transportName - Name of transport service (e.g., "Express Train")
 * @param {Number} price - Price of the ticket
 */
window.bookTransport = async (transportName, price) => {
    const user = auth.currentUser;
    
    if (!user) {
        alert("Please login to book transport");
        window.location.href = "login.html";
        return;
    }
    
    try {
        // Save booking to Firebase
        const docRef = await addDoc(collection(db, "bookings"), {
            userId: user.uid,
            userEmail: user.email,
            itemName: transportName,
            hotelName: transportName,
            itemType: "Transport",
            price: price,
            totalAmount: price,
            status: "Confirmed",
            bookingDate: serverTimestamp(),
            location: 'N/A',
            checkIn: 'N/A',
            checkOut: 'N/A',
            guests: 'N/A',
            from: 'N/A',
            to: 'N/A',
            travelDate: 'N/A'
        });
        
        alert(`✅ Transport booked successfully!\n\nService: ${transportName}\nPrice: ₹${price}\n\nView your bookings in My Bookings.`);
        console.log("Transport booking saved with ID:", docRef.id);
    } catch (error) {
        console.error("Booking error:", error);
        alert("Failed to complete booking. Please try again.");
    }
};

/**
 * Get available transport options for a route
 * @param {String} from - Origin city
 * @param {String} to - Destination city
 * @param {String} mode - Transport mode (train, flight, bus, cab)
 * @returns {Array} Array of transport options
 */
window.getTransportOptions = (from, to, mode) => {
    const options = [];
    const brands = {
        train: ["Express", "Shatabdi", "Superfast", "Local"],
        flight: ["IndiGo", "Air India", "Vistara", "SpiceJet"],
        bus: ["Volvo AC", "Sleeper", "Intercity", "Express"],
        cab: ["Uber Intercity", "Ola Outstation", "Ixigo", "13Hrs"]
    };
    
    // Generate 3 random options
    for (let i = 0; i < 3; i++) {
        const brand = brands[mode]?.[i] || brands[mode][0];
        const hours = Math.floor(Math.random() * 10 + 2);
        const minutes = Math.random() > 0.5 ? 30 : 0;
        const time = `${Math.floor(Math.random() * 20 + 6)}:${minutes === 0 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`;
        
        let price;
        if (mode === 'flight') {
            price = Math.floor(Math.random() * 4000 + 3000);
        } else if (mode === 'train') {
            price = Math.floor(Math.random() * 1500 + 500);
        } else if (mode === 'bus') {
            price = Math.floor(Math.random() * 800 + 300);
        } else {
            price = Math.floor(Math.random() * 2000 + 1000);
        }
        
        options.push({
            id: Math.random(),
            name: `${brand} ${from} to ${to}`,
            time: time,
            duration: `${hours}h ${minutes}m`,
            price: price,
            mode: mode,
            from: from,
            to: to
        });
    }
    
    return options;
};

/**
 * Render transport options to the UI
 * @param {String} containerId - ID of the container to render to
 * @param {Array} options - Array of transport options
 */
window.renderTransportOptions = (containerId, options) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    options.forEach(option => {
        const html = `
            <div class="booking-card" style="margin-bottom:15px; border-left: 5px solid #0b74e7;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="margin:0;">${option.name}</h4>
                        <p style="margin:5px 0 0 0; font-size:0.8rem; color:#777;">
                            🕐 ${option.time} • ⏱️ ${option.duration} • ₹${option.price}
                        </p>
                    </div>
                    <button class="btn-primary-small" 
                            onclick="bookTransport('${option.name.replace(/'/g, "\\'")}', ${option.price})"
                            style="background:#0b74e7; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">
                        Book Now
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
};

// Initialize auth listener
onAuthStateChanged(auth, (user) => {
    console.log("Transport page - Auth state:", user ? `Logged in as ${user.email}` : "Not logged in");
});

console.log("✅ Transport module loaded");

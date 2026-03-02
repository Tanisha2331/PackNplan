import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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

const API_KEY = "1158d45a31c54d4fa492f618703b1f7f"; 

// 1. CAPTURE URL PARAMETERS
const urlParams = new URLSearchParams(window.location.search);
const city = urlParams.get('city') || "Mumbai"; // Priority to URL, fallback to Mumbai
const searchedCheckIn = urlParams.get('checkIn');
const searchedGuests = urlParams.get('guests');

let selectedHotel = null;
let selectedHotelPrice = 0;

// --- UTILITY: Switch Modal Steps ---
const showStep = (stepNumber) => {
    const s1 = document.getElementById("step1");
    const s2 = document.getElementById("step2");
    if(s1 && s2) {
        s1.classList.toggle("hidden", stepNumber !== 1);
        s2.classList.toggle("hidden", stepNumber !== 2);
    }
};

// 2. FETCH HOTELS
async function getHotels() {
    const header = document.getElementById("headerCity");
    if(header) header.innerText = `Hotels in ${city}`;

    try {
        const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${API_KEY}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        
        if(!geoData.features || !geoData.features.length) return alert("City not found");
        const { lat, lon } = geoData.features[0].properties;

        const hotelUrl = `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${lon},${lat},20000&limit=15&apiKey=${API_KEY}`;
        const res = await fetch(hotelUrl);
        const data = await res.json();
        renderHotels(data.features);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

// 3. RENDER CARDS
function renderHotels(hotels) {
    const grid = document.getElementById("hotelGrid");
    if(!grid) return;
    grid.innerHTML = "";
    
    hotels.forEach(h => {
        const p = h.properties;
        if(!p.name) return;

        const randomPrice = Math.floor(Math.random() * (8000 - 2000) + 2000);
        const rating = (Math.random() * (5 - 3.5) + 3.5).toFixed(1);

        const card = document.createElement("div");
        card.className = "hotel-card";
        card.style.position = "relative";
        card.innerHTML = `
            <div class="price-tag">₹${randomPrice}/night</div>
            <img src="https://loremflickr.com/400/300/hotel,resort?lock=${Math.random()}">
            <div class="card-content">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size:1.1rem;">${p.name}</h3>
                    <span style="color:#f1c40f;">⭐ ${rating}</span>
                </div>
                <p style="font-size:0.85rem; color:#666; margin:10px 0;">📍 ${p.address_line2 || 'Address on request'}</p>
                <button class="book-btn">Confirm Availability</button>
            </div>
        `;
        
        card.querySelector(".book-btn").onclick = () => openBookingModal(p, randomPrice);
        grid.appendChild(card);
    });
}

// 4. OPEN MODAL
function openBookingModal(hotel, price) {
    const user = auth.currentUser;
    if (!user) return alert("Please login first!");

    selectedHotel = hotel;
    selectedHotelPrice = price;

    // Use a helper to safely set text
    const setSafeText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    setSafeText("modalHotelName", hotel.name);
    setSafeText("modalHotelAddress", hotel.address_line2 || "");
    setSafeText("summaryCheckIn", searchedCheckIn || "Confirmed");
    setSafeText("summaryGuests", searchedGuests ? `${searchedGuests} Guests` : "2 Guests");

    // Pre-fill email
    const emailField = document.getElementById("guestEmail");
    if (emailField) emailField.value = user.email || "";

    showStep(1); 
    document.getElementById("bookingModal")?.classList.remove("hidden");
}

// 2. Update confirmFinalBooking to save the guest info
const btnFinal = document.getElementById("confirmFinalBooking");
if (btnFinal) {
    btnFinal.onclick = async () => {
        const name = document.getElementById("guestName").value;
        const email = document.getElementById("guestEmail").value;
        const phone = document.getElementById("guestPhone").value;

        if(!name || !email || !phone) return alert("Please fill in all guest details!");

        btnFinal.innerText = "Processing Payment...";
        btnFinal.disabled = true;

        try {
            await addDoc(collection(db, "bookings"), {
                userId: auth.currentUser.uid,
                hotelName: selectedHotel.name,
                checkIn: searchedCheckIn,
                guestDetails: {
                    name: name,
                    email: email,
                    phone: phone
                },
                amount: selectedHotelPrice,
                status: "Confirmed",
                createdAt: serverTimestamp()
            });
            showSuccessTicket();
        } catch (e) {
            console.error(e);
            alert("Booking failed. Please try again.");
            btnFinal.innerText = "Pay & Confirm";
            btnFinal.disabled = false;
        }
    };
}
// 5. ATTACH LISTENERS (Safe approach)
const attachListeners = () => {
    const btnGoToPay = document.getElementById("goToPayment");
    if (btnGoToPay) {
        btnGoToPay.onclick = () => {
            const name = document.getElementById("guestName")?.value;
            const phone = document.getElementById("guestPhone")?.value;

            // 1. Professional Validation
            if (!name || name.length < 3) return alert("Please enter a valid guest name.");
            if (!phone || phone.length !== 10) return alert("Please enter a valid 10-digit phone number.");

            // 2. Simulate Gateway Connection
            btnGoToPay.innerText = "Connecting to Secure Gateway...";
            btnGoToPay.disabled = true;

            setTimeout(() => {
                const payAmountEl = document.getElementById("payAmount");
                if (payAmountEl) payAmountEl.innerText = `₹${selectedHotelPrice}`;
                
                showStep(2); // Move to Payment Step
                
                // Reset button for future use
                btnGoToPay.innerText = "Proceed to Payment";
                btnGoToPay.disabled = false;
            }, 1200); // 1.2 second professional delay
        };
    }

    const btnBack = document.getElementById("backToStep1");
    if (btnBack) btnBack.onclick = () => showStep(1);

    const btnClose = document.getElementById("closeModal");
    if (btnClose) btnClose.onclick = () => document.getElementById("bookingModal").classList.add("hidden");

    const btnFinal = document.getElementById("confirmFinalBooking");
    if (btnFinal) {
        btnFinal.onclick = async () => {
            const date = document.getElementById("checkInDate").value;
            btnFinal.innerText = "Processing Payment...";
            btnFinal.disabled = true;

            try {
                await addDoc(collection(db, "bookings"), {
                    userId: auth.currentUser.uid,
                    hotelName: selectedHotel.name,
                    checkIn: date,
                    amount: selectedHotelPrice,
                    status: "Confirmed",
                    createdAt: serverTimestamp()
                });
                showSuccessTicket();
            } catch (e) {
                console.error(e);
                alert("Payment failed.");
                btnFinal.innerText = "Pay & Confirm";
                btnFinal.disabled = false;
            }
        };
    }
};

function showSuccessTicket() {
    const modalContainer = document.getElementById("modalContainer");
    
    // Capture the info one last time for the display
    const guestName = document.getElementById("guestName").value;
    const guestPhone = document.getElementById("guestPhone").value;
    const bookingId = `PNP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    modalContainer.innerHTML = `
        <div style="text-align:center; padding:10px; font-family: 'Poppins', sans-serif;">
            <div style="font-size:3.5rem; color:#27ae60; margin-bottom:10px;">✔</div>
            <h2 style="margin:0; color:#333;">Booking Confirmed!</h2>
            <p style="color:#666; font-size:0.9rem;">A confirmation email has been sent to ${document.getElementById("guestEmail").value}</p>
            
            <div id="voucher" style="background:#fff; border:1px solid #eee; border-radius:12px; margin:20px 0; text-align:left; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <div style="background:#0b74e7; color:white; padding:10px 15px; border-radius:12px 12px 0 0; display:flex; justify-content:space-between;">
                    <span style="font-weight:bold;">VOUCHER</span>
                    <span>${bookingId}</span>
                </div>
                
                <div style="padding:15px;">
                    <h3 style="margin:0 0 10px 0; color:#0b74e7;">${selectedHotel.name}</h3>
                    <div style="font-size:0.85rem; line-height:1.6; color:#444;">
                        <div><strong>Guest:</strong> ${guestName}</div>
                        <div><strong>Phone:</strong> ${guestPhone}</div>
                        <div><strong>Check-in:</strong> ${searchedCheckIn || 'Confirmed'}</div>
                        <div><strong>Guests:</strong> ${searchedGuests || '2'}</div>
                        <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #ddd; font-weight:bold; font-size:1rem;">
                            Paid: ₹${selectedHotelPrice}
                        </div>
                    </div>
                </div>
            </div>

            <div style="display:flex; gap:10px;">
                <button onclick="window.print()" class="book-btn" style="background:#555; flex:1;">Print PDF</button>
                <button onclick="window.location.href='index.html'" class="book-btn" style="flex:1;">Return Home</button>
            </div>
        </div>
    `;
}

// INITIALIZE
attachListeners();
getHotels();
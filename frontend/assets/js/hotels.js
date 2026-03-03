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

const urlParams = new URLSearchParams(window.location.search);
const city = urlParams.get('city') || "Mumbai";
const searchedCheckIn = urlParams.get('checkIn') || "2026-03-04";
const searchedGuests = urlParams.get('guests') || "2";

let selectedHotel = null;
let selectedHotelPrice = 0;

// --- 1. FETCH & RENDER (Unchanged) ---
async function getHotels() {
    const header = document.getElementById("headerCity");
    if(header) header.innerText = `Hotels in ${city}`;
    try {
        const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${API_KEY}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        if(!geoData.features?.length) return;
        const { lat, lon } = geoData.features[0].properties;
        const hotelUrl = `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${lon},${lat},20000&limit=15&apiKey=${API_KEY}`;
        const res = await fetch(hotelUrl);
        const data = await res.json();
        renderHotels(data.features);
    } catch (err) { console.error("Fetch Error:", err); }
}

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
            </div>`;
        card.querySelector(".book-btn").onclick = () => openBookingModal(p, randomPrice);
        grid.appendChild(card);
    });
}

// --- 2. MODAL LOGIC (Modified for Steps) ---
function openBookingModal(hotel, price) {
    selectedHotel = hotel;
    selectedHotelPrice = price;
    document.getElementById("modalHotelName").innerText = hotel.name;
    document.getElementById("modalHotelAddress").innerText = `📍 ${hotel.address_line2 || city}`;
    document.getElementById("summaryCheckIn").innerText = searchedCheckIn;
    document.getElementById("summaryGuests").innerText = `${searchedGuests} Guests`;
    
    // Reset to Step 1
    document.getElementById("step1").classList.remove("hidden");
    document.getElementById("step2").classList.add("hidden");
    document.getElementById("bookingModal").classList.remove("hidden");
}

// ADDED: Navigation between Step 1 and Step 2
const btnGoToPayment = document.getElementById("goToPayment");
if (btnGoToPayment) {
    btnGoToPayment.onclick = () => {
        const name = document.getElementById("guestName").value;
        const phone = document.getElementById("guestPhone").value;
        if (!name || name.length < 3) return alert("Please enter guest name.");
        if (phone.length !== 10) return alert("Enter valid 10-digit phone.");

        document.getElementById("payAmount").innerText = `₹${selectedHotelPrice}`;
        document.getElementById("step1").classList.add("hidden");
        document.getElementById("step2").classList.remove("hidden");
    };
}

const btnBack = document.getElementById("backToStep1");
if (btnBack) btnBack.onclick = () => {
    document.getElementById("step2").classList.add("hidden");
    document.getElementById("step1").classList.remove("hidden");
};

// --- 3. FIREBASE SAVE & VOUCHER ---
const btnFinal = document.getElementById("confirmFinalBooking");
if (btnFinal) {
    btnFinal.onclick = async () => {
        btnFinal.innerText = "Verifying Payment...";
        btnFinal.disabled = true;

        try {
            await addDoc(collection(db, "bookings"), {
                hotelName: selectedHotel.name,
                checkIn: searchedCheckIn,
                guests: searchedGuests,
                guestName: document.getElementById("guestName").value,
                guestEmail: document.getElementById("guestEmail").value,
                amount: selectedHotelPrice,
                status: "Confirmed",
                createdAt: serverTimestamp()
            });
            showSuccessVoucher(); // Show ticket instead of alert
        } catch (e) {
            console.error(e);
            alert("Payment Failed.");
            btnFinal.innerText = "Pay & Confirm Booking";
            btnFinal.disabled = false;
        }
    };
}

// ADDED: Function to show professional success ticket
function showSuccessVoucher() {
    const container = document.getElementById("modalMainContent");
    const bookingId = "PNP-" + Math.random().toString(36).substr(2, 7).toUpperCase();
    
    container.innerHTML = `
        <div style="text-align:center; padding:30px;">
            <div class="success-check">✔</div>
            <h2 style="color:var(--text-main); margin-bottom:5px;">Booking Confirmed!</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">Pack your bags, ${document.getElementById("guestName").value}!</p>
            
            <div class="voucher-card">
                <div class="voucher-header">
                    <span>BOOKING VOUCHER</span>
                    <span>${bookingId}</span>
                </div>
                <div class="voucher-body">
                    <h3>${selectedHotel.name}</h3>
                    <div class="voucher-info">
                        <div><strong>Check-in:</strong> ${searchedCheckIn}</div>
                        <div><strong>Guests:</strong> ${searchedGuests}</div>
                        <div><strong>Paid:</strong> ₹${selectedHotelPrice}</div>
                    </div>
                </div>
            </div>
            <button onclick="window.location.href='index.html'" class="btn-primary-large">Return Home</button>
        </div>`;
}

document.getElementById("closeModal").onclick = () => {
    document.getElementById("bookingModal").classList.add("hidden");
};

getHotels();
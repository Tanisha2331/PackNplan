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

// Mock hotels data (fallback if API fails)
const MOCK_HOTELS = [
    { properties: { name: "The Oberoi ", address_line2: "Nariman Point" } },
    { properties: { name: "ITC Grand Central", address_line2: "Central" } },
    { properties: { name: "Taj Lands End", address_line2: "Bandra" } },
    { properties: { name: "The St. Regis ", address_line2: "Lower Parel" } },
    { properties: { name: "Four Seasons ", address_line2: "Marine Drive" } },
    { properties: { name: "Hilton ", address_line2: "Vile Parle" } },
    { properties: { name: "Park Hyatt ", address_line2: "Worli" } },
    { properties: { name: "Leela Kempinski", address_line2: "Sahar" } }
]; 

const urlParams = new URLSearchParams(window.location.search);
const city = urlParams.get('city') || "Mumbai";
const searchedCheckIn = urlParams.get('checkIn') || "2026-03-04";
const searchedCheckOut = urlParams.get('checkOut') || "2026-03-05";
const searchedGuests = urlParams.get('guests') || "2";

let selectedHotel = null;
let selectedHotelPrice = 0;

// --- 1. FETCH & RENDER (With fallback to mock data) ---
async function getHotels() {
    const header = document.getElementById("headerCity");
    if(header) header.innerText = `Hotels in ${city}`;
    
    try {
        console.log('Fetching hotels for:', city);
        const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${API_KEY}`;
        
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        
        console.log("Geo Data:", geoData);
        
        if(geoData.features && geoData.features.length > 0) {
            const { lat, lon } = geoData.features[0].properties;
            console.log(`City coords: ${lat}, ${lon}`);
            
            const hotelUrl = `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${lon},${lat},20000&limit=15&apiKey=${API_KEY}`;
            const res = await fetch(hotelUrl);
            const data = await res.json();
            
            console.log("Hotels Data:", data);
            
            if(data.features && data.features.length > 0) {
                renderHotels(data.features);
                return;
            }
        }
        
        // Fallback to mock data if API fails or returns no results
        console.warn("Using mock hotel data as fallback");
        renderHotels(MOCK_HOTELS);
        
    } catch (err) { 
        console.error("Fetch Error:", err);
        console.warn("Using mock hotel data as fallback");
        renderHotels(MOCK_HOTELS);
    }
}

function renderHotels(hotels) {
    const grid = document.getElementById("hotelGrid");
    if(!grid) {
        console.error("Hotel grid element not found!");
        return;
    }
    
    if(!hotels || hotels.length === 0) {
        grid.innerHTML = `<p>⚠️ No hotels available</p>`;
        return;
    }
    
    grid.innerHTML = "";
    let hotelCount = 0;
    
    hotels.forEach(h => {
        try {
            const p = h.properties;
            if(!p || !p.name) return;
            
            hotelCount++;
            const randomPrice = Math.floor(Math.random() * (8000 - 2000) + 2000);
            const rating = (Math.random() * (5 - 3.5) + 3.5).toFixed(1);
            const card = document.createElement("div");
            card.className = "hotel-card";

            // Generate unique image per hotel using picsum.photos with seed
            const hotelSlug = (p.name || `hotel-${Math.random()}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const seed = `hotel-${hotelSlug}`;
            const imageSource = `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/300`;

            const hotelName = p.name || 'Hotel';
            const hotelAddress = p.address_line2 || 'Address on request';
            
            card.innerHTML = `
                <div class="price-tag">₹${randomPrice}/night</div>
                <img src="${imageSource}" onerror="this.onerror=null; this.src='https://via.placeholder.com/400x300?text=Image+not+available';">
                <div class="card-content">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; font-size:1.1rem;"></h3>
                        <span style="color:#f1c40f;">⭐ ${rating}</span>
                    </div>
                    <p style="font-size:0.85rem; color:#666; margin:10px 0;">📍 </p>
                    <button class="book-btn">Confirm Availability</button>
                </div>`;
            
            // Set text content safely to avoid escaping issues
            card.querySelector("h3").textContent = hotelName;
            card.querySelector("p").textContent = "📍 " + hotelAddress;
            card.querySelector("img").alt = hotelName;
            
            const button = card.querySelector(".book-btn");
            if(button) {
                button.onclick = () => {
                    const params = new URLSearchParams({
                        hotelName: hotelName,
                        address: hotelAddress,
                        price: randomPrice,
                        city: city,
                        checkIn: searchedCheckIn,
                        checkOut: searchedCheckOut,
                        guests: searchedGuests,
                        itemType: 'Hotel'
                    });
                    window.location.href = `booking.html?${params.toString()}`;
                };
            }
            grid.appendChild(card);
        } catch(e) {
            console.error("Error rendering hotel:", e);
        }
    });
    
    console.log(`✅ Rendered ${hotelCount} hotels`);
}

getHotels();
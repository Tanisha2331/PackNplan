// ===============================
// 1. FIREBASE & LIBS
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
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

const API_KEY = "1158d45a31c54d4fa492f618703b1f7f"; // Your Geoapify Key

// ===============================
// 2. GET DATA FROM URL
// ===============================
const params = new URLSearchParams(window.location.search);
const city = params.get("city");
const days = parseInt(params.get("days")) || 3;

if (city) {
  document.getElementById("tripTitle").innerText = `Trip to ${city}`;
  document.getElementById("tripSubtitle").innerText = `${days} Day Itinerary`;
  generateItinerary(city, days);
}

// ===============================
// 3. LOGIC FUNCTIONS
// ===============================
async function generateItinerary(cityName, numDays) {
  try {
    const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cityName)}&apiKey=${API_KEY}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.features || geoData.features.length === 0) {
      document.getElementById("itinerary-content").innerHTML = "<div class='error'>City not found.</div>";
      return;
    }
    const { lat, lon } = geoData.features[0].properties;

    const limit = numDays * 3;
    const url = `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:${lon},${lat},10000&limit=${limit}&apiKey=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();
    renderItinerary(data.features, numDays);
  } catch (e) {
    console.error(e);
    document.getElementById("itinerary-content").innerHTML = "<div class='error'>Failed to generate plan.</div>";
  }
}

function renderItinerary(places, numDays) {
  const container = document.getElementById("itinerary-content");
  container.innerHTML = "";
  if (!places || places.length === 0) {
    container.innerHTML = "<p>No popular attractions found nearby.</p>";
    return;
  }

  let placeIndex = 0;
  for (let day = 1; day <= numDays; day++) {
    let dayHTML = `<div class="day-section"><div class="day-header">Day ${day}</div>`;
    for (let i = 0; i < 3; i++) {
      if (placeIndex < places.length) {
        const place = places[placeIndex].properties;
        const randomImg = `https://loremflickr.com/100/100/landmark?lock=${placeIndex}`;
        dayHTML += `
          <div class="activity-card">
            <img src="${randomImg}" class="activity-img" alt="Place">
            <div class="activity-info">
              <h4>${place.name || "Unknown Spot"}</h4>
              <p>📍 ${place.address_line2 || "Location unavailable"}</p>
            </div>
          </div>`;
        placeIndex++;
      }
    }
    dayHTML += `</div>`;
    container.innerHTML += dayHTML;
  }
}

// ===============================
// 4. BUTTON LISTENERS
// ===============================
document.getElementById("saveTripBtn")?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login to save your trip!");
    window.location.href = "login.html";
    return;
  }
  try {
    await addDoc(collection(db, "savedTrips"), {
      userId: user.uid,
      city,
      days,
      createdAt: new Date()
    });
    alert("Trip saved to your profile! 🎒");
  } catch (e) { alert("Error saving trip."); }
});

document.getElementById("downloadPdfBtn")?.addEventListener("click", () => {
  const element = document.getElementById("itinerary-content");
  // html2pdf is a global library added in HTML script tag
  html2pdf().from(element).save(`${city}_Itinerary.pdf`);
});
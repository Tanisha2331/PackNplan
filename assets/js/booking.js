// Firebase imports for auth check
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
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
const auth = getAuth(app);

// Check if user is logged in
let isUserLoggedIn = false;
onAuthStateChanged(auth, (user) => {
    isUserLoggedIn = !!user;
    if (!user) {
        // Show message that user needs to login
        const form = document.getElementById('bookingForm');
        if (form) {
            const loginPrompt = document.createElement('div');
            loginPrompt.style.cssText = `
                background: #fff3cd;
                border: 1px solid #ffc107;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                color: #856404;
            `;
            loginPrompt.innerHTML = `
                <strong>⚠️ Login Required</strong><br>
                Please log in to complete your booking.
                <button onclick="window.location.href='login.html'" style="
                    background: #0b74e7;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Go to Login</button>
            `;
            form.parentElement.insertBefore(loginPrompt, form);
            form.style.opacity = '0.5';
            form.style.pointerEvents = 'none';
        }
    }
});

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const hotelName = urlParams.get('hotelName');
const address = urlParams.get('address');
const basePrice = parseInt(urlParams.get('price')) || 0;
const city = urlParams.get('city');
const checkIn = urlParams.get('checkIn');
const checkOut = urlParams.get('checkOut');
const guests = urlParams.get('guests');
const itemType = (urlParams.get('itemType') || 'Hotel').trim();
const transportMode = (urlParams.get('transportMode') || '').trim().toLowerCase();

// Update page title and back button based on item type
document.title = `Pack & Plan — ${itemType} Booking Details`;
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
    if (itemType === 'Stay' || itemType === 'Attraction') {
        backBtn.onclick = () => window.location.href = `destination-details.html?city=${encodeURIComponent(city)}`;
        backBtn.textContent = `← Back to ${city}`;
    } else {
        backBtn.onclick = () => window.location.href = 'hotels.html';
        backBtn.textContent = '← Back to Hotels';
    }
}

// Update header text
const headerTitle = document.querySelector('h1');
if (headerTitle) {
    headerTitle.textContent = `Complete Your ${itemType} Booking`;
}

// Populate hotel/destination details
const hotelSummary = document.getElementById('hotelSummary');
const transportSummary = document.getElementById('transportSummary');
const transportTitle = document.getElementById('transportTitle');
const transportRoute = document.getElementById('transportRoute');
const pricePerNightEl = document.getElementById('pricePerNight');
const pricePerTicketEl = document.getElementById('pricePerTicket');

document.getElementById('hotelName').textContent = hotelName || 'Booking';
document.getElementById('hotelAddress').textContent = address || 'Address';

// Form elements
const form = document.getElementById('bookingForm');
const travelersInput = document.getElementById('travelers');
const nightsInput = document.getElementById('nights');
const addHotelTravelerBtn = document.getElementById('addHotelTravelerBtn');
const hotelTravelerFormsContainer = document.getElementById('hotelTravelerFormsContainer');
const transportTravelersInput = document.getElementById('transportTravelers');
const addTravelerBtn = document.getElementById('addTravelerBtn');
const travelerFormsContainer = document.getElementById('travelerFormsContainer');
const travelDateInput = document.getElementById('travelDate');
const pickupLocInput = document.getElementById('pickupLoc');
const dropLocInput = document.getElementById('dropLoc');
const travelTimeInput = document.getElementById('travelTime');
const busCabOptions = document.getElementById('busCabOptions');
const totalAmountEl = document.getElementById('totalAmount');
const summaryTravelers = document.getElementById('summaryTravelers');
const summaryNights = document.getElementById('summaryNights');
const summaryItem = document.getElementById('summaryItem');

// Determine transport vs hotel view
const isTransport = itemType.toLowerCase() === 'transport';

if (isTransport) {
    hotelSummary.style.display = 'none';
    document.getElementById('hotelDetails').style.display = 'none';
    transportSummary.style.display = 'block';
    document.getElementById('transportDetails').style.display = 'block';
    if (travelDateInput) travelDateInput.required = true;
    document.getElementById('summaryNightsBlock').style.display = 'none';
    document.getElementById('summaryItem').textContent = `${transportMode ? transportMode.charAt(0).toUpperCase() + transportMode.slice(1) : 'Transport'} Trip`;
    transportTitle.textContent = `${transportMode ? transportMode.charAt(0).toUpperCase() + transportMode.slice(1) : 'Transport'} Booking`;
    transportRoute.textContent = address || 'Route info';
    pricePerTicketEl.textContent = basePrice;

    // Show shared bus/cab fields only when needed
    if (busCabOptions) busCabOptions.style.display = 'none';

    if (transportMode === 'bus' || transportMode === 'cab') {
        if (busCabOptions) busCabOptions.style.display = 'block';
    }
    // Initialize defaults for transport fields
    if (transportTravelersInput) transportTravelersInput.value = 1;
    if (travelDateInput && checkIn) travelDateInput.value = checkIn;
} else {
    transportSummary.style.display = 'none';
    document.getElementById('hotelDetails').style.display = 'block';
    document.getElementById('transportDetails').style.display = 'none';
    if (travelDateInput) travelDateInput.required = false;
    document.getElementById('summaryNightsBlock').style.display = 'block';
    document.getElementById('summaryItem').textContent = hotelName || 'Hotel Booking';
    document.getElementById('hotelName').textContent = hotelName || 'Hotel Name';
    pricePerNightEl.textContent = basePrice;
}

const isFixedPrice = itemType === 'Stay' || itemType === 'Attraction';
if (isFixedPrice) {
    document.getElementById('hotelDetails').style.display = 'none';
    document.getElementById('summaryNightsBlock').style.display = 'none';
    pricePerNightEl.textContent = basePrice;
}

function renderTravelerForms(count) {
    travelerFormsContainer.innerHTML = '';
    const finalCount = Math.max(1, count);
    transportTravelersInput.value = finalCount;

    for (let i = 0; i < finalCount; i++) {
        const card = document.createElement('div');
        card.className = 'traveler-card';
        card.dataset.index = i;
        card.style.border = '1px solid #ccc';
        card.style.borderRadius = '8px';
        card.style.padding = '12px';
        card.style.marginBottom = '10px';

        let extraFieldsHtml = '';
        if (transportMode === 'flight') {
            extraFieldsHtml = `
                <div class="input-block">
                    <label>Seat Class</label>
                    <select class="traveler-seatClass" required>
                        <option value="Economy">Economy</option>
                        <option value="Business">Business</option>
                    </select>
                </div>
            `;
        } else if (transportMode === 'train') {
            extraFieldsHtml = `
                <div class="input-block">
                    <label>Berth Preference</label>
                    <select class="traveler-berthPreference" required>
                        <option value="Lower">Lower</option>
                        <option value="Middle">Middle</option>
                        <option value="Upper">Upper</option>
                    </select>
                </div>
            `;
        }

        card.innerHTML = `
            <h4>Traveler ${i + 1}</h4>
            <div class="input-block">
                <label>Name</label>
                <input type="text" class="traveler-name" placeholder="Full name" required>
            </div>
            <div class="input-block">
                <label>Age</label>
                <input type="number" min="0" class="traveler-age" placeholder="Age" required>
            </div>
            <div class="input-block">
                <label>Gender</label>
                <select class="traveler-gender" required>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            ${extraFieldsHtml}
            <button type="button" class="removeTravelerBtn btn-secondary" style="margin-top:8px;">Remove</button>
        `;

        card.querySelector('.removeTravelerBtn').addEventListener('click', () => {
            const newCount = Math.max(1, parseInt(transportTravelersInput.value) - 1);
            renderTravelerForms(newCount);
            calculateTotal();
        });

        travelerFormsContainer.appendChild(card);
    }
}

function getTravelerDetails() {
    const travelers = [];
    const cards = travelerFormsContainer.querySelectorAll('.traveler-card');

    cards.forEach((card, index) => {
        const name = card.querySelector('.traveler-name').value.trim();
        const age = card.querySelector('.traveler-age').value.trim();
        const gender = card.querySelector('.traveler-gender').value;

        const traveler = { name, age, gender, index: index + 1 };

        if (transportMode === 'flight') {
            traveler.seatClass = card.querySelector('.traveler-seatClass').value;
        } else if (transportMode === 'train') {
            traveler.berthPreference = card.querySelector('.traveler-berthPreference').value;
        }

        travelers.push(traveler);
    });

    return travelers;
}

function renderHotelTravelerForms(count) {
    hotelTravelerFormsContainer.innerHTML = '';
    const finalCount = Math.max(1, count);
    travelersInput.value = finalCount;

    for (let i = 0; i < finalCount; i++) {
        const card = document.createElement('div');
        card.className = 'traveler-card';
        card.dataset.index = i;
        card.style.border = '1px solid #ccc';
        card.style.borderRadius = '8px';
        card.style.padding = '12px';
        card.style.marginBottom = '10px';

        card.innerHTML = `
            <h4>Guest ${i + 1}</h4>
            <div class="input-block">
                <label>Name</label>
                <input type="text" class="hotel-traveler-name" placeholder="Full name" required>
            </div>
            <div class="input-block">
                <label>Age</label>
                <input type="number" min="0" class="hotel-traveler-age" placeholder="Age" required>
            </div>
            <div class="input-block">
                <label>Gender</label>
                <select class="hotel-traveler-gender" required>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <button type="button" class="removeHotelTravelerBtn btn-secondary" style="margin-top:8px;">Remove</button>
        `;

        card.querySelector('.removeHotelTravelerBtn').addEventListener('click', () => {
            const currentCount = parseInt(travelersInput.value) || 1;
            const newCount = Math.max(1, currentCount - 1);
            renderHotelTravelerForms(newCount);
            calculateTotal();
        });

        hotelTravelerFormsContainer.appendChild(card);
    }
}

function getHotelTravelerDetails() {
    const travelers = [];
    const cards = hotelTravelerFormsContainer.querySelectorAll('.traveler-card');

    cards.forEach((card, index) => {
        const name = card.querySelector('.hotel-traveler-name').value.trim();
        const age = card.querySelector('.hotel-traveler-age').value.trim();
        const gender = card.querySelector('.hotel-traveler-gender').value;

        travelers.push({ name, age, gender, index: index + 1 });
    });

    return travelers;
}

if (transportTravelersInput) {
    transportTravelersInput.addEventListener('change', (e) => {
        const count = parseInt(e.target.value) || 1;
        renderTravelerForms(count);
        calculateTotal();
    });
}

if (addTravelerBtn) {
    addTravelerBtn.addEventListener('click', () => {
        const count = parseInt(transportTravelersInput.value) || 1;
        renderTravelerForms(count + 1);
        calculateTotal();
    });
}

if (travelersInput) {
    travelersInput.addEventListener('change', (e) => {
        const count = parseInt(e.target.value) || 1;
        renderHotelTravelerForms(count);
        calculateTotal();
    });
}

if (addHotelTravelerBtn) {
    addHotelTravelerBtn.addEventListener('click', () => {
        const count = parseInt(travelersInput.value) || 1;
        renderHotelTravelerForms(count + 1);
        calculateTotal();
    });
}

// render default on load paths
if (isTransport) {
    renderTravelerForms(parseInt(transportTravelersInput.value) || 1);
} else {
    renderHotelTravelerForms(parseInt(travelersInput.value) || 1);
}

// Calculate total
function calculateTotal() {
    let total = 0;
    if (isTransport) {
        const travelers = parseInt(transportTravelersInput.value) || 1;
        total = basePrice * travelers;
        summaryTravelers.textContent = travelers;
        summaryNights.textContent = 'N/A';
        document.getElementById('summaryNightsBlock').style.display = 'none';
        document.getElementById('summaryGuestsBlock').style.display = 'block';
        summaryItem.textContent = `${transportMode ? transportMode.charAt(0).toUpperCase() + transportMode.slice(1) : 'Transport'} Trip`;
    } else if (isFixedPrice) {
        // For destinations and attractions, price is fixed total
        total = basePrice;
        summaryTravelers.textContent = 'N/A';
        summaryNights.textContent = 'N/A';
        document.getElementById('summaryGuestsBlock').style.display = 'none';
        document.getElementById('summaryNightsBlock').style.display = 'none';
        summaryItem.textContent = hotelName || 'Booking';
    } else {
        // For hotels, calculate based on travelers and nights
        const travelers = parseInt(travelersInput.value) || 1;
        const nights = parseInt(nightsInput.value) || 1;
        total = basePrice * nights * travelers;
        summaryTravelers.textContent = travelers;
        summaryNights.textContent = nights;
        document.getElementById('summaryGuestsBlock').style.display = 'block';
        document.getElementById('summaryNightsBlock').style.display = 'block';
        summaryItem.textContent = hotelName || 'Hotel Booking';
    }

    totalAmountEl.textContent = `₹${total}`;
    return { total };
}

function setInvalid(el) {
    if (!el) return;
    el.classList.add('input-invalid');
}

function clearInvalids() {
    const invalids = document.querySelectorAll('.input-invalid');
    invalids.forEach(el => el.classList.remove('input-invalid'));
    const notes = document.querySelectorAll('.validation-note');
    notes.forEach(n => n.remove());
}

function showValidationNote(field, message) {
    const n = document.createElement('small');
    n.className = 'validation-note';
    n.textContent = message;
    field.closest('.input-block')?.appendChild(n);
}

// Update on input change
if (isTransport && transportTravelersInput) {
    transportTravelersInput.addEventListener('input', calculateTotal);
}

if (!isFixedPrice && !isTransport) {
    if (travelersInput) travelersInput.addEventListener('input', calculateTotal);
    if (nightsInput) nightsInput.addEventListener('input', calculateTotal);
}

// Hide travelers and nights inputs for fixed-price items
if (isFixedPrice) {
    const hotelSection = document.querySelector('.form-section:nth-child(2)');
    if (hotelSection) hotelSection.style.display = 'none';
}

// Initial calculation
calculateTotal();

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Define hotelTravelerDetails at the top so it's accessible globally in this function
    let hotelTravelerDetails = []; 

    if (!isUserLoggedIn) {
        alert('Please log in to complete this booking');
        window.location.href = 'login.html';
        return;
    }

    clearInvalids();

    const guestNameField = document.getElementById('guestName');
    const emailField = document.getElementById('guestEmail');
    const phoneField = document.getElementById('guestPhone');
    const guestName = guestNameField.value.trim();
    const email = emailField.value.trim();
    const phone = phoneField.value.trim();
    let firstInvalidField = null;

    // Basic Validation
    if (!guestName) {
        setInvalid(guestNameField);
        showValidationNote(guestNameField, 'Lead passenger name is required');
        firstInvalidField = firstInvalidField || guestNameField;
    }
    if (!email) {
        setInvalid(emailField);
        showValidationNote(emailField, 'Email is required');
        firstInvalidField = firstInvalidField || emailField;
    }
    if (!phone || phone.length !== 10) {
        setInvalid(phoneField);
        showValidationNote(phoneField, 'Enter a valid 10-digit phone number');
        firstInvalidField = firstInvalidField || phoneField;
    }

    if (firstInvalidField) {
        firstInvalidField.focus();
        window.scrollTo({ top: firstInvalidField.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    let travelers = 1;
    let nights = 1;
    let transportDate = checkIn;
    let transportData = {};

    // --- DYNAMIC TRANSPORT LOGIC ---
    if (isTransport) {
        travelers = parseInt(transportTravelersInput.value) || 1;
        nights = 1;
        transportDate = travelDateInput.value;

        if (!transportDate) {
            setInvalid(travelDateInput);
            showValidationNote(travelDateInput, 'Please select a travel date');
            travelDateInput.focus();
            return;
        }

        const travelerDetails = getTravelerDetails();
        let travelerInvalid = false;

        // Dynamic validation for each traveler card
        travelerFormsContainer.querySelectorAll('.traveler-card').forEach((card) => {
            const nameField = card.querySelector('.traveler-name');
            const ageField = card.querySelector('.traveler-age');
            const genderField = card.querySelector('.traveler-gender');

            if (!nameField.value.trim() || !ageField.value.trim() || !genderField.value) {
                setInvalid(nameField); setInvalid(ageField); setInvalid(genderField);
                travelerInvalid = true;
            }

            // Conditional validation for Flight/Train
            if (transportMode === 'flight' && !card.querySelector('.traveler-seatClass').value) travelerInvalid = true;
            if (transportMode === 'train' && !card.querySelector('.traveler-berthPreference').value) travelerInvalid = true;
        });

        if (travelerInvalid) {
            alert('Please fill in all traveler details, including preferences.');
            return;
        }

        // Logic for Bus/Cab specific fields
        if (transportMode === 'bus' || transportMode === 'cab') {
            const pickupLoc = pickupLocInput?.value.trim();
            const dropLoc = dropLocInput?.value.trim();
            const travelTime = travelTimeInput?.value;

            if (!pickupLoc || !dropLoc || !travelTime) {
                alert('Please fill in Pickup, Drop, and Time for your trip.');
                return;
            }
            transportData = { pickupLoc, dropLoc, travelTime, travelerDetails };
        } else {
            transportData = { travelerDetails };
        }

    // --- HOTEL / ATTRACTION LOGIC ---
    } else if (!isFixedPrice) {
        travelers = parseInt(travelersInput.value) || 1;
        nights = parseInt(nightsInput.value) || 1;
        hotelTravelerDetails = getHotelTravelerDetails();

        if (hotelTravelerDetails.some(h => !h.name || !h.age || !h.gender)) {
            alert('Please complete all hotel guest details.');
            return;
        }
    }

    // Final Calculation and Redirection
    const totals = calculateTotal();
    const totalAmount = totals.total;
    const paidAmount = 999;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    if (submitBtn) {
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
    }

    try {
        const bookingId = 'BOOK-' + Date.now();
        localStorage.setItem('bookingDetails', JSON.stringify({
            bookingId, hotelName, guestName, email, phone,
            totalAmount, paidAmount, remainingAmount,
            travelers, nights, checkIn: transportDate,
            address, itemType, city, transportMode,
            transportData, hotelTravelerDetails
        }));

        window.location.href = 'payment.html';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Booking failed. Please try again.');
        submitBtn.textContent = 'Proceed to Payment';
        submitBtn.disabled = false;
    }
});
// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Firebase config
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

// Get booking details from localStorage
const bookingDetailsStr = localStorage.getItem('bookingDetails');

if (bookingDetailsStr) {
    const bookingDetails = JSON.parse(bookingDetailsStr);

   // 1. Display booking ID
    document.getElementById('bookingId').textContent = bookingDetails.bookingId || 'N/A';

    // 2. FIX: Handle missing Hotel Name by falling back to City or Address
    // This ensures Destination Cards (Jaipur/Manali) show the name instead of N/A
    const displayName = bookingDetails.hotelName || bookingDetails.city || bookingDetails.address || 'Trip Destination';
    document.getElementById('hotelName').textContent = displayName;

    // 3. Display Guest Name
    document.getElementById('guestName').textContent = bookingDetails.guestName || 'N/A';

    // 4. FIX: Ensure totalAmount is pulled correctly
    const amount = bookingDetails.totalAmount || 0;
    document.getElementById('totalAmount').textContent = `₹${amount}`;

    // Wait for auth state to be ready, then save booking if payment was completed
    const paymentCompleted = localStorage.getItem('paymentCompleted');
    if (paymentCompleted === 'true') {
        // Use onAuthStateChanged to wait for auth state to be loaded
        onAuthStateChanged(auth, (user) => {
            saveBookingToFirebase(bookingDetails, user);
        });
    }
} else {
    console.warn('No booking details found in localStorage');
}

// Function to save booking to Firebase
async function saveBookingToFirebase(bookingDetails, user) {
    try {
        if (!user) {
            console.warn('User not authenticated - cannot save booking');
            showToast('Please log in to save your booking', 'error');
            // Optionally redirect to login after delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        console.log("Booking details from localStorage:", bookingDetails);

        // Prepare booking data - keep it SIMPLE like before
        const bookingData = {
            userId: user.uid,
            userEmail: user.email,
            hotelName: bookingDetails.hotelName || 'Booking',
            itemName: bookingDetails.itemName || bookingDetails.hotelName || '',
            location: bookingDetails.address || bookingDetails.city || '',
            checkIn: bookingDetails.checkIn || '',
            checkOut: bookingDetails.checkOut || '',
            travelDate: bookingDetails.travelDate || '',
            guests: bookingDetails.guests || `${bookingDetails.travelers || 1} Travelers`,
            totalAmount: bookingDetails.totalAmount || 0,
            itemType: bookingDetails.itemType || 'Hotel',
            transportMode: bookingDetails.transportMode || '',
            transportData: bookingDetails.transportData || {},
            hotelTravelerDetails: bookingDetails.hotelTravelerDetails || [],
            status: 'Confirmed',
            bookingDate: serverTimestamp(),
            guestName: bookingDetails.guestName || '',
            email: bookingDetails.email || user.email,
            phone: bookingDetails.phone || '',
            nights: bookingDetails.nights || 0,
            bookingId: bookingDetails.bookingId || ''
        };

        // Save to Firestore
        const docRef = await addDoc(collection(db, "bookings"), bookingData);
        console.log("Booking saved successfully with ID: ", docRef.id);
        console.log("Booking data saved:", bookingData);

        // Clear the payment completion flag to prevent duplicate saves
        localStorage.removeItem('paymentCompleted');

        // Optional: Show success message
        showToast("Booking saved successfully!", "success");

    } catch (error) {
        console.error("Error saving booking to Firebase:", error);
        showToast("Error saving booking. Please contact support.", "error");
    }
}

// Toast notification function
function showToast(message, type = "info", duration = 3500) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.style.cssText = `
        background: ${type === 'success' ? 'linear-gradient(135deg, #f1f8f4, #ffffff)' : type === 'error' ? 'linear-gradient(135deg, #fef5f5, #ffffff)' : 'linear-gradient(135deg, #f0f9ff, #ffffff)'};
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        border-left: 4px solid ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#00b4d8'};
        animation: slideIn 0.3s ease-out;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s ease-out;
        font-family: "Poppins", sans-serif;
        font-size: 14px;
        color: #333;
    `;

    toast.innerHTML = `<div style="display: flex; align-items: center; gap: 10px;">${message}</div>`;

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);

    // Remove after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
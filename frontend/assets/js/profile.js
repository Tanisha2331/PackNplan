// --- THEME SYNC FOR PROFILE ---
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
    }
}
// Run immediately when profile page loads
applyTheme();

// Handle the 'Back' button correctly
window.addEventListener('pageshow', applyTheme);
// assets/js/profile.js

// 1. IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// 2. CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyDfP1XaMtkGuBeSrl4fRw-Zi3l7_5sPm_w",
  authDomain: "packnplan-3312d.firebaseapp.com",
  projectId: "packnplan-3312d",
  storageBucket: "packnplan-3312d.firebasestorage.app",
  messagingSenderId: "976654836537",
  appId: "1:976654836537:web:4d9b292611ccd5328b3ee8"
};

// Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 3. DOM ELEMENTS
const nameEl = document.getElementById("profileName");
const emailEl = document.getElementById("profileEmail");
const phoneEl = document.getElementById("profilePhone");
const picEl = document.getElementById("profilePic");
const logoutBtn = document.getElementById("logoutBtn");

// Modal Elements
const editModal = document.getElementById("editModal");
const openEditBtn = document.getElementById("openEditBtn");
const btnCancel = document.getElementById("btnCancel");
const btnSave = document.getElementById("btnSave");
const inputName = document.getElementById("inputName");
const inputPhone = document.getElementById("inputPhone");

// Password Modal Elements
const passwordModal = document.getElementById("passwordModal");
const openPasswordBtn = document.getElementById("openPasswordBtn");
const btnPasswordCancel = document.getElementById("btnPasswordCancel");
const btnChangePassword = document.getElementById("btnChangePassword");
const inputCurrentPassword = document.getElementById("inputCurrentPassword");
const inputNewPassword = document.getElementById("inputNewPassword");
const inputConfirmPassword = document.getElementById("inputConfirmPassword");
const passwordMessage = document.getElementById("passwordMessage");

// Forgot Password Modal Elements
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const forgotPasswordBtnProfile = document.getElementById("forgotPasswordBtnProfile");
const btnResetCancel = document.getElementById("btnResetCancel");
const btnSendReset = document.getElementById("btnSendReset");
const resetEmailInput = document.getElementById("resetEmailInput");
const resetMessage = document.getElementById("resetMessage");

// Trip History Modal Elements
const tripHistoryModal = document.getElementById("tripHistoryModal");
const openTripHistoryBtn = document.getElementById("openTripHistoryBtn");
const btnTripHistoryClose = document.getElementById("btnTripHistoryClose");
const bookingHistoryList = document.getElementById("bookingHistoryList");
const visitedTripsList = document.getElementById("visitedTripsList");
const tripTabs = document.querySelectorAll(".trip-tab");
const tripTabContents = document.querySelectorAll(".trip-tab-content");

// Toast Container
const toastContainer = document.getElementById("toastContainer");

// Variable to store current user ID
let currentUserId = null;

// 4. MAIN LOGIC (Check User)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // --- USER LOGGED IN ---
    console.log("Logged in:", user.uid);
    currentUserId = user.uid;

    // A. Set Basic Info
    nameEl.textContent = user.displayName || "Traveler";
    emailEl.textContent = user.email;
    if (user.photoURL) picEl.src = user.photoURL;

    // B. Fetch Firestore Data
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.name) nameEl.textContent = data.name;
        if (data.phone) phoneEl.textContent = data.phone;
        if (data.profilePic) picEl.src = data.profilePic;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }

  } else {
    // --- NO USER ---
    window.location.href = "login.html";
  }
});

// 5. EDIT MODAL LOGIC
if (openEditBtn) {
  openEditBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // Fill inputs with current text
    inputName.value = nameEl.textContent;
    inputPhone.value = phoneEl.textContent === "..." ? "" : phoneEl.textContent;
    
    // Show Modal
    editModal.classList.remove("hidden");
  });
}

if (btnCancel) {
  btnCancel.addEventListener("click", () => {
    editModal.classList.add("hidden");
  });
}

if (btnSave) {
  btnSave.addEventListener("click", async () => {
    if (!currentUserId) return;

    const newName = inputName.value;
    const newPhone = inputPhone.value;

    btnSave.textContent = "Saving...";

    try {
      const userRef = doc(db, "users", currentUserId);
      
      // Update Firestore
      await updateDoc(userRef, {
        name: newName,
        phone: newPhone
      });

      // Update UI immediately
      nameEl.textContent = newName;
      phoneEl.textContent = newPhone;
      
      // Close Modal
      editModal.classList.add("hidden");
      alert("Profile Updated!");
      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save. See console.");
    } finally {
      btnSave.textContent = "Save Changes";
    }
  });
}

// 6. LOGOUT LOGIC
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = "login.html";
  });
}

// ========================================
// 7. CHANGE PASSWORD LOGIC
// ========================================
if (openPasswordBtn) {
  openPasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // Clear all inputs
    inputCurrentPassword.value = "";
    inputNewPassword.value = "";
    inputConfirmPassword.value = "";
    passwordMessage.textContent = "";
    passwordMessage.className = "modal-message";
    passwordModal.classList.remove("hidden");
  });
}

if (btnPasswordCancel) {
  btnPasswordCancel.addEventListener("click", () => {
    passwordModal.classList.add("hidden");
    inputCurrentPassword.value = "";
    inputNewPassword.value = "";
    inputConfirmPassword.value = "";
    passwordMessage.textContent = "";
  });
}

if (btnChangePassword) {
  btnChangePassword.addEventListener("click", async () => {
    const currentPassword = inputCurrentPassword.value;
    const newPassword = inputNewPassword.value;
    const confirmPassword = inputConfirmPassword.value;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      passwordMessage.textContent = "❌ All fields are required";
      passwordMessage.className = "modal-message error";
      return;
    }

    if (newPassword.length < 6) {
      passwordMessage.textContent = "❌ New password must be at least 6 characters";
      passwordMessage.className = "modal-message error";
      return;
    }

    if (newPassword !== confirmPassword) {
      passwordMessage.textContent = "❌ Passwords don't match";
      passwordMessage.className = "modal-message error";
      return;
    }

    if (currentPassword === newPassword) {
      passwordMessage.textContent = "❌ New password must be different from current password";
      passwordMessage.className = "modal-message error";
      return;
    }

    btnChangePassword.textContent = "Changing...";
    passwordMessage.textContent = "";

    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("No user logged in");

      // Reauthenticate with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      passwordMessage.textContent = "✅ Password changed successfully!";
      passwordMessage.className = "modal-message success";

      // Clear inputs and close after 1.5 seconds
      setTimeout(() => {
        passwordModal.classList.add("hidden");
        inputCurrentPassword.value = "";
        inputNewPassword.value = "";
        inputConfirmPassword.value = "";
        passwordMessage.textContent = "";
      }, 1500);

    } catch (error) {
      console.error("Error changing password:", error);
      
      // Handle different Firebase error codes
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        passwordMessage.textContent = "❌ Current password is incorrect";
      } else if (error.code === "auth/weak-password") {
        passwordMessage.textContent = "❌ New password is too weak";
      } else if (error.code === "auth/requires-recent-login") {
        passwordMessage.textContent = "❌ Please logout and login again before changing password";
      } else {
        passwordMessage.textContent = `❌ ${error.message || "Error changing password"}`;
      }
      passwordMessage.className = "modal-message error";
    } finally {
      btnChangePassword.textContent = "Change Password";
    }
  });
}

// ========================================
// 8. TRIP HISTORY LOGIC
// ========================================

// Open Trip History Modal
if (openTripHistoryBtn) {
  openTripHistoryBtn.addEventListener("click", (e) => {
    e.preventDefault();
    tripHistoryModal.classList.remove("hidden");
    loadBookingHistory(); // Load default tab
  });
}

// Close Trip History Modal
if (btnTripHistoryClose) {
  btnTripHistoryClose.addEventListener("click", () => {
    tripHistoryModal.classList.add("hidden");
  });
}

// Trip History Tab Switching
if (tripTabs.length > 0) {
  tripTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;

      // Remove active class from all tabs and contents
      tripTabs.forEach(t => t.classList.remove("active"));
      tripTabContents.forEach(content => content.classList.remove("active"));

      // Add active class to clicked tab and corresponding content
      tab.classList.add("active");
      document.getElementById(tabName + "TripsTab").classList.add("active");

      // Load data based on tab
      if (tabName === "booking") {
        loadBookingHistory();
      } else if (tabName === "visited") {
        loadVisitedTrips();
      }
    });
  });
}

// Function to load booking history
async function loadBookingHistory() {
  if (!currentUserId) return;

  bookingHistoryList.innerHTML = '<p class="loading">Loading your bookings...</p>';

  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("userId", "==", currentUserId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      bookingHistoryList.innerHTML = `
        <div class="empty-message">
          <p>📭 No bookings yet</p>
          <p style="font-size: 0.9rem; color: #999;">Start planning your next adventure!</p>
        </div>
      `;
      return;
    }

    const bookings = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      bookings.push({ id: docSnap.id, ...data });
    });

    bookings.sort((a, b) => {
      const dA = a.bookingDate?.toDate?.() || new Date(a.bookingDate);
      const dB = b.bookingDate?.toDate?.() || new Date(b.bookingDate);
      return dB - dA;
    });

    let html = "";
    bookings.forEach((data) => {
      // Handle different booking data structures
      const hotelName = data.hotelName || data.itemName || "Unknown Hotel";
      const location = data.location || "N/A";
      const checkIn = data.checkIn || "N/A";
      const checkOut = data.checkOut || "N/A";
      const guests = data.guests || data.guestName || "N/A";
      const totalAmount = data.totalAmount || data.amount || data.price || 0;
      const itemType = data.itemType || "N/A";

      const bookingDate = data.bookingDate?.toDate?.() || new Date(data.createdAt?.toDate?.() || data.bookingDate);
      const formattedDate = bookingDate.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      html += `
        <div class="history-item">
          <div class="history-header">
            <h4>${hotelName}</h4>
            <span class="booking-status ${data.status?.toLowerCase() || "confirmed"}">${data.status || "Confirmed"}</span>
          </div>
          <div class="history-details">
            <p><strong>📍 Location:</strong> ${location}</p>
            <p><strong>📅 Check-in:</strong> ${checkIn}</p>
            <p><strong>📅 Check-out:</strong> ${checkOut}</p>
            <p><strong>👥 Guests:</strong> ${guests}</p>
            <p><strong>🎯 Type:</strong> ${itemType}</p>
            <p><strong>💰 Amount:</strong> ₹${totalAmount}</p>
            <p><strong>🕐 Booked on:</strong> ${formattedDate}</p>
          </div>
        </div>
      `;
    });

    bookingHistoryList.innerHTML = html;

  } catch (error) {
    console.error("Error loading booking history:", error);
    if (error.code === "failed-precondition" || error.message?.includes("index")) {
      bookingHistoryList.innerHTML = `<p class="loading" style="color: red;">❌ Firestore requires an index for this query. Go to Firebase console and create the recommended index.</p>`;
    } else {
      bookingHistoryList.innerHTML = `<p class="loading" style="color: red;">❌ Error loading bookings</p>`;
    }
    showToast("Booking history load issue: " + (error.message || "unknown"), "error");
  }
}

// Function to load visited trips
async function loadVisitedTrips() {
  if (!currentUserId) return;

  visitedTripsList.innerHTML = '<p class="loading">Loading your visited trips...</p>';

  try {
    const visitedsRef = collection(db, "visitedTrips");
    const q = query(visitedsRef, where("userId", "==", currentUserId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      visitedTripsList.innerHTML = `
        <div class="empty-message">
          <p>🗺️ No visited trips yet</p>
          <p style="font-size: 0.9rem; color: #999;">Your travel history will appear here</p>
        </div>
      `;
      return;
    }

    const visits = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      visits.push({ id: docSnap.id, ...data });
    });

    visits.sort((a, b) => {
      const dA = a.visitDate?.toDate?.() || new Date(a.visitDate);
      const dB = b.visitDate?.toDate?.() || new Date(b.visitDate);
      return dB - dA;
    });

    let html = "";
    visits.forEach((data) => {
      const visitDate = data.visitDate?.toDate?.() || new Date(data.visitDate);
      const formattedDate = visitDate.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });

      html += `
        <div class="history-item">
          <div class="history-header">
            <h4>${data.destination || "Unknown Destination"}</h4>
            <span class="visit-badge">✅ Visited</span>
          </div>
          <div class="history-details">
            <p><strong>📍 Destination:</strong> ${data.destination || "N/A"}</p>
            <p><strong>📅 Visit Date:</strong> ${formattedDate}</p>
            <p><strong>⏱️ Duration:</strong> ${data.duration || "N/A"} days</p>
            <p><strong>🎯 Type:</strong> ${data.tripType || "N/A"}</p>
            <p><strong>⭐ Rating:</strong> ${data.rating ? `${data.rating}/5` : "Not rated"}</p>
            ${data.notes ? `<p><strong>📝 Notes:</strong> ${data.notes}</p>` : ""}
          </div>
        </div>
      `;
    });

    visitedTripsList.innerHTML = html;

  } catch (error) {
    console.error("Error loading visited trips:", error);
    if (error.code === "permission-denied") {
      visitedTripsList.innerHTML = `<p class="loading" style="color: red;">❌ Missing permissions. Ensure Firestore security rules allow authenticated users to read visitedTrips.</p>`;
      showToast("Visited trips permission denied. Update Firestore rules.", "warning");
    } else {
      visitedTripsList.innerHTML = `<p class="loading" style="color: red;">❌ Error loading visited trips</p>`;
      showToast("Visited trips load issue: " + (error.message || "unknown"), "error");
    }
  }
}

// ========================================
// 9. TOAST NOTIFICATION SYSTEM
// ========================================
function showToast(message, type = "info", duration = 3500) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-content">${message}</div>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ========================================
// 10. FORGOT PASSWORD LOGIC
// ========================================
if (forgotPasswordBtnProfile) {
  forgotPasswordBtnProfile.addEventListener("click", (e) => {
    e.preventDefault();
    passwordModal.classList.add("hidden");
    forgotPasswordModal.classList.remove("hidden");
    resetEmailInput.value = emailEl.textContent || ""; // Pre-fill with user's email
    resetMessage.textContent = "";
  });
}

if (btnResetCancel) {
  btnResetCancel.addEventListener("click", () => {
    forgotPasswordModal.classList.add("hidden");
    passwordModal.classList.remove("hidden");
    resetEmailInput.value = "";
    resetMessage.textContent = "";
  });
}

if (btnSendReset) {
  btnSendReset.addEventListener("click", async () => {
    const emailValue = resetEmailInput.value.trim();

    if (!emailValue) {
      resetMessage.textContent = "❌ Please enter your email address";
      resetMessage.className = "modal-message error";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      resetMessage.textContent = "❌ Please enter a valid email address";
      resetMessage.className = "modal-message error";
      return;
    }

    btnSendReset.textContent = "Sending...";
    resetMessage.textContent = "";

    try {
      await sendPasswordResetEmail(auth, emailValue);
      resetMessage.textContent = "✅ Password reset email sent! Check your inbox.";
      resetMessage.className = "modal-message success";

      setTimeout(() => {
        forgotPasswordModal.classList.add("hidden");
        resetEmailInput.value = "";
        resetMessage.textContent = "";
        showToast("📧 Password reset link sent to your email", "success");
      }, 2000);

    } catch (error) {
      console.error("Reset Error:", error);

      if (error.code === "auth/user-not-found") {
        resetMessage.textContent = "❌ No account found with this email";
      } else if (error.code === "auth/invalid-email") {
        resetMessage.textContent = "❌ Invalid email address";
      } else {
        resetMessage.textContent = "❌ Error sending reset email. Try again.";
      }
      resetMessage.className = "modal-message error";
    } finally {
      btnSendReset.textContent = "Send Reset Link";
    }
  });
}
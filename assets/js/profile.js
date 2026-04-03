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

// 1. IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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
const storage = getStorage(app);

// 3. DOM ELEMENTS
const nameEl = document.getElementById("profileName");
const emailEl = document.getElementById("profileEmail");
const phoneEl = document.getElementById("profilePhone");
const picEl = document.getElementById("profilePic");
const logoutBtn = document.getElementById("logoutBtn");
const changePicButton = document.getElementById("changePicButton");
const profilePicInput = document.getElementById("profilePicInput");
// Modal Elements
const editModal = document.getElementById("editModal");
const openEditBtn = document.getElementById("openEditBtn");
const btnCancel = document.getElementById("btnCancel");
const btnSave = document.getElementById("btnSave");
const inputName = document.getElementById("inputName");
const inputPhone = document.getElementById("inputPhone");

const openPasswordBtn = document.getElementById("openPasswordBtn");
const passwordModal = document.getElementById("passwordModal");
const btnPasswordCancel = document.getElementById("btnPasswordCancel");
const btnChangePassword = document.getElementById("btnChangePassword");
const inputCurrentPassword = document.getElementById("inputCurrentPassword");
const inputNewPassword = document.getElementById("inputNewPassword");
const inputConfirmPassword = document.getElementById("inputConfirmPassword");
const passwordMessage = document.getElementById("passwordMessage");

const forgotPasswordBtnProfile = document.getElementById("forgotPasswordBtnProfile");
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const btnResetCancel = document.getElementById("btnResetCancel");
const btnSendReset = document.getElementById("btnSendReset");
const resetEmailInput = document.getElementById("resetEmailInput");
const resetMessage = document.getElementById("resetMessage");

const openTripHistoryBtn = document.getElementById("openTripHistoryBtn");
const tripHistoryModal = document.getElementById("tripHistoryModal");
const btnTripHistoryClose = document.getElementById("btnTripHistoryClose");
const bookingHistoryTab = document.getElementById("bookingHistoryTab");
const visitedTripsTab = document.getElementById("visitedTripsTab");
const bookingHistoryList = document.getElementById("bookingHistoryList");
const visitedTripsList = document.getElementById("visitedTripsList");
const tripTabButtons = document.querySelectorAll(".trip-tab");

// Variable to store current user ID
let currentUserId = null;

function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) {
    console.log(message);
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 4. MAIN LOGIC (Check User)
// 4. MAIN LOGIC (Check User)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserId = user.uid;

    nameEl.textContent = user.displayName || "Traveler";
    emailEl.textContent = user.email;
    if (user.photoURL) picEl.src = user.photoURL;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.name) nameEl.textContent = data.name;
        if (data.phone) phoneEl.textContent = data.phone;
        if (data.profilePic) {
          picEl.src = data.profilePic;
          changePicButton.textContent = "Change Profile Picture";
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  } else {
    // No user is signed in
    window.location.href = "login.html";
  }
}); // <--- Make sure this has BOTH the brace and the parenthesis

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

// 6. PASSWORD CHANGE LOGIC
if (openPasswordBtn) {
  openPasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    passwordMessage.textContent = "";
    inputCurrentPassword.value = "";
    inputNewPassword.value = "";
    inputConfirmPassword.value = "";
    passwordModal.classList.remove("hidden");
  });
}

if (btnPasswordCancel) {
  btnPasswordCancel.addEventListener("click", () => passwordModal.classList.add("hidden"));
}

if (btnChangePassword) {
  btnChangePassword.addEventListener("click", async () => {
    if (!currentUserId) {
      passwordMessage.textContent = "Please sign in again.";
      return;
    }

    const currentPassword = inputCurrentPassword.value.trim();
    const newPassword = inputNewPassword.value.trim();
    const confirmPassword = inputConfirmPassword.value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      passwordMessage.textContent = "All fields are required.";
      return;
    }

    if (newPassword.length < 6) {
      passwordMessage.textContent = "New password must be at least 6 characters.";
      return;
    }

    if (newPassword !== confirmPassword) {
      passwordMessage.textContent = "New passwords do not match.";
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        passwordMessage.textContent = "Unable to verify user. Please login again.";
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      passwordMessage.style.color = "green";
      passwordMessage.textContent = "Password changed successfully!";
      showToast("🔐 Password changed successfully", "success");
      setTimeout(() => passwordModal.classList.add("hidden"), 1200);
    } catch (error) {
      console.error("Change password error", error);
      if (error.code === "auth/wrong-password") {
        passwordMessage.textContent = "Current password is incorrect.";
      } else if (error.code === "auth/requires-recent-login") {
        passwordMessage.textContent = "Please sign out and sign in again to update password.";
      } else {
        passwordMessage.textContent = error.message || "Failed to change password.";
      }
      passwordMessage.style.color = "red";
    }
  });
}

if (forgotPasswordBtnProfile) {
  forgotPasswordBtnProfile.addEventListener("click", (e) => {
    e.preventDefault();
    passwordModal.classList.add("hidden");
    resetEmailInput.value = emailEl.textContent || "";
    resetMessage.textContent = "";
    forgotPasswordModal.classList.remove("hidden");
  });
}

if (btnResetCancel) {
  btnResetCancel.addEventListener("click", () => forgotPasswordModal.classList.add("hidden"));
}

if (btnSendReset) {
  btnSendReset.addEventListener("click", async () => {
    const email = resetEmailInput.value.trim();
    if (!email) {
      resetMessage.textContent = "Please enter your email address.";
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      resetMessage.style.color = "green";
      resetMessage.textContent = "Reset link sent to your email.";
      showToast("Reset link sent", "success");
      setTimeout(() => forgotPasswordModal.classList.add("hidden"), 1400);
    } catch (error) {
      console.error("Reset password error", error);
      resetMessage.style.color = "red";
      resetMessage.textContent = error.message || "Failed to send reset email.";
    }
  });
}

// 7. TRIP HISTORY LOGIC
async function loadBookingHistory() {
  if (!currentUserId) return;
  bookingHistoryList.innerHTML = "<p class='loading'>Loading your bookings...</p>";

  try {
    const q = query(collection(db, "bookings"), where("userId", "==", currentUserId));
    const snap = await getDocs(q);

  if (snap.empty) {
  bookingHistoryList.innerHTML = `
    <div class="empty-message">
        <div class="empty-icon-container">
            <i class="fas fa-inbox"></i> 
        </div>
        <p class="empty-title">No bookings yet</p>
        <p class="empty-sub">Start planning your next adventure!</p>
    </div>
  `;
  return;
}

    bookingHistoryList.innerHTML = "";
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const created = data.bookingDate ? new Date(data.bookingDate.seconds * 1000).toLocaleDateString() : "N/A";
      const title = data.hotelName || data.itemName || "Trip";
      bookingHistoryList.innerHTML += `
        <div class="history-card">
          <h4>${title}</h4>
          <p>📍 ${data.location || "N/A"}</p>
          <p>🕒 ${data.checkIn || "N/A"} — ${data.checkOut || "N/A"}</p>
          <p>💰 ${data.totalAmount ? '₹' + data.totalAmount : data.amount ? '₹'+data.amount : 'N/A'}</p>
          <p>🗓️ Booked on ${created}</p>
        </div>`;
    });
  } catch (error) {
    console.error("Booking history load error", error);
    bookingHistoryList.innerHTML = "<p style='text-align:center; color:red;'>Failed to load booking history.</p>";
  }
}

async function loadVisitedHistory() {
  if (!currentUserId) return;
  visitedTripsList.innerHTML = "<p class='loading'>Loading your visited trips...</p>";

  try {
    const q = query(collection(db, "visitedTrips"), where("userId", "==", currentUserId));
    const snap = await getDocs(q);

    if (snap.empty) {
      visitedTripsList.innerHTML = "<div style='text-align:center; padding:20px;'><h3>No visited trips yet.</h3></div>";
      return;
    }

    visitedTripsList.innerHTML = "";
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      visitedTripsList.innerHTML += `
        <div class="history-card">
          <h4>${data.location || data.hotelName || "Visited Trip"}</h4>
          <p>🕒 ${data.checkIn || "N/A"} — ${data.checkOut || "N/A"}</p>
          <p>👥 ${data.guests || "N/A"}</p>
          <p>🗓️ Visited on ${data.visitedDate ? new Date(data.visitedDate.seconds * 1000).toLocaleDateString() : "N/A"}</p>
        </div>`;
    });
  } catch (error) {
    console.error("Visited trips load error", error);
    visitedTripsList.innerHTML = "<p style='text-align:center; color:red;'>Failed to load visited trips.</p>";
  }
}

if (openTripHistoryBtn) {
  openTripHistoryBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    tripHistoryModal.classList.remove("hidden");
    tripTabButtons.forEach((btn) => btn.classList.remove("active"));
    document.querySelectorAll(".trip-tab-content").forEach((el) => el.classList.remove("active"));
    document.querySelector(".trip-tab[data-tab='booking']")?.classList.add("active");
    bookingHistoryTab.classList.add("active");
    await loadBookingHistory();
  });
}

if (btnTripHistoryClose) {
  btnTripHistoryClose.addEventListener("click", () => tripHistoryModal.classList.add("hidden"));
}

tripTabButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const target = btn.getAttribute("data-tab");

    tripTabButtons.forEach((t) => t.classList.remove("active"));
    btn.classList.add("active");

    if (target === "booking") {
      bookingHistoryTab.classList.add("active");
      visitedTripsTab.classList.remove("active");
      await loadBookingHistory();
    } else if (target === "visited") {
      visitedTripsTab.classList.add("active");
      bookingHistoryTab.classList.remove("active");
      await loadVisitedHistory();
    }
  });
});

// 8. LOGOUT LOGIC
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = "login.html";
  });
}

// 9. PROFILE PHOTO UPLOAD LOGIC 03/04/26

if (changePicButton) {
    changePicButton.addEventListener("click", () => {
        profilePicInput.click();
    });
}

if (profilePicInput) {
    profilePicInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const user = auth.currentUser;
        if (!user) return;

        // 1. Visual Feedback - Disable and show loading
        changePicButton.textContent = "Uploading...";
        changePicButton.disabled = true;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const apiKey = "4472c1a29a8eb827507cca6b0fdacbad"; 
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const uploadedUrl = result.data.url;

                // 2. Update Firestore
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    profilePic: uploadedUrl
                });

                // 3. Update UI immediately
                picEl.src = uploadedUrl;
                
                // CRITICAL: Set this explicitly here so it stays after the 1st, 2nd, or 10th upload
                changePicButton.textContent = "Change Profile Picture"; 
                
                showToast("Profile updated! 📸", "success");
            } else {
                throw new Error("Upload failed");
            }

        } catch (error) {
            console.error("Upload Error:", error);
            showToast("Failed to upload image.", "error");
            // Revert text only if it fails
            changePicButton.textContent = picEl.src.includes("flaticon.com") ? "Add Profile Picture" : "Change Profile Picture";
        } finally {
            changePicButton.disabled = false;
            profilePicInput.value = ""; // Reset the input so the SAME file can be picked again if needed
        }
    });
}
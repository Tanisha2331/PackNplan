// assets/js/profile.js

// 1. IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
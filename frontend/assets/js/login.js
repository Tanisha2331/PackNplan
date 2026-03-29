// 🔥 Firebase imports (Using stable version 10.8.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,// Needed to force logout if email is not verified
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔥 Firebase config
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
const db = getFirestore(app);

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Reset old messages and borders
  document.querySelectorAll(".error").forEach((el) => (el.innerText = ""));
  document.querySelectorAll("input").forEach((input) => {
    input.classList.remove("error-border", "valid-border");
  });

  const formData = {
    email: e.target.email.value.trim(),
    password: e.target.password.value.trim(),
  };

  const msg = document.getElementById("formMessage");
  msg.innerText = "";
  msg.style.color = "red";

  let isValid = true;

  // 1️⃣ General validation - both fields empty
  if (!formData.email && !formData.password) {
    msg.innerText = "All fields are required!";
    e.target.email.classList.add("error-border");
    e.target.password.classList.add("error-border");
    return;
  }

  // 2️⃣ Email validation
  if (!formData.email) {
    document.getElementById("emailError").innerText = "Please enter email";
    e.target.email.classList.add("error-border");
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    document.getElementById("emailError").innerText = "Please enter a valid email";
    e.target.email.classList.add("error-border");
    isValid = false;
  } else {
    e.target.email.classList.add("valid-border");
  }

  // 3️⃣ Password validation
  if (!formData.password) {
    document.getElementById("passwordError").innerText = "Please enter password";
    e.target.password.classList.add("error-border");
    isValid = false;
  } else {
    e.target.password.classList.add("valid-border");
  }

  // Stop if validation fails
  if (!isValid) return;

  try {
    // Attempt Login
    const userCredential = await signInWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    const user = userCredential.user;

    // 🔐 CRITICAL CHECK: Email Verification
    // If user has not verified email, we stop them here.
    if (!user.emailVerified) {
      msg.innerText = "⚠️ Please verify your email before logging in. Check your inbox.";
      msg.style.color = "red";
      
      // Force them to log out so they aren't authenticated in the background
      await signOut(auth);
      return; 
    }

    // 🔥 Fetch user profile from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    // Safety check if user document is missing
    if (!userDoc.exists()) {
      // (Optional: You could create a doc here if missing, but showing error is safer)
      msg.innerText = "User profile not found. Please contact support."; 
      msg.style.color = "red";
      return;
    }
    
    const userData = userDoc.data();

    // Login success - Store data locally for UI
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    
    // Store user name if it exists, otherwise fallback
    localStorage.setItem("userName", userData.username || "Traveler");
    localStorage.setItem("userEmail", user.email);

    msg.innerText = "Login successful! Redirecting...";
    msg.style.color = "green";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);

  } catch (error) {
    console.error("Login Error:", error); 
    msg.style.color = "red";

    // Handle specific Firebase errors
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        // Firebase now groups "User not found" and "Wrong password" for security
      msg.innerText = "Invalid email or password.";
      e.target.email.classList.add("error-border");
      e.target.password.classList.add("error-border");

    } else if (error.code === "auth/wrong-password") {
      document.getElementById("passwordError").innerText = "Incorrect password.";
      e.target.password.classList.add("error-border");

    } else if (error.code === "auth/too-many-requests") {
      msg.innerText = "Too many failed attempts. Please try again later.";
    } else {
      msg.innerText = "Error: " + error.message;
    }
  }
});

// ===============================
// TOAST NOTIFICATION SYSTEM
// ===============================
function showToast(message, type = "info", duration = 3500) {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-content">${message}</div>`;

  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ===============================
// FORGOT PASSWORD LOGIC
// ===============================
const forgotBtn = document.getElementById("forgotPasswordBtn");

if (forgotBtn) {
  forgotBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // 1. Grab the email from your existing input field (id="email")
    const emailField = document.getElementById("email");
    const emailValue = emailField.value.trim();

    // 2. Validation: Make sure they typed an email first
    if (!emailValue) {
      showToast("📧 Please enter your email address first", "warning");
      emailField.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      showToast("❌ Please enter a valid email address", "error");
      return;
    }

    try {
      // 3. Trigger the Firebase reset email
      await sendPasswordResetEmail(auth, emailValue);
      showToast("✅ Password reset link sent! Check your inbox.", "success", 4000);
      emailField.value = ""; // Clear the email field after success
    } catch (error) {
      console.error("Reset Error:", error.code);
      
      // 4. Friendly error messages
      if (error.code === 'auth/user-not-found') {
        showToast("❌ No account found with that email", "error");
      } else if (error.code === 'auth/invalid-email') {
        showToast("❌ Email address is not valid", "error");
      } else if (error.code === 'auth/too-many-requests') {
        showToast("⏳ Too many attempts. Please try again later.", "warning");
      } else {
        showToast("❌ Error sending reset email. Try again.", "error");
      }
    }
  });
}

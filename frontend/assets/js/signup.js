// 🔥 Firebase imports (Using stable version 10.8.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut // We need this to force them to login again after signup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
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
// 🔥 Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// SIGNUP FORM
// ===============================
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Reset errors
  document.querySelectorAll(".error").forEach(el => el.innerText = "");
  document.getElementById("formMessage").innerText = ""; 
  document.querySelectorAll("input").forEach(input =>
    input.classList.remove("error-border", "valid-border")
  );

  const formData = {
    username: e.target.username.value.trim(),
    email: e.target.email.value.trim(),
    phone: e.target.phone.value.trim(),
    password: e.target.password.value,
    confirmPassword: e.target.confirmPassword.value
  };

  let isValid = true;

  // ---------- VALIDATIONS ----------
  const usernameError = document.getElementById("usernameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");

  if (!formData.username) {
    usernameError.innerText = "Please enter user name";
    e.target.username.classList.add("error-border");
    isValid = false;
  } else e.target.username.classList.add("valid-border");

  if (!formData.email) {
    emailError.innerText = "Please enter email";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    emailError.innerText = "Please enter a valid email";
    isValid = false;
  } else e.target.email.classList.add("valid-border");

  if (!/^[0-9]{10}$/.test(formData.phone)) {
    phoneError.innerText = "Enter valid 10-digit number";
    isValid = false;
  } else e.target.phone.classList.add("valid-border");

  if (formData.password.length < 8) {
    passwordError.innerText = "Password must be at least 8 characters";
    isValid = false;
  } else e.target.password.classList.add("valid-border");

  if (formData.password !== formData.confirmPassword) {
    confirmPasswordError.innerText = "Passwords do not match";
    isValid = false;
  } else e.target.confirmPassword.classList.add("valid-border");

  if (!isValid) return;

  // ---------- FIREBASE SIGNUP ----------
  const submitBtn = e.target.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.innerText = "Creating Account...";

  try {
    // 1. Create User
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    const user = userCredential.user;

    // 2. Update Auth Profile (Adds name to the Auth Object directly)
    await updateProfile(user, {
        displayName: formData.username
    });

    // 3. Save to Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: formData.username,
      email: user.email,
      phone: formData.phone,
      createdAt: serverTimestamp()
    });

    // 4. Send Verification Email
    console.log("Sending verification email...");
    await sendEmailVerification(user);
    console.log("Email sent!");

    // 5. Sign Out immediately (So they can't browse without verifying)
    await signOut(auth);

    // 6. Success Message
    document.getElementById("formMessage").style.color = "green";
    document.getElementById("formMessage").innerText =
      "✅ Account created! We have sent a verification link to " + formData.email + ". Please check your inbox.";

    // 7. Redirect after 3 seconds (giving time to read message)
    setTimeout(() => {
      window.location.href = "login.html";
    }, 4000);

  } catch (error) {
    console.error(error);
    document.getElementById("formMessage").style.color = "red";
    
    if (error.code === 'auth/email-already-in-use') {
        document.getElementById("formMessage").innerText = "This email is already registered.";
    } else {
        document.getElementById("formMessage").innerText = "Error: " + error.message;
    }
    submitBtn.disabled = false;
    submitBtn.innerText = "Sign Up";
  }
});

// ===============================
// PASSWORD TOGGLES
// ===============================
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
if(togglePassword) {
    togglePassword.addEventListener("click", () => {
    password.type = password.type === "password" ? "text" : "password";
    togglePassword.classList.toggle("fa-eye");
    togglePassword.classList.toggle("fa-eye-slash");
    });
}

const confirmPassword = document.getElementById("confirmPassword");
const toggleConfirm = document.getElementById("toggleConfirm");
if(toggleConfirm) {
    toggleConfirm.addEventListener("click", () => {
    confirmPassword.type =
        confirmPassword.type === "password" ? "text" : "password";
    toggleConfirm.classList.toggle("fa-eye");
    toggleConfirm.classList.toggle("fa-eye-slash");
    });
}
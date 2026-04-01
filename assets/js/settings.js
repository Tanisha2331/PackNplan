// --- 1. DARK MODE TOGGLE ---
const themeToggle = document.getElementById('appearance-toggle');

if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');

    // Apply saved theme on page load
    if (savedTheme === 'dark') {
        themeToggle.checked = true;
        document.documentElement.classList.add('dark-mode'); // <--- STEP 2 LINE HERE (for load)
    }

    // Listen for when the user flips the switch
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            // --- STEP 2 LINE HERE (for clicking ON) ---
            document.documentElement.classList.add('dark-mode'); 
            localStorage.setItem('theme', 'dark');
            console.log("Dark Mode: ON");
        } else {
            // Remove it when turning OFF
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            console.log("Dark Mode: OFF");
        }
    });
}

// --- 2. LANGUAGE LOGIC ---
// --- Two-Language Selection Logic ---
const langOpt = document.getElementById('language-opt');
const langDrawer = document.getElementById('lang-drawer');
const langBtns = document.querySelectorAll('.lang-btn');
const currentLangText = document.getElementById('current-lang');

// 1. Open/Close Language Menu
langOpt.addEventListener('click', (e) => {
    if (!e.target.closest('.lang-simple-list')) {
        langDrawer.classList.toggle('active');
    }
});

// 2. Language Switcher (Google Auto-Translate Logic)
langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedLang = btn.getAttribute('data-lang');

        // Finds the hidden Google Translate dropdown (created by the script in your HTML)
        const googleCombo = document.querySelector('.goog-te-combo');
        
        if (googleCombo) {
            if (selectedLang === 'हिन्दी') {
                googleCombo.value = 'hi'; 
            } else {
                googleCombo.value = 'en'; 
            }
            googleCombo.dispatchEvent(new Event('change'));
        }

        // Close drawer and update the label
        langDrawer.classList.remove('active');
        currentLangText.innerText = selectedLang;

        // Visual selection state
        langBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});
// --- 3. ACCOUNT REDIRECT(Redirected to profile page) ---
const accountOption = document.getElementById('account-opt');

if (accountOption) {
    accountOption.addEventListener('click', function() {
        // Change 'profile.html' to the actual name of your profile file
        window.location.href = 'profile.html'; 
    });
}
// --- 4. PRIVACY & SECURITY (Two-factor Authentication) --- 03/03/26
/* */

const privacyOption = document.getElementById('privacy-opt');
const modal = document.getElementById('twoFactorModal');
const closeBtn = document.querySelector('.close-btn');
const toggleBtn = document.getElementById('toggle-2fa-btn');
const statusText = document.getElementById('2fa-status');

// --- MODAL CONTROL ---
if (privacyOption && modal) {
    privacyOption.addEventListener('click', () => {
        modal.style.display = "block";
    });
}

if (closeBtn && modal) {
    closeBtn.onclick = () => modal.style.display = "none";
}

window.onclick = (event) => { 
    if (modal && event.target == modal) modal.style.display = "none"; 
};

// --- EMAIL LOGIC ---
let generatedOTP = "";
const sendBtn = document.getElementById('send-email-btn');
const emailInput = document.getElementById('user-email');
const verifyBtn = document.getElementById('verify-btn');
const otpInput = document.getElementById('otp-input');

if (sendBtn) {
    sendBtn.addEventListener('click', function() {
        const email = emailInput.value;
        if (!email.includes('@')) {
            alert("Please enter a valid email address.");
            return;
        }

        // Generate 6-digit code
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

        const templateParams = {
            to_email: email, 
            otp_code: generatedOTP 
        };

        sendBtn.innerText = "Sending...";
        
        emailjs.send('service_izd0hqb', 'template_f8thi5r', templateParams)
            .then(function() {
                alert("✅ Code sent to " + email);
                sendBtn.style.display = "none";
                emailInput.style.display = "none";
                otpInput.style.display = "inline-block";
                verifyBtn.style.display = "inline-block";
            }, function(error) {
                alert("❌ Failed to send. Please check your internet or EmailJS keys.");
                console.log("Error:", error);
                sendBtn.innerText = "Send Code";
            });
    });
}

// --- VERIFICATION LOGIC ---
if (verifyBtn) {
    verifyBtn.addEventListener('click', function() {
        if (otpInput.value === generatedOTP) {
            localStorage.setItem('2fa_enabled', 'true');
            alert("✅ 2FA Enabled Successfully!");
            location.reload();
        } else {
            alert("❌ Incorrect code. Please check your email again.");
        }
    });
}

// --- LANGUAGE SAFETY FIX ---
window.changeLanguageManual = function(lang) {
    // This function now checks if an element exists before trying to change it
    const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    if (lang === 'hi') {
        updateText('account-title', 'खाता');
        updateText('privacy-title', 'गोपनीयता और सुरक्षा');
    } else {
        updateText('account-title', 'Account');
        updateText('privacy-title', 'Privacy & Security');
    }
};
// Help & support 03/03/26
const solutionData = {
    'otp-issue': [
        "Check your Spam or Junk folder.",
        "Verify that your email address is spelled correctly.",
        "Wait 2-5 minutes before requesting a new code.",
        "Ensure your internet connection is stable."
    ],
    'account-issue': [
        "Click the 'Account' option at the top of this page.",
        "Ensure you are logged in to edit your profile.",
        "Profile names must be between 3-20 characters.",
        "If locked out, contact support@traveler.com."
    ],
    'theme-issue': [
        "Toggle the 'Dark Mode' switch in the settings list.",
        "Clear your browser cache if the theme doesn't update.",
        "Check if your device has a system-wide 'Auto-Dark' setting.",
        "Ensure JavaScript is enabled in your browser."
    ],
    'other-issue': [
        "Email: packnplan.help@gmail.com",
        "Call: 1-888-722-5756",
        "Read Documentation",
        "Visit Forums"
    ]
};

const faqBtns = document.querySelectorAll('.faq-opt-btn');
const solutionBox = document.getElementById('solution-box');
const solutionText = document.getElementById('solution-text');
const optionsGrid = document.querySelector('.faq-options');
const backBtn = document.getElementById('back-to-faq');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackThanks = document.getElementById('feedback-thanks');
const feedbackBtns = document.querySelectorAll('.feedback-btn');

// Handle Option Clicks
const helpSupportOpt = document.getElementById('help-support-opt');
const faqDrawer = document.getElementById('faq-drawer');

if (helpSupportOpt && faqDrawer) {
    helpSupportOpt.addEventListener('click', function(e) {
        // This ensures that clicking the buttons INSIDE doesn't close the whole drawer
        if (e.target.classList.contains('faq-opt-btn') || e.target.id === 'back-to-faq') {
            return; 
        }
        
        // Toggle the active class
        faqDrawer.classList.toggle('active');
        console.log("Drawer toggled!"); // This helps you see if it's working in F12 Console
    });
}
faqBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = btn.getAttribute('data-target');
        const points = solutionData[target];

        // Create the simple list
        solutionText.innerHTML = `<ul style="text-align:left; list-style:none; padding:0;">` + 
            points.map(p => `<li style="margin-bottom:8px; font-size:13px; color:#444;">• ${p}</li>`).join('') + 
            `</ul>`;

        // Switch visibility
        optionsGrid.style.display = 'none';
        solutionBox.style.display = 'block';
    });
});
// Handle Feedback Click
feedbackBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if(feedbackContainer) feedbackContainer.style.display = 'none'; // Hide the question
        if(feedbackThanks) feedbackThanks.style.display = 'block'; // Show the thank you
    });
});
// Handle Back Button
if (backBtn) {
    backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // 1. Switch views back to the main grid
        solutionBox.style.display = 'none';
        optionsGrid.style.display = 'grid';
        
        // 2. RESET the feedback section (The part that was missing)
        if (feedbackContainer && feedbackThanks) {
            feedbackContainer.style.display = 'block'; // Show the Thumb buttons again
            feedbackThanks.style.display = 'none';      // Hide the "Thanks" message
        }
        
        console.log("Feedback reset and returned to options.");
    });
}

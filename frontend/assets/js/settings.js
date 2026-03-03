// ==========================================
// 1. DARK MODE LOGIC
// ==========================================
const themeToggle = document.getElementById('appearance-toggle');

// This part runs as soon as the page opens
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    themeToggle.checked = true;
    document.documentElement.classList.add('dark-mode');
}

// This part runs when you click the switch
themeToggle.addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark'); // "Remember" dark mode
    } else {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light'); // "Remember" light mode
    }
});

// ==========================================
// 2. ACCOUNT PAGE REDIRECT
// ==========================================
const accountBtn = document.getElementById('account-opt');
if (accountBtn) {
    accountBtn.onclick = () => {
        window.location.href = 'profile.html'; // Sends user to profile page
    };
}

// ==========================================
// 3. 2FA MODAL (POPUP) CONTROL
// ==========================================
const privacyBtn = document.getElementById('privacy-opt');
const modal = document.getElementById('twoFactorModal');
const closeBtn = document.querySelector('.close-btn');

// Open the popup when "Privacy" is clicked
privacyBtn.onclick = () => { modal.style.display = "block"; };

// Close the popup when "X" is clicked
closeBtn.onclick = () => { modal.style.display = "none"; };

// Close the popup if the user clicks outside the white box
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
};

// ==========================================
// 4. EMAIL OTP (SECURITY CODE) LOGIC
// ==========================================
let generatedOTP = ""; // This stores the secret code temporarily
const sendBtn = document.getElementById('send-email-btn');
const emailInput = document.getElementById('user-email');
const otpInput = document.getElementById('otp-input');
const verifyBtn = document.getElementById('verify-btn');

sendBtn.addEventListener('click', function() {
    const email = emailInput.value;
    
    // Check if email looks real
    if (!email.includes('@')) {
        alert("Please enter a valid email!");
        return;
    }

    // Create a random 6-digit number
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Send the email using EmailJS
    sendBtn.innerText = "Sending...";
    
    emailjs.send('service_uimob8s', 'YOUR_TEMPLATE_ID', {
        to_email: email,
        otp_code: generatedOTP
    }).then(() => {
        alert("Check your email! Code sent.");
        // Hide the email parts, show the code parts
        sendBtn.style.display = "none";
        emailInput.style.display = "none";
        otpInput.style.display = "block";
        verifyBtn.style.display = "block";
    }).catch((err) => {
        alert("Email failed to send. Check your Keys!");
        sendBtn.innerText = "Try Again";
    });
});

// Check if the user typed the right code
verifyBtn.onclick = () => {
    if (otpInput.value === generatedOTP) {
        localStorage.setItem('2fa_enabled', 'true');
        alert("Security Enabled! Your account is now safe.");
        location.reload(); // Refresh to show changes
    } else {
        alert("Wrong code! Try again.");
    }
};
// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const hotelName = urlParams.get('hotelName');
const address = urlParams.get('address');
const pricePerNight = parseInt(urlParams.get('price'));
const city = urlParams.get('city');
const checkIn = urlParams.get('checkIn');
const checkOut = urlParams.get('checkOut');
const guests = urlParams.get('guests');

// Populate hotel details
document.getElementById('hotelName').textContent = hotelName;
document.getElementById('hotelAddress').textContent = address;
document.getElementById('pricePerNight').textContent = pricePerNight;

// Form elements
const form = document.getElementById('bookingForm');
const travelersInput = document.getElementById('travelers');
const nightsInput = document.getElementById('nights');
const totalAmountEl = document.getElementById('totalAmount');
const summaryTravelers = document.getElementById('summaryTravelers');
const summaryNights = document.getElementById('summaryNights');
const summaryHotel = document.getElementById('summaryHotel');

// Calculate total
function calculateTotal() {
    const travelers = parseInt(travelersInput.value) || 1;
    const nights = parseInt(nightsInput.value) || 1;
    const total = pricePerNight * nights * travelers;

    totalAmountEl.textContent = `₹${total}`;
    summaryTravelers.textContent = travelers;
    summaryNights.textContent = nights;
    summaryHotel.textContent = hotelName;
    return { total };
}

// Update on input change
travelersInput.addEventListener('input', calculateTotal);
nightsInput.addEventListener('input', calculateTotal);

// Initial calculation
calculateTotal();

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const guestName = document.getElementById('guestName').value;
    const email = document.getElementById('guestEmail').value;
    const phone = document.getElementById('guestPhone').value;

    if (!guestName || !email || !phone) {
        alert('Please fill all required fields');
        return;
    }

    if (phone.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }

    const travelers = parseInt(travelersInput.value);
    const nights = parseInt(nightsInput.value);
    const totals = calculateTotal();
    const totalAmount = totals.total;
    const paidAmount = 999; // legacy display no longer required, but stays for summary
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    try {
        // Generate booking ID
        const bookingId = 'BOOK-' + Date.now();
        
        // Store booking details in localStorage for payment page
        localStorage.setItem('bookingDetails', JSON.stringify({
            bookingId,
            hotelName,
            guestName,
            email,
            phone,
            totalAmount,
            paidAmount,
            remainingAmount,
            travelers,
            nights,
            checkIn,
            checkOut,
            address
        }));

        // Redirect to custom payment page
        window.location.href = 'payment.html';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Booking failed. Please try again.');
        submitBtn.textContent = 'Proceed to Payment';
        submitBtn.disabled = false;
    }
});
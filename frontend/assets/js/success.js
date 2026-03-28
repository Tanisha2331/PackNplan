// Get booking details from localStorage
const bookingDetailsStr = localStorage.getItem('bookingDetails');

if (bookingDetailsStr) {
    const bookingDetails = JSON.parse(bookingDetailsStr);

    // Display booking information
    document.getElementById('bookingId').textContent = bookingDetails.bookingId || 'N/A';
    document.getElementById('hotelName').textContent = bookingDetails.hotelName || 'N/A';
    document.getElementById('guestName').textContent = bookingDetails.guestName || 'N/A';
    document.getElementById('totalAmount').textContent = `₹${bookingDetails.totalAmount || 0}`;
} else {
    console.warn('No booking details found in localStorage');
}
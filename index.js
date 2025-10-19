// --- Define pages where the button should be HIDDEN ---
// !!! IMPORTANT: Update these paths to match your login and sign up pages
// (e.g., '/login.html', '/signup.php', '/auth/login', etc.)
const hiddenPages = ['/login.html', '/signup.html'];

// This code runs after the HTML page is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Get the current page's path (e.g., "/index.html" or "/login.html")
    const currentPage = window.location.pathname;

    // Check if the current page *ends with* one of the hidden paths
    const isHiddenPage = hiddenPages.some(page => currentPage.endsWith(page));

    // If it's NOT a hidden page, then show the button and make it work
    if (!isHiddenPage) {

        // Get all the modal elements
        const openBtn = document.getElementById('open-midas-btn');
        const closeBtn = document.getElementById('close-midas-btn');
        const modalOverlay = document.getElementById('midas-modal-overlay');

        // Check if all elements actually exist on the page
        if (openBtn && closeBtn && modalOverlay) {

            // --- THIS IS THE NEW PART ---
            // Make the button visible
            openBtn.style.display = 'flex';

            // Click listener for the FLOATING BUTTON to SHOW the modal
            openBtn.addEventListener('click', () => {
                modalOverlay.classList.remove('hidden');
            });

            // Click listener for the CLOSE BUTTON to HIDE the modal
            closeBtn.addEventListener('click', () => {
                modalOverlay.classList.add('hidden');
            });

            // Click listener for the DARK BACKGROUND to HIDE the modal
            modalOverlay.addEventListener('click', (event) => {
                // Only hide if the click is on the overlay itself, not the chat window
                if (event.target === modalOverlay) {
                    modalOverlay.classList.add('hidden');
                }
            });

        } else {
            console.warn('Midas chat button or modal elements not found.');
        }
    } else {
        // On a hidden page, do nothing. The button stays hidden.
        console.log('Midas button is hidden on this auth page.');
    }
});
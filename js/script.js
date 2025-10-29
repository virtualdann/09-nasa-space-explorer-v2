// Use this URL to fetch NASA APOD JSON data
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';
let galleryData = []; // Changed to let since we'll reassign it
const spaceFacts = [
    "A sunset on Mars appears blue. Due to the way Martian dust scatters sunlight, the sky near the setting sun on Mars looks blue to human observers.",
    "Space is completely silent. In a vacuum, there is no air or other medium for sound waves to travel through. While cosmic events like explosions and impacts happen, their sounds are never heard.",
    "Venus is the hottest planet in our solar system. Despite Mercury being closer to the Sun, Venus's thick, dense atmosphere traps heat in a runaway greenhouse effect, giving it a scorching surface temperature of around 450°C (842°F).",
    "One million Earths could fit inside the Sun. The Sun accounts for about 99.86% of the solar system's total mass. Its sheer size is so immense that roughly 1.3 million Earths could fit inside it.",
    "If two pieces of the same metal touch in space, they will permanently bond. This phenomenon, known as \"cold welding,\" occurs because the atoms of the metal pieces have no atmosphere to create a thin layer of oxidized material between them. In the vacuum of space, they fuse together.",
    "Our solar system takes about 230 million years to orbit the Milky Way. While Earth orbits the Sun in a year, our entire solar system is moving through the galaxy. The time it takes for one full galactic orbit is known as a galactic year.",
    "You could fit all the other planets in our solar system between Earth and the Moon. The average distance between the Earth and the Moon is so great that you could line up Mercury, Venus, Mars, Jupiter, Saturn, Uranus, and Neptune side by side in that gap."
]

// Get DOM elements
const galleryContainer = document.getElementById('gallery');
const getImageBtn = document.getElementById('getImageBtn');
const funFactContainer = document.getElementById('fun-fact');
// Modal elements (added to index.html)
const modal = document.getElementById('modal');
const closeButton = document.querySelector('.close-button');
const modalMediaContainer = document.getElementById('modal-media-container');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalExplanation = document.getElementById('modal-explanation');

// Function to create HTML for gallery items
function createGalleryItem(item) {
    // Create gallery item container
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';

    // Handle different media types (image or video)
    const mediaContent = item.media_type === 'video' 
        ? `<img src="${item.thumbnail_url}" alt="${item.title}">`
        : `<img src="${item.url}" alt="${item.title}">`;

    const title = item.media_type === 'video'
        ? `<p>[VIDEO] ${item.title}</p>`
        :  `<p>${item.title}</p>`;

    // Add content to gallery item
    galleryItem.innerHTML = `
        ${mediaContent}
        ${title}
        <p>${item.date}</p>
    `;

    return galleryItem;
}

// Function to render the gallery
function renderGallery(data) {
    // Clear any existing content
    galleryContainer.innerHTML = '';
    
    // Create and append gallery items
    data.forEach(item => {
        const galleryItem = createGalleryItem(item);
        // When a user clicks the gallery item, open the modal with larger content
        galleryItem.addEventListener('click', () => showModal(item));
        galleryContainer.appendChild(galleryItem);
    });
}

// Render a random fun fact inside the info box
function renderFunFact() {
    if (!funFactContainer) return;
    const idx = Math.floor(Math.random() * spaceFacts.length);
    const fact = spaceFacts[idx];
    // Use the same structure as the HTML placeholder so styles apply
    funFactContainer.innerHTML = `
        <div class="info-accent"></div>
        <div class="info-content">
            <h3>Did You Know?</h3>
            <p>${escapeHtml(fact)}</p>
        </div>
    `;
}

// Show modal with larger media and details
function showModal(item) {
    if (!modal) return; // safety

    // Decide what to render for media
    if (item.media_type === 'video') {
        // Some entries provide an embed URL (iframe-ready). Use that so video is playable.
        modalMediaContainer.innerHTML = `\
            <iframe src="${item.url}" 
                    title="${escapeHtml(item.title)}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
            </iframe>`;
    } else {
        // Prefer hdurl when available for larger images
        const imgSrc = item.hdurl || item.url;
        modalMediaContainer.innerHTML = `<img src="${imgSrc}" alt="${escapeHtml(item.title)}">`;
    }

    modalTitle.textContent = item.title || '';
    modalDate.textContent = item.date || '';
    modalExplanation.textContent = item.explanation || '';

    // Show modal and prevent background scroll
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal and cleanup
function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    modalMediaContainer.innerHTML = '';
}

// Small helper to avoid injection of characters into attributes/text
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>\"']/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c];
    });
}

// Modal event listeners
if (closeButton) closeButton.addEventListener('click', closeModal);
if (modal) {
    modal.addEventListener('click', (e) => {
        // Close when clicking outside the modal-content
        if (e.target === modal) closeModal();
    });
}

// Close with Escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'block') closeModal();
});

// Render an initial fun fact on page load
renderFunFact();

// Event listener for the fetch button
const placeholderContainer = document.getElementsByClassName('placeholder')[0];
getImageBtn.addEventListener('click', () => {
    placeholderContainer.innerHTML = 'loading images...';

    fetch(apodData)
        .then(response => {
            // Handle the response object
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Store and render the fetched data
            galleryData = data;
            renderGallery(galleryData);
            // Show a new random fun fact when images are loaded
            renderFunFact();
        })
        .catch(error => {
            // Handle any errors during the fetch operation
            console.error('Fetch error:', error);
            galleryContainer.innerHTML = `
                <div class="placeholder">
                    <div class="placeholder-icon">❌</div>
                    <p>Error loading images. Please try again.</p>
                </div>
            `;
        });
});


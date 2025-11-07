// Menu page enhancements - integrate with backend API
(function() {
  'use strict';

  // Optional: Load menu items from backend API
  async function loadMenuFromAPI() {
    try {
      const response = await fetch('/menu');
      if (!response.ok) throw new Error('Failed to fetch menu');
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        // If backend has items, you could render them here
        // For now, we'll keep the static items but log the API data
        console.log('Menu items from API:', data.items);
      }
    } catch (error) {
      console.warn('Could not load menu from API (using static menu):', error.message);
      // Fallback to static menu items if API fails
    }
  }

  // Enhance delivery time estimation to use backend API
  function enhanceDeliveryEstimation() {
    const getEstimateBtn = document.getElementById('getEstimateBtn');
    const locationInput = document.getElementById('locationInput');
    const estimateText = document.getElementById('estimateText');
    
    if (!getEstimateBtn || !locationInput || !estimateText) return;

    // Override the default behavior if it exists
    getEstimateBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const location = locationInput.value.trim();
      if (!location) {
        alert('Please enter a city or pincode.');
        return;
      }

      try {
        // Use backend API for delivery time
        const response = await fetch(`/delivery-time?location=${encodeURIComponent(location)}`);
        if (!response.ok) throw new Error('Failed to get delivery estimate');
        
        const data = await response.json();
        const etaText = data.etaText || `${data.etaMinutes}-${data.etaMinutes + 15} mins`;
        
        estimateText.textContent = `Your food will arrive in approximately ${etaText}.`;
        estimateText.classList.remove('hidden');
        
        // Show proceed button
        const proceedPayBtn = document.getElementById('proceedPayBtn');
        if (proceedPayBtn) proceedPayBtn.classList.remove('hidden');
        
        // Save location for later use
        if (typeof save === 'function') {
          save('fx_location', { label: location, eta: data.etaMinutes });
        }
      } catch (error) {
        console.error('Error fetching delivery time:', error);
        // Fallback to simple estimate
        const minutes = 25 + Math.floor(Math.random() * 16);
        estimateText.textContent = `Your food will arrive in approximately ${minutes} mins.`;
        estimateText.classList.remove('hidden');
        const proceedPayBtn = document.getElementById('proceedPayBtn');
        if (proceedPayBtn) proceedPayBtn.classList.remove('hidden');
      }
    }, true);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loadMenuFromAPI();
      enhanceDeliveryEstimation();
    });
  } else {
    loadMenuFromAPI();
    enhanceDeliveryEstimation();
  }
})();


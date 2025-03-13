document.addEventListener('DOMContentLoaded', function() {
    // No need for EmailJS initialization anymore
    
    const orderForm = document.getElementById('orderForm');
    const addServiceBtn = document.getElementById('add-service');
    const servicesContainer = document.getElementById('services-container');
    const confirmationDiv = document.getElementById('confirmation');
    const loadingDiv = document.getElementById('loading');
    const newOrderBtn = document.getElementById('new-order');
    
    // Add a new service row
    addServiceBtn.addEventListener('click', function() {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        
        serviceItem.innerHTML = `
            <select name="service[]" required>
                <option value="">Select a service</option>
                <option value="Form board - 8ft x 4ft">Form board - 8ft x 4ft</option>
                <option value="Rectangular Mould">Rectangular Mould</option>
                <option value="Circular Mould">Circular Mould</option>
            </select>
            <input type="number" name="quantity[]" min="1" value="1" required>
            <button type="button" class="remove-btn">Remove</button>
        `;
        
        servicesContainer.appendChild(serviceItem);
        
        // Show remove button for the first service if there are now multiple services
        if (servicesContainer.children.length === 2) {
            servicesContainer.querySelector('.remove-btn').style.display = 'block';
        }
        
        // Add event listener to the new remove button
        serviceItem.querySelector('.remove-btn').addEventListener('click', function() {
            serviceItem.remove();
            
            // Hide the remove button for the first service if it's the only one left
            if (servicesContainer.children.length === 1) {
                servicesContainer.querySelector('.remove-btn').style.display = 'none';
            }
        });
    });
    
    // Handle form submission
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading spinner
        orderForm.style.display = 'none';
        loadingDiv.classList.remove('hidden');
        
        // Collect form data
        const formData = new FormData(orderForm);
        const name = formData.get('name');
        const phone = formData.get('phone');
        const landmark = formData.get('landmark');
        const time = formData.get('time');
        const notes = formData.get('notes');
        
        // Collect services and quantities
        const services = formData.getAll('service[]');
        const quantities = formData.getAll('quantity[]');
        
        let servicesText = '';
        for (let i = 0; i < services.length; i++) {
            servicesText += `${services[i]} (Quantity: ${quantities[i]})\n`;
        }
        
        // Format date and time for display
        const formattedDateTime = new Date(time).toLocaleString();
        
        // Add formatted services to form data for submission
        formData.append('formatted_services', servicesText);
        formData.append('formatted_time', formattedDateTime);
        
        // Send form data to Formspree
        fetch('https://formspree.io/f/xwplkdeb', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log('Form submitted successfully!');
            
            // Hide loading and show confirmation
            loadingDiv.classList.add('hidden');
            confirmationDiv.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Form submission failed:', error);
            
            // Show error message
            loadingDiv.classList.add('hidden');
            alert('There was an error sending your order. Please try again or contact us directly.');
            orderForm.style.display = 'block';
        });
    });
    
    // Handle "Place Another Order" button
    newOrderBtn.addEventListener('click', function() {
        // Reset the form
        orderForm.reset();
        
        // Remove all service items except the first one
        while (servicesContainer.children.length > 1) {
            servicesContainer.removeChild(servicesContainer.lastChild);
        }
        
        // Hide the remove button for the first service
        servicesContainer.querySelector('.remove-btn').style.display = 'none';
        
        // Show the form and hide confirmation
        confirmationDiv.classList.add('hidden');
        orderForm.style.display = 'block';
    });
});
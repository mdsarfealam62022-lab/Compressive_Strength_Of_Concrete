
document.getElementById('predictionForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const formData = new FormData(form);
    const data = {};

    // Collect data from form inputs
    formData.forEach((value, key) => {
        data[key] = parseFloat(value); // Convert to float as expected by the backend
    });

    // Send data to Flask backend
    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        const predictionResultElement = document.getElementById('predictionResult');
        if (result.prediction !== undefined) {
            predictionResultElement.textContent = `Predicted Compressive Strength: ${result.prediction.toFixed(2)} MPa`;
            predictionResultElement.style.color = '#28a745'; // Green for success
            predictionResultElement.style.backgroundColor = '#e2ffe2';
            predictionResultElement.style.borderColor = '#28a745';
        } else if (result.error) {
            predictionResultElement.textContent = `Error: ${result.error}`;
            predictionResultElement.style.color = '#dc3545'; // Red for error
            predictionResultElement.style.backgroundColor = '#ffe2e2';
            predictionResultElement.style.borderColor = '#dc3545';
        }
    })
    .catch(error => {
        const predictionResultElement = document.getElementById('predictionResult');
        predictionResultElement.textContent = `Error sending request: ${error}`;
        predictionResultElement.style.color = '#dc3545'; // Red for error
        predictionResultElement.style.backgroundColor = '#ffe2e2';
        predictionResultElement.style.borderColor = '#dc3545';
        console.error('Error:', error);
    });
});

document.getElementById('clearButton').addEventListener('click', function() {
    const form = document.getElementById('predictionForm');
    const inputs = form.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.value = '0'; // Set all number inputs to zero
    });
    const predictionResultElement = document.getElementById('predictionResult');
    predictionResultElement.textContent = ''; // Clear the prediction result
    predictionResultElement.style.backgroundColor = 'transparent';
    predictionResultElement.style.borderColor = 'transparent';
});


// document.getElementById('predictionForm').addEventListener('submit', function(event) {
//     event.preventDefault(); // Prevent default form submission

//     const form = event.target;
//     const formData = new FormData(form);
//     const data = {};

//     // Collect data from form inputs
//     formData.forEach((value, key) => {
//         data[key] = parseFloat(value); // Convert to float as expected by the backend
//     });

//     // Send data to Flask backend
//     fetch('/predict', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//     })
//     .then(response => response.json())
//     .then(result => {
//         const predictionResultElement = document.getElementById('predictionResult');
//         if (result.prediction !== undefined) {
//             predictionResultElement.textContent = `Predicted Compressive Strength: ${result.prediction.toFixed(2)} MPa`;
//             predictionResultElement.style.color = '#28a745'; // Green for success
//             predictionResultElement.style.backgroundColor = '#e2ffe2';
//             predictionResultElement.style.borderColor = '#28a745';
//         } else if (result.error) {
//             predictionResultElement.textContent = `Error: ${result.error}`;
//             predictionResultElement.style.color = '#dc3545'; // Red for error
//             predictionResultElement.style.backgroundColor = '#ffe2e2';
//             predictionResultElement.style.borderColor = '#dc3545';
//         }
//     })
//     .catch(error => {
//         const predictionResultElement = document.getElementById('predictionResult');
//         predictionResultElement.textContent = `Error sending request: ${error}`;
//         predictionResultElement.style.color = '#dc3545'; // Red for error
//         predictionResultElement.style.backgroundColor = '#ffe2e2';
//         predictionResultElement.style.borderColor = '#dc3545';
//         console.error('Error:', error);
//     });
// });

// document.getElementById('clearButton').addEventListener('click', function() {
//     const form = document.getElementById('predictionForm');
//     const inputs = form.querySelectorAll('input[type="number"]');
//     inputs.forEach(input => {
//         input.value = '0'; // Set all number inputs to zero
//     });
//     const predictionResultElement = document.getElementById('predictionResult');
//     predictionResultElement.textContent = ''; // Clear the prediction result
//     predictionResultElement.style.backgroundColor = 'transparent';
//     predictionResultElement.style.borderColor = 'transparent';
// });



// A new lines for javascripts

const form = document.getElementById('predictionForm');
const wrapper = document.getElementById('borderWrapper');
const resultText = document.getElementById('predictionResult');

// 1. Detect Typing (Change to Blue Glow)
form.addEventListener('input', () => {
    wrapper.classList.remove('predicted');
    wrapper.classList.add('typing');
});

// 2. Handle Actual Prediction Logic
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Prepare the data from the form
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Switch UI to "Processing" mode
    wrapper.classList.remove('typing');
    resultText.innerHTML = "Processing Engineer Data...";

    try {
        // CALLING YOUR FLASK API
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
            // Success: Turn boundary GREEN and show REAL prediction
            wrapper.classList.add('predicted');
            resultText.innerHTML = `Predicted Strength: <span style="font-size: 1.5rem;">${result.prediction} ${result.unit}</span>`;
        } else {
            // Handle error from Flask (e.g., missing fields)
            resultText.innerHTML = `<span style="color: red;">Error: ${result.error}</span>`;
            wrapper.style.background = "red";
        }
    } catch (err) {
        console.error("Fetch error:", err);
        resultText.innerHTML = "Server Error. Is the Flask app running?";
    }
});

// 3. Clear Button Logic
document.getElementById('clearButton').addEventListener('click', () => {
    form.reset();
    resultText.innerHTML = "";
    wrapper.className = 'form-wrapper'; // Resets to Yellow
});



// VERY NEW ADDITION


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    wrapper.classList.remove('typing', 'low-strength', 'med-strength', 'high-strength');
    resultText.innerHTML = "Processing...";

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            const val = parseFloat(result.prediction);
            let category = "";
            let colorClass = "";

            // LOGIC FOR STRENGTH CATEGORIES
            if (val < 20) {
                category = "LOW STRENGTH";
                colorClass = "low-strength";
            } else if (val >= 20 && val <= 40) {
                category = "MEDIUM STRENGTH";
                colorClass = "med-strength";
            } else {
                category = "HIGH STRENGTH";
                colorClass = "high-strength";
            }

            // Update UI
            wrapper.className = `form-wrapper ${colorClass}`; // Update border color
            resultText.innerHTML = `
                <div class="result-box ${colorClass}">
                    <p class="status-label">${category}</p>
                    <h2 class="pred-val">${val} ${result.unit}</h2>
                </div>
            `;
        }
    } catch (err) {
        resultText.innerHTML = "Error connecting to model.";
    }
});


// A VERY NEW ADDITION

// for display of download button

document.getElementById('downloadBtn').addEventListener('click', function() {
    console.log("Download started...");
    
    // Check if we have data
    if (!window.latestReportData) {
        alert("No prediction data found. Please predict again.");
        return;
    }

    const { val, category, recommendation, inputs } = window.latestReportData;
    const element = document.getElementById('pdfTemplate');

    // 1. Fill the hidden template with data
    document.getElementById('pdfContent').innerHTML = `
        <div style="padding: 20px; border: 2px solid #333;">
            <h1 style="color: #ff0000; text-align: center; text-decoration: underline;">Concrete Strength Analysis Report</h1>
            <p><strong>Developed by:</strong> SARFE ALAM</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <hr>
            <h3>1. Input Parameters</h3>
            <ul>
                ${Object.entries(inputs).map(([k, v]) => `<li><b>${k}:</b> ${v} kg/m³</li>`).join('')}
            </ul>
            <hr>
            <h3>2. Prediction Result</h3>
            <h2 style="color: #2ecc71;">Strength: ${val.toFixed(2)} MPa</h2>
            <p><strong>Category:</strong> ${category}</p>
            <hr>
            <h3>3. Engineering Recommendations</h3>
            <p>${recommendation}</p>
            <p style="margin-top: 50px; font-size: 12px; text-align: center; border-top: 1px solid #ccc;">
                Bhagalpur College Of Engineering, Sabour
            </p>
        </div>
    `;

    // 2. Generate PDF
    const opt = {
        margin:       0.5,
        filename:     `Concrete_Report_SarfeAlam_${val}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Show template briefly for the generator, then hide it
    element.style.display = 'block';
    html2pdf().set(opt).from(element).save().then(() => {
        element.style.display = 'none';
        console.log("PDF Saved successfully.");
    });
});
//Logic for download button 

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const downloadBtn = document.getElementById('downloadBtn');
    const resultText = document.getElementById('predictionResult');
    
    // Reset UI before prediction
    wrapper.classList.remove('typing', 'low-strength', 'med-strength', 'high-strength');
    downloadBtn.style.display = "none";
    resultText.innerHTML = "Engineering analysis in progress...";

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });

        const result = await response.json();

        if (result.success) {
            // CRITICAL: Convert to float to avoid "crashing" on string comparisons
            const val = parseFloat(result.prediction);
            let category = "";
            let colorClass = "";
            let recommendation = "";

            // Precise Engineering Logic
            if (val < 20) {
                category = "LOW STRENGTH";
                colorClass = "low-strength";
                recommendation = "Uses: Lean concrete, compound walls, non-structural PCC.";
            } else if (val >= 20 && val <= 40) {
                category = "MEDIUM STRENGTH";
                colorClass = "med-strength";
                recommendation = "Uses: Standard RCC, residential slabs, beams, and columns.";
            } else {
                category = "HIGH STRENGTH";
                colorClass = "high-strength";
                recommendation = "Uses: Bridges, Flyovers, and High-Rise foundations.";
            }

            // Apply the visual state
            wrapper.className = `form-wrapper ${colorClass}`;
            resultText.innerHTML = `
                <div style="text-align: center;">
                    <p style="letter-spacing: 2px; font-weight: bold;">${category}</p>
                    <h2 style="font-size: 2.5rem; margin: 10px 0;">${val.toFixed(2)} MPa</h2>
                    <p style="font-size: 0.9rem; opacity: 0.8;">${recommendation}</p>
                </div>
            `;

            // Show download button safely
            downloadBtn.style.display = "inline-block";

            // Store for PDF
            window.latestReportData = { val, category, recommendation, inputs: Object.fromEntries(new FormData(form)) };
        }
    } catch (err) {
        resultText.innerHTML = "<span style='color:red;'>Connection Error. Is Flask running?</span>";
    }
});

// this logic will ensure that contents will within the pdf 

document.getElementById('downloadBtn').addEventListener('click', function() {
    if (!window.latestReportData) return;

    const { val, category, recommendation, inputs } = window.latestReportData;
    
    // 1. Map data to PDF fields
    document.getElementById('pdfDate').innerText = new Date().toLocaleDateString();
    document.getElementById('pdfStrengthResult').innerText = `${val.toFixed(2)} MPa`;
    document.getElementById('pdfCategory').innerText = category;
    document.getElementById('pdfUsageText').innerText = recommendation;

    // 2. Map inputs into a grid format for the PDF
    const inputGrid = document.getElementById('pdfInputGrid');
    inputGrid.innerHTML = Object.entries(inputs)
        .map(([key, value]) => `<div><b>${key.replace(/_/g, ' ')}:</b> ${value}</div>`)
        .join('');

    // 3. Configuration for high-quality printing
    const element = document.getElementById('pdfTemplate');
    const opt = {
        margin: [0.5, 0.5], // Top and Bottom margins
        filename: `Concrete_Analysis_Report_${val.toFixed(0)}MPa.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2, 
            logging: false, 
            useCORS: true,
            scrollY: 0 
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // 4. Execution
    element.style.display = 'block'; // Make visible for capture
    html2pdf().set(opt).from(element).save().then(() => {
        element.style.display = 'none'; // Hide after capture
    });
});


//This logic will ensure pdf button and prediction disappear after clicking clear button

document.getElementById('clearButton').addEventListener('click', () => {
    // Standard form reset
    form.reset();
    
    // Reset the Wrapper to Yellow
    wrapper.className = 'form-wrapper';
    
    // Hide result text and Download Button
    resultText.innerHTML = "";
    document.getElementById('downloadBtn').style.display = 'none';
    
    // Wipe stored data to prevent accidental downloads of old data
    window.latestReportData = null;
});
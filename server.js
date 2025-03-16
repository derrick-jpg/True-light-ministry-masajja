
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet()); 
app.use(cors()); 
app.use(bodyParser.json());

// Limit the number of requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Endpoint to handle donation
app.post('/api/donate', async (req, res) => {
    const { name, phone, amount, paymentMethod, pin, donationNumber } = req.body;

    // Validate input
    if (!name || !phone || !amount || !paymentMethod || !pin) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        let paymentResponse;

        if (paymentMethod === 'MTN') {
            paymentResponse = await axios.post('https://mtn-api-endpoint.com/pay', {
                phone,
                amount,
                pin,
                // Include any other required fields specific to MTN API
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.MTN_API_KEY}`, // Use your actual API key
                    'Content-Type': 'application/json'
                }
            });
        } else if (paymentMethod === 'Airtel') {
            paymentResponse = await axios.post('https://airtel-api-endpoint.com/pay', {
                phone,
                amount,
                pin,
                // Include any other required fields specific to Airtel API
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.AIRTEL_API_KEY}`, // Use your actual API key
                    'Content-Type': 'application/json'
                }
            });
        }

        if (paymentResponse && paymentResponse.status === 200) {
            console.log(`Donation of $${amount} received from ${name} via ${paymentMethod}.`);
            return res.json({ success: true, message: 'Donation processed successfully.' });
        }

        return res.status(500).json({ success: false, message: 'Payment processing failed.' });
    } catch (error) {
        console.error('Payment error:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while processing the payment.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



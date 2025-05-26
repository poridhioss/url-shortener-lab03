const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/urls';

async function testUrlShortening() {
    try {
        // 1. Create a short URL
        const longUrl = 'https://www.google.com';
        const postResponse = await axios.post(BASE_URL, { longUrl });

        console.log('✅ POST /api/urls response:');
        console.log(postResponse.data);

        const shortUrl = postResponse.data.shortUrl || postResponse.data.id || postResponse.data.code;
        if (!shortUrl) {
            console.error('❌ shortUrl not found in response');
            return;
        }

        // 2. Test redirection
        try {
            console.log('ShortUrl: ', shortUrl)
            const getResponse = await axios.get(`${shortUrl}`, {
                maxRedirects: 0,
                validateStatus: status => status >= 200 && status < 400
            });

            if (getResponse.status === 302 || getResponse.status === 301) {
                console.log(`✅ GET /api/urls/${shortUrl} redirected to: ${getResponse.headers.location}`);
            } else {
                console.log(`⚠️ GET response status: ${getResponse.status}`);
            }
        } catch (err) {
            console.error('❌ Error during GET request:', err.message);
        }

    } catch (error) {
        console.error('❌ Error during POST request:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testUrlShortening();

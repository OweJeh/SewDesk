const fs = require('fs');

// We have media_1794606564872_d58c4099.png in artifacts directory or user_uploaded
// Let's check where it is:
// C:/Users/Dev OJ/.gemini/antigravity/brain/30b956d3-7479-4ebc-8bfc-6a958fe1b359/.user_uploaded/media_1794606564872_d58c4099.png

const path = 'C:/Users/Dev OJ/.gemini/antigravity/brain/30b956d3-7479-4ebc-8bfc-6a958fe1b359/.user_uploaded/media_1794606564872_d58c4099.png';
console.log('Exists:', fs.existsSync(path));


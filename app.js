require('dotenv').config({ path: 'config.env' });
require('colors');
const express = require('express');
const app = express();
const { Yemot_router } = require('yemot-router');
const path = require('path');
const y = Yemot_router();
const checkAutRequest = require('./src/checkAuthReq');

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
    console.log('Please set your GMAIL_USER and GMAIL_PASSWORD in config.env file'.red);
    process.exit(1);
}

if (!process.env.IVR_TOKEN) {
    console.log('Warning! If you do not set up authentication, anyone will be able to send emails on your behalf!'.red);
}

const sendMailDialog = require('./src/dialogs/send-mail');
y.add_fn('/send', sendMailDialog);

app.use('/api', checkAutRequest, y);

app.use((req, res) => res.status(404).json({ message: 'Not found' }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port} (http://localhost:${port})`);
});
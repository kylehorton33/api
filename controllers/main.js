// a message at root ('/') to confirm that the server is running
const welcomeMessage = (req, res) => {
    res.json({
        message: "This message is sent from ./controllers/main.js",
    });
}

module.exports = {
    welcomeMessage
}
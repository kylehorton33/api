const welcomeMessage = (req, res) => {
    res.json({
        message: "This message is sent from ./controllers/main.js",
    });
}

module.exports = {
    welcomeMessage
}
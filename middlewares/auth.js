// Middleware to check if the user is logged in
const isLogin = async (req, res, next) => {
    try {
        if (req.session.user) {
            next(); // Proceed to the next middleware/route handler
        } else {
            // res.redirect('api/login'); // Redirect to login if not authenticated
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while checking login status" });
    }
};

// Middleware to check if the user is logged out
const isLogout = async (req, res, next) => {
    try {
        if (req.session.user) {
            res.send('121'); // Redirect to dashboard if already logged in
        } else {
            next(); // Proceed to the next middleware/route handler
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while checking logout status" });
    }
};

module.exports = {
    isLogin,
    isLogout
};

const API_URL = "http://127.0.0.1:8000";


// ==============================
// Show Login
// ==============================

function showLogin() {

    document
        .querySelector("#loginForm")
        .closest(".auth-card")
        .classList.remove("hidden");

    document
        .querySelector("#registerCard")
        .classList.add("hidden");

    document
        .querySelector("#dashboardCard")
        .classList.add("hidden");
}


// ==============================
// Show Register
// ==============================

function showRegister() {

    document
        .querySelector("#loginForm")
        .closest(".auth-card")
        .classList.add("hidden");

    document
        .querySelector("#registerCard")
        .classList.remove("hidden");

    document
        .querySelector("#dashboardCard")
        .classList.add("hidden");
}


// ==============================
// Show Dashboard
// ==============================

function showDashboard() {

    document
        .querySelector("#loginForm")
        .closest(".auth-card")
        .classList.add("hidden");

    document
        .querySelector("#registerCard")
        .classList.add("hidden");

    document
        .querySelector("#dashboardCard")
        .classList.remove("hidden");
}


// ==============================
// Register
// ==============================

document
    .getElementById("registerForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const username =
            document.getElementById("registerUsername").value;

        const email =
            document.getElementById("registerEmail").value;

        const password =
            document.getElementById("registerPassword").value;


        const message =
            document.getElementById("registerMessage");


        message.textContent = "Creating account...";


        try {

            const response = await fetch(
                `${API_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                message.textContent =
                    data.detail || "Registration failed.";

                return;
            }


            message.textContent =
                "Registration successful! Please login.";


            document
                .getElementById("registerForm")
                .reset();


            setTimeout(function() {

                showLogin();

            }, 1000);


        } catch (error) {

            console.error(error);

            message.textContent =
                "Cannot connect to the backend.";
        }

    });


// ==============================
// Login
// ==============================

document
    .getElementById("loginForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;


        const message =
            document.getElementById("loginMessage");


        message.textContent = "Logging in...";


        try {

            const response = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                message.textContent =
                    data.detail || "Login failed.";

                return;
            }


            // Save JWT token
            localStorage.setItem(
                "access_token",
                data.access_token
            );


            message.textContent =
                "Login successful!";


            // Get user information
            await loadUser();


        } catch (error) {

            console.error(error);

            message.textContent =
                "Cannot connect to the backend.";
        }

    });


// ==============================
// Load Current User
// ==============================

async function loadUser() {

    const token =
        localStorage.getItem("access_token");


    if (!token) {

        showLogin();

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/me`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            localStorage.removeItem(
                "access_token"
            );

            showLogin();

            return;
        }


        // Display user information

        document.getElementById("userId")
            .textContent = data.id;

        document.getElementById("username")
            .textContent = data.username;

        document.getElementById("userEmail")
            .textContent = data.email;


        showDashboard();


    } catch (error) {

        console.error(error);

        localStorage.removeItem(
            "access_token"
        );

        showLogin();
    }
}


// ==============================
// Logout / Sign Out
// ==============================

function logout() {

    localStorage.removeItem(
        "access_token"
    );


    document.getElementById("loginForm").reset();


    document.getElementById("loginMessage")
        .textContent = "";


    showLogin();
}


// ==============================
// Check Login on Page Load
// ==============================

window.addEventListener(
    "load",
    function() {

        loadUser();

    }
);
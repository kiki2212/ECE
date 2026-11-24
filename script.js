
// ============================================
// LOANFLOW - LOGIN AND SIGNUP
// Classroom demonstration only
// ============================================

// SIGN UP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const pwd1 = document.getElementById("pwd1").value;
        const pwd2 = document.getElementById("pwd2").value;
        const message = document.getElementById("message");

        // Validate matching passwords
        if (pwd1 !== pwd2) {
            message.textContent = "Passwords do not match!";
            message.className = "text-danger";
            return;
        }

        if (pwd1.length < 6) {
            message.textContent = "Password must have at least 6 characters.";
            message.className = "text-danger";
            return;
        }

        // Read existing users
        const users = JSON.parse(
            localStorage.getItem("loanflow_users") || "[]"
        );

        if (username.toLowerCase() === "admin") {
            message.textContent = "This username is reserved.";
            message.className = "text-danger";
            return;
        }

        // Prevent duplicate usernames
        if (users.some(user => user.username === username)) {
            message.textContent = "Username already exists!";
            message.className = "text-danger";
            return;
        }

        // Store new user
        users.push({
            username: username,
            password: pwd1,
            role: "user"
        });

        localStorage.setItem(
            "loanflow_users",
            JSON.stringify(users)
        );

        alert("Account created successfully!");
        window.location.href = "login.html";
    });
}


// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;

        const users = JSON.parse(
            localStorage.getItem("loanflow_users") || "[]"
        );

        
// Demo administrator credentials
const demoAdmin = {
    username: "admin",
    password: "Admin123!",
    role: "admin"
};

// Check administrator or registered users
const foundUser =
    (username === demoAdmin.username &&
     password === demoAdmin.password)
    ? demoAdmin
    : users.find(
        user => user.username === username &&
                user.password === password &&
                user.role === "user"
      );


        if (foundUser) {
            sessionStorage.setItem(
                "loanflow_current_user",
                JSON.stringify({
                    username: foundUser.username,
                    role: foundUser.role
                })
            );

            if (foundUser.role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "index.html";
            }

        } else {
            const message = document.getElementById("loginMessage");
            message.textContent = "Invalid username or password.";
            message.className = "text-danger";
        }
    });
}


// LOGOUT
function logout() {
    sessionStorage.removeItem("loanflow_current_user");
    window.location.href = "login.html";
}


// ============================================
// LOAN CALCULATOR
// ============================================

const calculatorForm = document.getElementById("calculatorForm");

if (calculatorForm) {
    calculatorForm.addEventListener("submit", function(event) {
        event.preventDefault();

        // Get values from HTML inputs
        const amount = Number(
            document.getElementById("loanAmount").value
        );

        const annualRate = Number(
            document.getElementById("interestRate").value
        );

        const months = Number(
            document.getElementById("loanMonths").value
        );

        const result = document.getElementById("loanResult");

        // Validate input values
        if (
            !Number.isFinite(amount) ||
            !Number.isFinite(annualRate) ||
            !Number.isInteger(months) ||
            amount <= 0 ||
            annualRate < 0 ||
            months <= 0
        ) {
            result.innerHTML =
                '<p class="text-danger">Please enter valid values.</p>';
            return;
        }

        // Convert annual percentage to monthly decimal rate
        const monthlyRate = annualRate / 100 / 12;

        let monthlyPayment;

        // Handle zero-interest loans
        if (monthlyRate === 0) {
            monthlyPayment = amount / months;
        } else {
            const factor = Math.pow(1 + monthlyRate, months);

            monthlyPayment =
                amount * monthlyRate * factor / (factor - 1);
        }

        // Calculate totals
        const totalPayment = monthlyPayment * months;
        const totalInterest = totalPayment - amount;

        // Format values in euros
        const euro = value =>
            value.toLocaleString("en-IE", {
                style: "currency",
                currency: "EUR"
            });

        // Display results
        result.innerHTML = `
            <div class="alert alert-primary">
                <h4>Loan Calculation Results</h4>

                <hr>

                <p>
                    <strong>Monthly Payment:</strong>
                    ${euro(monthlyPayment)}
                </p>

                <p>
                    <strong>Total Interest:</strong>
                    ${euro(totalInterest)}
                </p>

                <p>
                    <strong>Total Payment:</strong>
                    ${euro(totalPayment)}
                </p>
            </div>
        `;
    });
}


// ============================================
// BASIC PAGE ACCESS CHECK
// Classroom demo only, not secure authentication
// ============================================

const currentPage = location.pathname.split("/").pop();

if (
    ["index.html", "calculator.html", "apply.html"].includes(currentPage) &&
    !sessionStorage.getItem("loanflow_current_user")
) {
    window.location.replace("login.html");
}



// ============================================
// LOAN APPLICATIONS - JSON + LOCALSTORAGE
// ============================================

// Read all saved applications
function getLoanApplications() {
    return JSON.parse(
        localStorage.getItem("loanflow_applications") || "[]"
    );
}

// Save applications as JSON
function saveLoanApplications(applications) {
    localStorage.setItem(
        "loanflow_applications",
        JSON.stringify(applications)
    );
}

// Format amounts in euros
function formatLoanMoney(value) {
    return Number(value).toLocaleString("en-IE", {
        style: "currency",
        currency: "EUR"
    });
}

// Convert text to safe HTML
function escapeLoanText(value) {
    const element = document.createElement("span");
    element.textContent = String(value);
    return element.innerHTML;
}

// Get the user currently logged in
function getCurrentLoanUser() {
    return JSON.parse(
        sessionStorage.getItem("loanflow_current_user") || "null"
    );
}

// ============================================
// SUBMIT A LOAN APPLICATION
// ============================================

const loanApplicationForm = document.getElementById(
    "loanApplicationForm"
);

if (loanApplicationForm) {
    loanApplicationForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const user = getCurrentLoanUser();
        const message = document.getElementById(
            "applicationMessage"
        );

        if (!user || user.role !== "user") {
            message.innerHTML =
                '<div class="alert alert-danger">Please log in as a user.</div>';
            return;
        }

        const amount = Number(
            document.getElementById("applyAmount").value
        );

        const interestRate = Number(
            document.getElementById("applyRate").value
        );

        const months = Number(
            document.getElementById("applyMonths").value
        );

        const purpose = document.getElementById(
            "applyPurpose"
        ).value;

        // Validate form values
        if (
            !Number.isFinite(amount) ||
            amount <= 0 ||
            !Number.isFinite(interestRate) ||
            interestRate < 0 ||
            !Number.isInteger(months) ||
            months <= 0 ||
            !purpose
        ) {
            message.innerHTML =
                '<div class="alert alert-danger">Please enter valid loan information.</div>';
            return;
        }

        // Create an application object
        const application = {
            id: crypto.randomUUID(),
            username: user.username,
            amount: amount,
            interestRate: interestRate,
            months: months,
            purpose: purpose,
            status: "Pending",
            createdAt: new Date().toISOString()
        };

        // Read, modify and save JSON data
        const applications = getLoanApplications();
        applications.push(application);

        saveLoanApplications(applications);

        message.innerHTML = `
            <div class="alert alert-success">
                Loan application submitted successfully!
                Your request is now Pending.
            </div>
        `;

        loanApplicationForm.reset();

        // Refresh the status table
        displayMyLoanApplications();
    });
}


// ============================================
// DISPLAY THE USER'S APPLICATIONS
// ============================================

function displayMyLoanApplications() {
    const table = document.getElementById("myApplications");

    if (!table) return;

    const user = getCurrentLoanUser();

    if (!user || user.role !== "user") {
        table.innerHTML =
            '<tr><td colspan="5">Please log in as a user.</td></tr>';
        return;
    }

    // Only show applications belonging to this user
    const applications = getLoanApplications().filter(
        application => application.username === user.username
    );

    if (applications.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-muted text-center">
                    No loan applications yet.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = applications.map(application => {

        let badgeClass = "bg-warning text-dark";

        if (application.status === "Approved") {
            badgeClass = "bg-success";
        }

        if (application.status === "Rejected") {
            badgeClass = "bg-danger";
        }

        return `
            <tr>
                <td>${escapeLoanText(application.id.slice(0, 8))}</td>
                <td>${formatLoanMoney(application.amount)}</td>
                <td>${escapeLoanText(application.purpose)}</td>
                <td>${application.months}</td>
                <td>
                    <span class="badge ${badgeClass}">
                        ${escapeLoanText(application.status)}
                    </span>
                </td>
            </tr>
        `;
    }).join("");
}

// Load applications when opening apply.html
displayMyLoanApplications();


// ============================================
// ADMIN DASHBOARD
// ============================================

const adminTable = document.getElementById(
    "adminApplications"
);

// Check administrator role
if (adminTable) {
    const currentUser = getCurrentLoanUser();

    if (!currentUser || currentUser.role !== "admin") {
        window.location.replace("login.html");
    } else {
        displayAdminApplications();
    }
}


// ============================================
// DISPLAY ALL LOAN APPLICATIONS
// ============================================

function displayAdminApplications() {
    const table = document.getElementById(
        "adminApplications"
    );

    if (!table) return;

    const currentUser = getCurrentLoanUser();

    if (!currentUser || currentUser.role !== "admin") {
        return;
    }

    const applications = getLoanApplications();

    // Update statistics
    document.getElementById("totalLoans").textContent =
        applications.length;

    document.getElementById("pendingLoans").textContent =
        applications.filter(
            loan => loan.status === "Pending"
        ).length;

    document.getElementById("approvedLoans").textContent =
        applications.filter(
            loan => loan.status === "Approved"
        ).length;

    document.getElementById("rejectedLoans").textContent =
        applications.filter(
            loan => loan.status === "Rejected"
        ).length;

    // Empty table
    if (applications.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    No loan applications available.
                </td>
            </tr>
        `;
        return;
    }

    // Generate rows
    table.innerHTML = applications.map(loan => {

        let badgeClass = "bg-warning text-dark";

        if (loan.status === "Approved") {
            badgeClass = "bg-success";
        }

        if (loan.status === "Rejected") {
            badgeClass = "bg-danger";
        }

        // Only pending applications can be decided
        const actions = loan.status === "Pending"
            ? `
                <button
                    class="btn btn-success btn-sm me-1"
                    data-loan-id="${loan.id}"
                    data-decision="Approved">
                    Approve
                </button>

                <button
                    class="btn btn-danger btn-sm"
                    data-loan-id="${loan.id}"
                    data-decision="Rejected">
                    Reject
                </button>
              `
            : `<span class="text-muted">Reviewed</span>`;

        return `
            <tr>
                <td>${escapeLoanText(loan.username)}</td>
                <td>${formatLoanMoney(loan.amount)}</td>
                <td>${escapeLoanText(loan.purpose)}</td>
                <td>${Number(loan.months)} months</td>
                <td>
                    <span class="badge ${badgeClass}">
                        ${escapeLoanText(loan.status)}
                    </span>
                </td>
                <td>${actions}</td>
            </tr>
        `;
    }).join("");
}


// ============================================
// APPROVE OR REJECT APPLICATION
// ============================================

function updateLoanStatus(loanId, newStatus) {
    const currentUser = getCurrentLoanUser();

    if (!currentUser || currentUser.role !== "admin") {
        return;
    }

    if (!["Approved", "Rejected"].includes(newStatus)) {
        return;
    }

    const applications = getLoanApplications();

    const loan = applications.find(
        item => item.id === loanId
    );

    if (!loan || loan.status !== "Pending") {
        return;
    }

    // Change loan status
    loan.status = newStatus;
    loan.reviewedAt = new Date().toISOString();

    // Save changes to localStorage as JSON
    saveLoanApplications(applications);

    // Show confirmation
    document.getElementById("adminMessage").textContent =
        `Loan application ${newStatus.toLowerCase()} successfully!`;

    document.getElementById("adminMessage").className =
        "mt-3 text-success";

    // Refresh statistics and table
    displayAdminApplications();
}


// ============================================
// HANDLE ADMIN BUTTON CLICKS
// ============================================

if (adminTable) {
    adminTable.addEventListener("click", function(event) {
        const button = event.target.closest(
            "button[data-loan-id]"
        );

        if (!button) return;

        const loanId = button.dataset.loanId;
        const decision = button.dataset.decision;

        updateLoanStatus(loanId, decision);
    });
}

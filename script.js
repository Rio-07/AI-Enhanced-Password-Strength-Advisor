// Password strength evaluation and HIBP breach checking

// Tips for password improvement
const tips = [
  "Use at least 12 characters for a stronger password.",
  "Include uppercase, lowercase letters, numbers, and symbols.",
  "Avoid common words like 'password123' or 'qwerty'.",
  "Do not reuse passwords for multiple accounts.",
  "Consider using a secure password manager for complex passwords."
];

// Display tips in the suggestions section
const tipsList = document.getElementById("tips-list");
tips.forEach((tip) => {
  const li = document.createElement("li");
  li.textContent = tip;
  tipsList.appendChild(li);
});

// Function to evaluate password strength
function evaluatePassword() {
  const password = document.getElementById("password").value;
  const strengthBar = document.getElementById("strength-bar");
  const strengthText = document.getElementById("strength-text");
  const breachMessage = document.getElementById("breach-message");

  let strength = 0;

  // Reset messages
  breachMessage.textContent = "";
  strengthText.style.color = "";

  // Basic strength metrics
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[\W_]/.test(password)) strength++;
  if (password.length >= 12) strength++;

  // Update the bar and text dynamically
  switch (strength) {
    case 0:
    case 1:
      strengthBar.style.width = "20%";
      strengthBar.style.background = "#ff4b5c";
      strengthText.textContent = "Very Weak 🔴";
      break;
    case 2:
    case 3:
      strengthBar.style.width = "50%";
      strengthBar.style.background = "#ffa41b";
      strengthText.textContent = "Moderate 🟠";
      break;
    case 4:
    case 5:
      strengthBar.style.width = "80%";
      strengthBar.style.background = "#32c4ff";
      strengthText.textContent = "Strong 🟡";
      break;
    case 6:
      strengthBar.style.width = "100%";
      strengthBar.style.background = "#23c93b";
      strengthText.textContent = "Very Strong 🟢";
      break;
    default:
      strengthBar.style.width = "0%";
      strengthText.textContent = "";
  }

  // Check if the password is in a data breach
  checkHIBP(password);
}

// Function to hash the password using SHA-1
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Function to check if the password has been pwned
async function checkHIBP(password) {
  const breachMessage = document.getElementById("breach-message");

  // Hash the password and get the first 5 characters (prefix)
  const hash = await hashPassword(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  // Query the HIBP API
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const data = await response.text();

  // Check if the hash suffix is in the returned data
  const found = data.split("\n").some((line) => line.startsWith(suffix.toUpperCase()));

  // Update UI based on the breach status
  if (found) {
    breachMessage.innerHTML = `
      <p><strong>⚠️ Your password has been exposed in a breach.</strong></p>
      <p>We recommend:</p>
      <ul>
        <li>Changing this password immediately.</li>
        <li>Using a unique password for each account.</li>
        <li>Enabling two-factor authentication (2FA) where possible.</li>
      </ul>
    `;
    breachMessage.style.color = "red";
  } else {
    breachMessage.textContent = "✅ This password is safe and not found in any breaches.";
    breachMessage.style.color = "green";
  }
}

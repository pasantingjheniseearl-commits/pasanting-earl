async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Wait for Firebase to log in
    await auth.signInWithEmailAndPassword(email, password);

    // Successful login → redirect to dashboard
    window.location.href = 'dashboard.html';
  } catch (error) {
    // Handle errors
    alert(error.message);
  }
}
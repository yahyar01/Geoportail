document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    
    // Effacer les messages précédents
    messageDiv.className = 'message';
    messageDiv.style.display = 'none';
    
    // Validation basique
    if (!email || !password) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }
        
    try {
        const response = await fetch('/PHP/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Connexion réussie! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = 'main.php';
            }, 1500);
        } else {
            showMessage(data.message || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        showMessage('Erreur de connexion au serveur', 'error');
    }
});

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';
}
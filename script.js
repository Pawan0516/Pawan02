document.addEventListener('DOMContentLoaded', function() {
    // Canvas Background
    setupCanvas();
    
    // Navigation
    setupNavigation();
    
    // Contact Form
    setupContactForm();
    
    // Character click event for submission page
    setupCharacterInteraction();
});

// Canvas Background Setup
function setupCanvas() {
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particlesArray = [];
    const numberOfParticles = (canvas.height * canvas.width) / 9000;

    let hue = 0;

    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const mouse = {
        x: undefined,
        y: undefined,
    };

    canvas.addEventListener('click', function(event) {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    canvas.addEventListener('mousemove', function(event) {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 1.5;
            this.color = 'hsl(' + hue + ', 100%, 50%)';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.size > 0.1) this.size -= 0.03;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        for (let i = 0; i < numberOfParticles; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            particlesArray.push(new Particle(x, y));
        }
    }
    init();

    function handleParticles() {
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
            if (particlesArray[i].size <= 0.2) {
                particlesArray.splice(i, 1);
                i--;
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handleParticles();
        hue += 2;
        if (particlesArray.length < numberOfParticles) {
            particlesArray.push(new Particle(mouse.x, mouse.y));
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    // Click event for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section id
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Show target section
            document.getElementById(targetId).classList.add('active');
            
            // Scroll to top of section
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
    
    // Back button for contact form submission
    const backToContactBtn = document.getElementById('backToContact');
    if (backToContactBtn) {
        backToContactBtn.addEventListener('click', function() {
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById('contact').classList.add('active');
            
            // Update nav active state
            navLinks.forEach(link => link.classList.remove('active'));
            document.querySelector('a[href="#contact"]').classList.add('active');
        });
    }
}

// Contact Form Setup
function submitForm() {
    // Basic form validation
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if (!name || !email || !message) {
        alert("Please fill in all required fields.");
        return false;
    }
    
    // Get form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('mobile', document.getElementById("mobile").value);
    formData.append('subject', document.getElementById("subject").value);
    formData.append('message', message);
    
    // Show loading indicator
    document.getElementById("submitBtn").disabled = true;
    document.getElementById("submitBtn").innerText = "Sending...";
    
    // Send data to server
    fetch('/submit_message', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data);
        
        // Show the submission section
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById('submit-section').classList.add('active');
        
        // Show bubble message
        const bubble = document.getElementById('bubble');
        bubble.innerText = data.message || "HELLO_My Friend!";
        bubble.style.opacity = 1;
        setTimeout(() => {
            bubble.style.opacity = 0;
        }, 3000);
        
        // Reset the form
        document.getElementById("contactForm").reset();
        document.getElementById("submitBtn").disabled = false;
        document.getElementById("submitBtn").innerText = "Submit";
    })
    .catch(error => {
        console.error('Error:', error);
        alert("There was an error sending your message. Please try again.");
        document.getElementById("submitBtn").disabled = false;
        document.getElementById("submitBtn").innerText = "Submit";
    });
    
    return false; // Prevent actual form submission
}

// Setup contact form submission
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            return submitForm();
        };
    }
}

// Character interaction setup
function setupCharacterInteraction() {
    const character = document.getElementById("character");
    const bubble = document.getElementById("bubble");
    
    if (character && bubble) {
        character.addEventListener("click", () => {
            bubble.style.opacity = 1;
            setTimeout(() => {
                bubble.style.opacity = 0;
            }, 2000);
        });
    }
}

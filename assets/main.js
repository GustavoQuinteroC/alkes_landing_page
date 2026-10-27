// Migrado desde index.html

document.addEventListener('DOMContentLoaded', function () {
    var yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

/*
========================================================================
   LOGICA JAVASCRIPT - ALKES INTERACTIVE
   Corrección: Manejo correcto del ancho del Canvas para evitar overflow
   en móviles.
========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. INICIALIZACIÓN DE AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });

    // 2. NAVEGACIÓN STICKY CON EFECTO GLASS
    const navbar = document.querySelector('.navbar');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);

    // 2.1 Fondo del navbar cuando el menú móvil está abierto
    const navbarCollapse = document.getElementById('navbarContent');
    if (navbarCollapse) {
        navbarCollapse.addEventListener('show.bs.collapse', () => {
            navbar.classList.add('nav-open');
        });
        navbarCollapse.addEventListener('hidden.bs.collapse', () => {
            navbar.classList.remove('nav-open');
        });
    }

    // 3. ANIMACIÓN HERO CANVAS (Red Neuronal / Conexiones) - CORREGIDO
    const canvas = document.getElementById('hero-canvas');
    const parentSection = document.getElementById('inicio');
    const ctx = canvas.getContext('2d');
    let particlesArray;

    // Función robusta para ajustar el tamaño del canvas
    const resizeCanvas = () => {
        // Usamos el tamaño del contenedor padre (hero-section)
        // en lugar de window.innerWidth para evitar el problema de scroll horizontal
        canvas.width = parentSection.offsetWidth;
        canvas.height = parentSection.offsetHeight;
    };

    // Inicializar tamaño
    resizeCanvas();

    // Escuchar redimensionamiento con debounce simple
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            initParticles();
        }, 100);
    });

    // Clase Partícula
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }
        update() {
            // Rebotar en los bordes del canvas actual
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    // Inicializar partículas
    function initParticles() {
        particlesArray = [];
        // Ajustar cantidad de partículas según el area
        let numberOfParticles = (canvas.height * canvas.width) / 15000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 1) - 0.5;
            let directionY = (Math.random() * 1) - 0.5;
            let color = '#ffffff';
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Animar líneas de conexión
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width/7) * (canvas.height/7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(255, 255, 255,' + opacityValue + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Loop de animación
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Usar dimensiones actuales del canvas
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    // Iniciar canvas
    initParticles();
    animate();

    // 5. MANEJO DEL FORMULARIO: POST a Webhook n8n y TOAST
    const form = document.getElementById('contactForm');
    const toastContainer = document.getElementById('toastContainer');

    function showToast(message, type = 'success', title = 'Notificación') {
        const toast = document.createElement('div');
        toast.className = 'custom-toast';

        const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';
        const color = type === 'success' ? 'var(--accent-color)' : '#dc3545';

        toast.innerHTML = `
            <i class="bi ${icon}" style="color: ${color}; font-size: 1.5rem; margin-right: 15px;"></i>
            <div>
                <h6 class="mb-0 fw-bold">${title}</h6>
                <p class="mb-0 text-muted small">${message}</p>
            </div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validación nativa Bootstrap-like
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                showToast('Revisa los campos del formulario e inténtalo de nuevo.', 'error', 'Datos inválidos');
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            const originalContent = btn ? btn.innerHTML : '';

            if (btn) {
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Enviando...';
                btn.disabled = true;
            }

            const payload = {
                nombre: (document.getElementById('contactNombre')?.value || '').trim(),
                correo: (document.getElementById('contactCorreo')?.value || '').trim(),
                mensaje: (document.getElementById('contactMensaje')?.value || '').trim()
            };

            try {
                const res = await fetch('https://n8n.alkes.mx/webhook/5e01eab7-3786-4ccf-a104-dba8fad359bf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'pass': 'passAlkes1'
                    },
                    body: JSON.stringify(payload)
                });

                let data = null;
                try {
                    data = await res.json();
                } catch {
                    // si no es JSON, lo tratamos como error
                    data = null;
                }

                if (res.ok && data && data.respuesta === 'ok') {
                    showToast('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.', 'success', 'Enviado');
                    form.reset();
                    form.classList.remove('was-validated');
                } else {
                    const detalle = data ? JSON.stringify(data) : `HTTP ${res.status}`;
                    showToast(`No se pudo enviar el mensaje. Revisa los datos ingresados y vuelve a intentarlo.`, 'error', 'Error al enviar');
                }
            } catch (err) {
                showToast('No se pudo conectar con el servidor. Verifica tu conexión e inténtalo más tarde.', 'error', 'Error de red');
            } finally {
                if (btn) {
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                }
            }
        });
    }
});
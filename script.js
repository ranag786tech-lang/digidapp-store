// ===================================
// DigiDapp Store - Interactive JavaScript
// "Decentralize Your Digital Life"
// ===================================

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===================================
// Particle System
// ===================================
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = this.getParticleCount();
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', debounce(() => this.resize(), 250));
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
    }
    
    getParticleCount() {
        const width = window.innerWidth;
        if (width > 1200) return 80;
        if (width > 768) return 50;
        return 30;
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.particleCount = this.getParticleCount();
        this.init();
    }
    
    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            const size = Math.random() * 3 + 1;
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const speedX = (Math.random() - 0.5) * 0.5;
            const speedY = (Math.random() - 0.5) * 0.5;
            this.particles.push({ x, y, size, speedX, speedY });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x > this.canvas.width) p.x = 0;
            else if (p.x < 0) p.x = this.canvas.width;
            if (p.y > this.canvas.height) p.y = 0;
            else if (p.y < 0) p.y = this.canvas.height;
            
            if (this.mouse.x && this.mouse.y) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    p.x -= Math.cos(angle) * force * 2;
                    p.y -= Math.sin(angle) * force * 2;
                }
            }
            
            this.ctx.fillStyle = 'rgba(0, 242, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.strokeStyle = `rgba(0, 242, 255, ${1 - distance / 100})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// ===================================
// Navigation
// ===================================
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.init();
    }
    
    init() {
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => {
                this.hamburger.classList.toggle('active');
                this.navMenu.classList.toggle('active');
            });
        }
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.hamburger) {
                    this.hamburger.classList.remove('active');
                }
                if (this.navMenu) {
                    this.navMenu.classList.remove('active');
                }
            });
        });
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        window.addEventListener('scroll', throttle(() => this.updateActiveLink(), 100));
        
        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY > 50) {
                this.navbar.style.background = 'rgba(10,25,47,0.98)';
            } else {
                this.navbar.style.background = 'rgba(10,25,47,0.95)';
            }
        }, 100));
    }
    
    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                this.navLinks.forEach(l => l.classList.remove('active'));
                if (link) link.classList.add('active');
            }
        });
    }
}

// ===================================
// Scroll Animations
// ===================================
class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll(
            '.item-card, .visual-card, .feature-item, .info-card'
        );
        
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        
        this.init();
    }
    
    init() {
        this.elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            this.observer.observe(el);
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }
}

// ===================================
// Button Interactions
// ===================================
class ButtonInteractions {
    constructor() {
        this.init();
    }
    
    init() {
        // Download buttons
        document.querySelectorAll('.btn-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnText = btn.textContent.trim();
                if (btnText.includes('Download') || btnText.includes('Free')) {
                    this.showNotification('✅ Download started! File will be ready soon.');
                } else if (btnText.includes('Buy') || btnText.includes('PKR')) {
                    this.showNotification('💳 Coming Soon! Payment system under development.');
                } else if (btnText.includes('NFT') || btnText.includes('ETH')) {
                    this.showNotification('⛓️ Connect your wallet to purchase NFTs.');
                }
            });
        });
        
        // Notify Me button
        document.querySelectorAll('.btn').forEach(btn => {
            if (btn.textContent.includes('Notify')) {
                btn.addEventListener('click', () => {
                    this.showNotification('🔔 Great! We\'ll notify you when new NFTs drop.');
                });
            }
        });
        
        // View All buttons
        document.querySelectorAll('.btn-outline').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showNotification('🚀 Full catalog coming soon! Stay tuned.');
            });
        });
    }
    
    showNotification(message) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// ===================================
// Scroll to Top Button
// ===================================
function createScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #00f2ff, #ff00ff);
        color: #0a192f;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        font-size: 1.25rem;
        box-shadow: 0 4px 8px rgba(0,242,255,0.3);
    `;
    
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 500) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    }, 100));
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.transform = 'translateY(-5px) scale(1.1)';
        scrollBtn.style.boxShadow = '0 8px 16px rgba(0,242,255,0.5)';
    });
    
    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.transform = 'translateY(0) scale(1)';
        scrollBtn.style.boxShadow = '0 4px 8px rgba(0,242,255,0.3)';
    });
}

// ===================================
// Loading Animation
// ===================================
function createLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0a192f;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    `;
    
    loader.innerHTML = `
        <div style="text-align: center;">
            <div style="
                width: 60px;
                height: 60px;
                border: 4px solid rgba(0,242,255,0.1);
                border-top: 4px solid #00f2ff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <p style="
                color: #00f2ff;
                font-family: 'Orbitron', sans-serif;
                font-size: 1.25rem;
            ">Loading DigiDapp Store...</p>
            <p style="
                color: #8892b0;
                font-family: 'Inter', sans-serif;
                font-size: 0.95rem;
                margin-top: 10px;
            ">Decentralize Your Digital Life</p>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 500);
    });
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// ===================================
// Hero Stats Animation
// ===================================
class StatsAnimation {
    constructor() {
        this.stats = document.querySelectorAll('.stat-number');
        this.animated = new Set();
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            { threshold: 0.5 }
        );
        
        this.init();
    }
    
    init() {
        this.stats.forEach(stat => {
            this.observer.observe(stat);
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animated.has(entry.target)) {
                this.animated.add(entry.target);
                this.animateStat(entry.target);
            }
        });
    }
    
    animateStat(element) {
        const text = element.textContent;
        const number = parseInt(text.replace(/\D/g, ''));
        const duration = 2000;
        const step = number / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= number) {
                element.textContent = text;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    }
}

// ===================================
// Preview Buttons
// ===================================
class PreviewHandler {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.btn-preview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.item-card');
                const title = card.querySelector('.card-title')?.textContent || 'Item';
                this.showNotification(`👁️ Preview: ${title} - Full preview coming soon!`);
            });
        });
    }
    
    showNotification(message) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// ===================================
// Card Hover Effects
// ===================================
class CardEffects {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
}

// ===================================
// Console Message
// ===================================
function consoleMessage() {
    const styles = {
        title: 'color: #00f2ff; font-size: 24px; font-weight: bold;',
        subtitle: 'color: #ff00ff; font-size: 16px; font-weight: bold;',
        text: 'color: #b8c1ec; font-size: 14px;',
        link: 'color: #ffff00; font-size: 14px;'
    };
    
    console.log('%c⚛️ DigiDapp Store', styles.title);
    console.log('%cDecentralize Your Digital Life', styles.subtitle);
    console.log('%cWelcome to the future of digital ownership!', styles.text);
    console.log('%c🔗 Portfolio: https://digitaldairy786.github.io/digitaldairy786-portfolio', styles.link);
    console.log('%c💻 By DigitalDairy786', styles.text);
    console.log('%cبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', styles.subtitle);
}

// ===================================
// Initialize Everything
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Loading animation
    createLoadingAnimation();
    
    // Initialize particle system
    new ParticleSystem('particleCanvas');
    
    // Initialize navigation
    new Navigation();
    
    // Initialize scroll animations
    new ScrollAnimations();
    
    // Initialize button interactions
    new ButtonInteractions();
    
    // Initialize stats animation
    new StatsAnimation();
    
    // Initialize preview handler
    new PreviewHandler();
    
    // Initialize card effects
    new CardEffects();
    
    // Create scroll to top button
    createScrollToTop();
    
    // Console message
    consoleMessage();
});

// ===================================
// Performance Optimization
// ===================================

// Reduce animations on low-power devices
if (navigator.connection && navigator.connection.saveData) {
    document.body.classList.add('reduced-motion');
    const style = document.createElement('style');
    style.textContent = `
        .reduced-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    `;
    document.head.appendChild(style);
}

// ===================================
// Error Handling
// ===================================
window.addEventListener('error', (e) => {
    console.error('Error caught:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

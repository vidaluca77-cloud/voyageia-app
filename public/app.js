// VoyageIA - Application JavaScript

// Configuration globale
const API_BASE_URL = window.location.origin;

// Utilitaires
class VoyageIA {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSmoothScrolling();
        console.log('🎆 VoyageIA initialized successfully!');
    }

    setupEventListeners() {
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                this.scrollToSection(targetId.substring(1));
            });
        });
    }

    setupSmoothScrolling() {
        // Déjà géré par CSS scroll-behavior: smooth
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 80; // Compte pour le header fixe
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    showLoading() {
        const modal = document.getElementById('loading-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideLoading() {
        const modal = document.getElementById('loading-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showError(message) {
        // Créer une notification d'erreur
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Ajouter les styles si nécessaire
        if (!document.querySelector('.error-notification-styles')) {
            const styles = document.createElement('style');
            styles.className = 'error-notification-styles';
            styles.textContent = `
                .error-notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: #ef4444;
                    color: white;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                    animation: slideIn 0.3s ease-out;
                }
                .error-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .error-content button {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 0.25rem;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(errorDiv);
        
        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    async makeAPICall(endpoint, data = null, method = 'GET') {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }
}

// Fonctions globales pour les boutons
function scrollToSection(sectionId) {
    if (window.voyageIA) {
        window.voyageIA.scrollToSection(sectionId);
    }
}

async function searchTrips() {
    const destination = document.getElementById('destination').value;
    const dates = document.getElementById('dates').value;
    const budget = document.getElementById('budget').value;
    const preferences = document.getElementById('preferences').value;
    
    if (!destination.trim()) {
        window.voyageIA.showError('Veuillez entrer une destination');
        return;
    }
    
    const searchData = {
        destination: destination.trim(),
        dates,
        budget: budget ? parseInt(budget) : null,
        preferences
    };
    
    try {
        window.voyageIA.showLoading();
        
        // Appel API
        const results = await window.voyageIA.makeAPICall('/api/search', searchData, 'POST');
        
        // Afficher les résultats
        displaySearchResults(results);
        
    } catch (error) {
        console.error('Search failed:', error);
        window.voyageIA.showError('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
        window.voyageIA.hideLoading();
    }
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    
    if (!results.suggestions || results.suggestions.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Aucun résultat trouvé</h3>
                <p>Essayez avec une destination différente ou modifiez vos critères.</p>
            </div>
        `;
        return;
    }
    
    const resultsHTML = results.suggestions.map(suggestion => {
        const icon = suggestion.type === 'vol' ? 'plane' : 'hotel';
        
        return `
            <div class="result-card">
                <div class="result-header">
                    <i class="fas fa-${icon}"></i>
                    <h3>${suggestion.type === 'vol' ? suggestion.airline : suggestion.name}</h3>
                </div>
                <div class="result-details">
                    ${suggestion.type === 'vol' 
                        ? `<p><strong>Durée:</strong> ${suggestion.duration}</p>`
                        : `<p><strong>Note:</strong> ${suggestion.rating}/5</p>`
                    }
                    <div class="price">${suggestion.price}€</div>
                </div>
                <button class="btn btn-primary" onclick="bookTrip('${suggestion.type}', ${JSON.stringify(suggestion).replace(/"/g, '&quot;')})">
                    <i class="fas fa-shopping-cart"></i>
                    Réserver
                </button>
            </div>
        `;
    }).join('');
    
    resultsContainer.innerHTML = `
        <h3>Résultats pour "${results.destination}"</h3>
        <div class="results-grid">
            ${resultsHTML}
        </div>
    `;
}

async function getRecommendations() {
    const userPreferences = document.getElementById('user-preferences').value;
    
    if (!userPreferences.trim()) {
        window.voyageIA.showError('Veuillez décrire vos préférences de voyage');
        return;
    }
    
    const recommendationData = {
        userProfile: {
            preferences: userPreferences.trim()
        },
        preferences: userPreferences.trim()
    };
    
    try {
        window.voyageIA.showLoading();
        
        // Appel API
        const recommendations = await window.voyageIA.makeAPICall('/api/recommendations', recommendationData, 'POST');
        
        // Afficher les recommandations
        displayRecommendations(recommendations);
        
    } catch (error) {
        console.error('Recommendations failed:', error);
        window.voyageIA.showError('Erreur lors de la génération des recommandations. Veuillez réessayer.');
    } finally {
        window.voyageIA.hideLoading();
    }
}

function displayRecommendations(recommendations) {
    const resultsContainer = document.getElementById('recommendations-results');
    
    if (!recommendations) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-robot"></i>
                <h3>Aucune recommandation disponible</h3>
                <p>Essayez de décrire plus précisément vos intérêts.</p>
            </div>
        `;
        return;
    }
    
    let recommendationsHTML = '';
    
    if (recommendations.destinations && recommendations.destinations.length > 0) {
        recommendationsHTML += `
            <div class="recommendation-card">
                <h3><i class="fas fa-map-marker-alt"></i> Destinations recommandées</h3>
                <ul>
                    ${recommendations.destinations.map(dest => `<li>${dest}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (recommendations.activities && recommendations.activities.length > 0) {
        recommendationsHTML += `
            <div class="recommendation-card">
                <h3><i class="fas fa-star"></i> Activités suggérées</h3>
                <ul>
                    ${recommendations.activities.map(activity => `<li>${activity}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (recommendations.tips) {
        recommendationsHTML += `
            <div class="recommendation-card">
                <h3><i class="fas fa-lightbulb"></i> Conseils IA</h3>
                <p>${recommendations.tips}</p>
            </div>
        `;
    }
    
    resultsContainer.innerHTML = recommendationsHTML || `
        <div class="no-results">
            <i class="fas fa-robot"></i>
            <h3>Aucune recommandation spécifique</h3>
            <p>L'IA n'a pas pu générer de recommandations pour cette requête.</p>
        </div>
    `;
}

async function bookTrip(type, suggestion) {
    try {
        window.voyageIA.showLoading();
        
        const bookingData = {
            type,
            suggestion,
            timestamp: new Date().toISOString()
        };
        
        const booking = await window.voyageIA.makeAPICall('/api/booking', { bookingData }, 'POST');
        
        // Afficher la confirmation
        alert(`🎉 Réservation confirmée!\n\nNuméro de réservation: ${booking.id}\nStatut: ${booking.status}`);
        
    } catch (error) {
        console.error('Booking failed:', error);
        window.voyageIA.showError('Erreur lors de la réservation. Veuillez réessayer.');
    } finally {
        window.voyageIA.hideLoading();
    }
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.voyageIA = new VoyageIA();
    
    // Test de l'API au chargement
    window.voyageIA.makeAPICall('/api/health')
        .then(response => {
            console.log('✓ API Status:', response.message);
        })
        .catch(error => {
            console.warn('API not available:', error.message);
        });
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Export pour les tests (si nécessaire)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VoyageIA, searchTrips, getRecommendations, bookTrip };
}

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VoyageIA API is running' });
});

// Route pour la recherche de voyages
app.post('/api/search', async (req, res) => {
  try {
    const { destination, dates, budget, preferences } = req.body;
    
    // TODO: Intégrer avec l'API Amadeus pour la recherche de vols/hôtels
    // TODO: Intégrer avec OpenAI pour les recommandations personnalisées
    
    const mockResults = {
      destination,
      suggestions: [
        {
          type: 'vol',
          price: Math.floor(Math.random() * 1000) + 200,
          airline: 'Air France',
          duration: '2h 30min'
        },
        {
          type: 'hotel',
          name: 'Hôtel de Luxe',
          price: Math.floor(Math.random() * 300) + 100,
          rating: 4.5
        }
      ]
    };
    
    res.json(mockResults);
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour les recommandations IA
app.post('/api/recommendations', async (req, res) => {
  try {
    const { userProfile, preferences } = req.body;
    
    // TODO: Intégrer avec OpenAI pour générer des recommandations personnalisées
    
    const mockRecommendations = {
      destinations: ['Paris', 'Rome', 'Barcelona'],
      activities: ['Musées', 'Gastronomie', 'Architecture'],
      tips: 'Considérez voyager en basse saison pour de meilleurs prix.'
    };
    
    res.json(mockRecommendations);
  } catch (error) {
    console.error('Error in recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour les réservations
app.post('/api/booking', async (req, res) => {
  try {
    const { bookingData } = req.body;
    
    // TODO: Intégrer avec les systèmes de réservation
    
    const mockBooking = {
      id: 'VOYAGE-' + Date.now(),
      status: 'confirmed',
      details: bookingData
    };
    
    res.json(mockBooking);
  } catch (error) {
    console.error('Error in booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route principale - sert l'application React/HTML
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`\ud83c\udf86 VoyageIA server running on port ${PORT}`);
  console.log(`\ud83c\udf0d Visit: http://localhost:${PORT}`);
});

import { ShoppingBag, ArrowRight } from 'lucide-react';
import './FoodRecommendations.css';

export default function FoodRecommendations({ pet }) {
  if (!pet) return null;

  // Determine Recommendation Logic based on Pet Attributes
  const getRecommendation = () => {
    let recommendation = {
      title: "Premium Adult Diet",
      description: "A balanced diet formulated for optimal health and vitality.",
      searchQuery: `${pet.type} food adult premium`
    };

    const ageLower = pet.age ? pet.age.toLowerCase() : '';
    const isPuppyKitten = ageLower.includes('month') || ageLower.includes('wk') || ageLower.includes('week');
    const isSenior = ageLower.includes('yr') && parseInt(ageLower) >= 7;

    if (pet.type === 'Dog') {
      if (isPuppyKitten) {
        recommendation = {
          title: "Puppy Growth Formula",
          description: "High protein and DHA for brain development and growing bones.",
          searchQuery: "puppy food premium DHA"
        };
      } else if (isSenior) {
        recommendation = {
          title: "Senior Joint Health Diet",
          description: "Formulated with Glucosamine for joint support and easier digestion.",
          searchQuery: "senior dog food joint health"
        };
      }
    } else if (pet.type === 'Cat') {
      if (isPuppyKitten) {
        recommendation = {
          title: "Kitten Development Formula",
          description: "Calorie-dense nutrition tailored for rapidly growing kittens.",
          searchQuery: "kitten food premium"
        };
      } else if (isSenior) {
        recommendation = {
          title: "Senior Cat Vitality",
          description: "Kidney support and hairball control for mature felines.",
          searchQuery: "senior cat food"
        };
      } else {
        recommendation = {
          title: "Adult Cat Maintenance",
          description: "Balanced nutrition for healthy adult cats.",
          searchQuery: "adult cat food premium"
        };
      }
    } else if (pet.type === 'Bird') {
      recommendation = {
        title: "Premium Avian Diet",
        description: "Nutrient-rich seed and pellet blend for vibrant feathers and optimal health.",
        searchQuery: "premium bird food pellets seeds"
      };
    }

    // Add breed specificity if available (mostly useful for dogs/cats/specific birds)
    if (pet.breed) {
      recommendation.searchQuery = `${pet.breed} ${recommendation.searchQuery}`;
    }

    // Default affiliate/search base URL
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(recommendation.searchQuery)}`;

    return { ...recommendation, searchUrl };
  };

  const rec = getRecommendation();

  return (
    <div className="food-rec-card glass-panel animate-fade-in">
      <div className="food-rec-header">
        <div className="food-rec-icon">
          <ShoppingBag size={24} className="text-primary" />
        </div>
        <div>
          <h3>Smart Diet Suggestion</h3>
          <p>Customized for {pet.name}'s specific needs.</p>
        </div>
      </div>
      
      <div className="food-rec-content">
        <div className="food-rec-details">
          <h4>{rec.title}</h4>
          <p>{rec.description}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <a 
            href={rec.searchUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary shop-btn shadow-hover"
          >
            <span>Find Products</span>
            <ArrowRight size={16} />
          </a>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
            *We may earn a commission from affiliate links.
          </span>
        </div>
      </div>
    </div>
  );
}

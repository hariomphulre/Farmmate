import { useEffect, useState } from "react";
import Newfarmslideshow from "./Newfarmslideshow";

// Add CSS animation for scrolling with enhanced effects
const scrollStyle = `
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-scroll {
    animation: scroll 30s linear infinite;
  }
  .animate-scroll:hover {
    animation-play-state: paused;
  }
  .news-ticker-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid rgba(34, 197, 94, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  .news-ticker-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.4);
  }
  .news-ticker-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #22c55e, #16a34a, #15803d);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .news-ticker-card:hover::before {
    opacity: 1;
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollStyle;
  document.head.appendChild(style);
}

export default function NewsFarmer({ coordinates }) {
  const [state, setState] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getStateFromCoords = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "SmartFarmDashboard/1.0" },
      });
      if (!res.ok) throw new Error("Failed to fetch state");
      const data = await res.json();
      return data.address?.state || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Mock data for development
  const mockArticles = [
    {
      title: "Revolutionary Smart Irrigation System Boosts Crop Yields by 40%",
      description: "Farmers across the region are experiencing unprecedented growth in their harvests thanks to the latest smart irrigation technology. The system uses AI-powered sensors to optimize water usage, reducing waste while maximizing crop health. Early adopters report significant improvements in both yield quality and quantity.",
      image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
      source_name: "AgriTech Today",
      source_icon: "https://via.placeholder.com/20",
      pubDate: "2024-01-15T10:30:00Z",
      link: "https://example.com/news1"
    },
    {
      title: "Climate-Smart Farming Practices Reduce Carbon Footprint",
      description: "New research shows that implementing climate-smart agricultural techniques can reduce farm carbon emissions by up to 30%. These practices include precision farming, cover cropping, and sustainable soil management. Government incentives are now available for farmers who adopt these environmentally friendly methods.",
      image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
      source_name: "Green Agriculture",
      source_icon: "https://via.placeholder.com/20",
      pubDate: "2024-01-14T14:20:00Z",
      link: "https://example.com/news2"
    },
    {
      title: "Drone Technology Revolutionizes Crop Monitoring",
      description: "Agricultural drones equipped with advanced imaging sensors are transforming how farmers monitor their fields. These unmanned aircraft can detect pest infestations, nutrient deficiencies, and irrigation issues before they become major problems. The technology is becoming more affordable and accessible to small-scale farmers.",
      image_url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop",
      source_name: "TechFarm Weekly",
      source_icon: "https://via.placeholder.com/20",
      pubDate: "2024-01-13T09:15:00Z",
      link: "https://example.com/news3"
    },
    {
      title: "Organic Farming Certification Program Expands Nationwide",
      description: "The national organic certification program has been expanded to include more crops and farming practices. This development opens new market opportunities for farmers seeking to transition to organic methods. The program provides financial assistance and technical support for the certification process.",
      image_url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop",
      source_name: "Organic Times",
      source_icon: "https://via.placeholder.com/20",
      pubDate: "2024-01-12T16:45:00Z",
      link: "https://example.com/news4"
    },
    {
      title: "Vertical Farming Solutions for Urban Agriculture",
      description: "Urban vertical farms are providing fresh produce to city dwellers while using 90% less water than traditional farming. These high-tech facilities use LED lighting and hydroponic systems to grow crops year-round. Several cities are now offering tax incentives to encourage vertical farming development.",
      image_url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop",
      source_name: "Urban Farm News",
      source_icon: "https://via.placeholder.com/20",
      pubDate: "2024-01-11T11:30:00Z",
      link: "https://example.com/news5"
    },
    {
      title: "AI-Powered Soil Analysis Predicts Optimal Planting Times",
      description: "New artificial intelligence algorithms can analyze soil conditions and weather patterns to recommend the best planting times for different crops. This technology helps farmers maximize their growing seasons and avoid weather-related crop losses. The system is being tested on farms across multiple climate zones.",
      image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
      source_name: "Future Farming",
      source_icon: "https://via.placeholder.com/20",
      pubDate: "2024-01-10T13:20:00Z",
      link: "https://example.com/news6"
    }
  ];

  useEffect(() => {
    const fetchNewsForCoordinates = async () => {
      // MOCK DATA VERSION - COMMENT OUT WHEN READY FOR REAL API
      setLoading(true);
      setError("");

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock state
        setState(coordinates ? "Maharashtra" : null);
        
        // Use mock data
        setArticles(mockArticles);
      } catch (e) {
        console.error("Failed to load news", e);
        setError(e?.message || "Failed to load news");
        setArticles([]);
      } finally {
        setLoading(false);
      }

      /* ORIGINAL API VERSION - UNCOMMENT WHEN READY FOR REAL API
      if (!coordinates || coordinates.lat == null || coordinates.lng == null) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const detectedState = await getStateFromCoords(
          coordinates.lat,
          coordinates.lng
        );
        setState(detectedState);

        if (!detectedState) {
          setArticles([]);
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/agri-news?state=${encodeURIComponent(
            detectedState
          )}&type=agriculture`
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `News API responded ${res.status}: ${text.slice(0, 120)}`
          );
        }

        const data = await res.json();
        setArticles(Array.isArray(data.results?.results) ? data.results.results : []);
      } catch (e) {
        console.error("Failed to load news", e);
        setError(e?.message || "Failed to load news");
        setArticles([]);
      } finally {
        setLoading(false);
      }
      */
    };

    fetchNewsForCoordinates();
  }, [coordinates]);

  return (
    <div>
      <Newfarmslideshow
        articles={articles}
        loading={loading}
        error={error}
        state={state}
      />
    </div>
  );
}
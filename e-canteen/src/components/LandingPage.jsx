import React, { useState, useEffect } from 'react'; 
import { 
  ArrowRight, 
  Star, 
  Clock, 
  Shield, 
  Truck, 
  Menu, 
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  ChevronRight,
  CheckCircle,
  Users,
  Heart,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';

const LandingPage = ({ onShowLogin, onShowRegister }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch popular dishes from backend
  useEffect(() => {
    const fetchPopularDishes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use absolute URL to avoid path issues
        const apiUrl = process.env.NODE_ENV === 'production' 
          ? '/api/food-items?limit=4'
          : 'http://localhost:5000/api/food-items?limit=4';
        
        // console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // console.log('Response status:', response.status);
        // console.log('Response ok:', response.ok);
        
        // Check if response is HTML (error page)
        const contentType = response.headers.get('content-type');
        // console.log('Content-Type:', contentType);
        
        if (!response.ok) {
          // Try to read as text first to see what we're getting
          const errorText = await response.text();
          console.error('Error response:', errorText);
          
          // Check if it's HTML
          if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
            throw new Error('Server returned HTML page instead of JSON. Check if API endpoint exists.');
          }
          
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 100)}`);
        }
        
        // Check if response is JSON
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.warn('Expected JSON but got:', text.substring(0, 200));
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        // console.log('API response data:', data);
        
        if (data.data && data.data.length > 0) {
          // Transform API data to match component structure
          const transformedDishes = data.data.map((dish, index) => ({
            name: dish.name,
            price: `₹${dish.price}`,
            image: dish.image || getFallbackImage(dish.category, index),
            category: dish.category,
            badge: getBadge(index),
            description: dish.description,
            rating: 5
          }));
          
          setPopularDishes(transformedDishes);
        } else {
          // console.log('No data found, using fallback dishes');
          setPopularDishes(getFallbackDishes());
        }
      } catch (err) {
        console.error('Error fetching dishes:', err);
        setError(err.message);
        setPopularDishes(getFallbackDishes());
      } finally {
        setLoading(false);
      }
    };

    fetchPopularDishes();
  }, []);

  // Helper function to get fallback images based on category
  const getFallbackImage = (category, index) => {
    const fallbackImages = {
      'Main Course': [
        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1563379091339-03246963d96f?w=300&h=200&fit=crop'
      ],
      'Appetizer': [
        'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop'
      ],
      'Dessert': [
        'https://images.unsplash.com/photo-1563245372-f5a8a0b22e63?w=300&h=200&fit=crop'
      ],
      'Snacks': [
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop'
      ],
      'Beverages': [
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop'
      ],
      'South Indian': [
        'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=200&fit=crop'
      ],
      'Fast Food': [
        'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop'
      ]
    };

    const categoryImages = fallbackImages[category] || fallbackImages['Main Course'];
    return categoryImages[index % categoryImages.length];
  };

  // Helper function to assign badges
  const getBadge = (index) => {
    const badges = ['Bestseller', 'Chef\'s Pick', 'Hot Deal', 'New'];
    return badges[index % badges.length];
  };

  // Fallback dishes in case API fails
  const getFallbackDishes = () => [
    {
      name: "Vada Pav",
      price: "₹25",
      image: "https://www.cookwithmanali.com/wp-content/uploads/2018/04/Vada-Pav-500x500.jpg",
      category: "Snacks",
      badge: "Bestseller",
      description: "Spicy potato fritter in a bun with chutneys - Mumbai's favorite street food"
    },
    {
      name: "Samosa",
      price: "₹20",
      image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2021/12/samosa-recipe.jpg",
      category: "Snacks",
      badge: "Chef's Pick",
      description: "Crispy golden pastry filled with spiced potatoes and peas, served with chutneys"
    },
    {
      name: "Margherita Pizza",
      price: "₹299",
      image: "https://media-assets.swiggy.com/swiggy/image/upload/f_auto,q_auto,fl_lossy/RX_THUMBNAIL/IMAGES/VENDOR/2024/6/26/ebdf270d-8e2b-43de-ae89-03bdfd6ece46_222542.JPG",
      category: "Main Course",
      badge: "Hot Deal",
      description: "Classic cheese pizza with fresh tomato sauce and mozzarella cheese"
    },
    {
      name: "Chicken Biryani",
      price: "₹180",
      image: "https://www.cubesnjuliennes.com/wp-content/uploads/2020/01/Chicken-Biryani.jpg",
      category: "Main Course",
      badge: "New",
      description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices"
    }
  ];

  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "No Queue",
      description: "Skip the canteen lines - order directly to your hostel",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Campus Wide",
      description: "Delivery across all hostels, labs, and campus locations",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Quick Delivery",
      description: "Get your food delivered to your room in minutes",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Student Friendly",
      description: "Affordable prices and special student discounts",
      color: "from-orange-500 to-red-500"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Akshata Bhat",
      role: "Food Enthusiast",
      content: "The best food delivery experience I've ever had! The biryani was absolutely delicious and arrived piping hot.",
      rating: 5,
      image: "https://vit.edu.in/wp-content/uploads/2023/06/DrAkshataBhat-12-1.jpg"
    },
    {
      name: "Dr. Sangeeta Joshi",
      role: "Frequent Diner",
      content: "Fast delivery and amazing taste. This is my go-to app for ordering food now! Customer service is top-notch.",
      rating: 5,
      image: "https://vit.edu.in/wp-content/uploads/2023/06/Principal1.png"
    },
    {
      name: "Dr. Arun Chavan",
      role: "Food Blogger",
      content: "Authentic flavors and consistent quality. Highly recommended! The variety is incredible and presentation is beautiful.",
      rating: 5,
      image: "https://vit.edu.in/wp-content/uploads/2023/06/Frame-3.png"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Loading skeleton component
  const DishSkeleton = () => (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
      <div className="w-full h-56 bg-gray-300"></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
        </div>
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
        <div className="h-12 bg-gray-300 rounded-xl"></div>
      </div>
    </div>
  );

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Retry after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-2xl">F</span>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                FoodExpress
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {['Home', 'Features', 'Menu', 'Reviews', 'Contact'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="text-gray-700 hover:text-red-500 transition-all duration-300 font-medium relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={onShowLogin}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2"
              >
                Order Now <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={onShowRegister}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300 font-semibold"
              >
                View Menu
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-6 border-t border-gray-200 bg-white/95 backdrop-blur-md rounded-b-2xl">
              <div className="flex flex-col space-y-4">
                {['Home', 'Features', 'Menu', 'Reviews', 'Contact'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase()}`} 
                    className="text-gray-700 hover:text-red-500 transition-colors py-2 px-4 hover:bg-red-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="flex flex-col space-y-3 pt-4">
                  <button 
                    onClick={onShowLogin}
                    className="py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                  >
                    Order Now
                  </button>
                  <button 
                    onClick={onShowRegister}
                    className="py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-500 transition-all font-semibold"
                  >
                    View Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-red-600">#1 Campus Food Delivery</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
                Skip The Queue,
                <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                  Order to Your Room
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                No more waiting in canteen lines! Get hot, delicious meals delivered 
                straight to your hostel room, lab, or anywhere on campus.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <button 
                  onClick={onShowLogin}
                  className="group px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 hover:scale-105"
                >
                  Order Now 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onShowRegister}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300 font-semibold"
                >
                  View Menu
                </button>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: '1000+', label: 'Students Ordering', icon: Users },
                  { value: '5', label: 'Campus Canteens', icon: Award },
                  { value: '10min', label: 'Avg. Delivery', icon: TrendingUp }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center group cursor-pointer">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                      <stat.icon className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10 group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <img 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=600&fit=crop" 
                  alt="Delicious Food"
                  className="relative rounded-3xl shadow-2xl group-hover:scale-105 transition-all duration-500"
                />
              </div>
              
              {/* Enhanced Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white p-5 rounded-2xl shadow-2xl z-20 hover:scale-110 transition-all duration-300 cursor-pointer border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">No Queue</div>
                    <div className="text-sm text-gray-600">Direct to You</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white p-5 rounded-2xl shadow-2xl z-20 hover:scale-110 transition-all duration-300 cursor-pointer border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Truck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Campus Wide</div>
                    <div className="text-sm text-gray-600">All locations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-red-100 rounded-full px-4 py-2 mb-4">
              <Star className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-sm font-semibold text-red-600">Campus Benefits</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Built for Campus Life
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Say goodbye to long canteen queues and enjoy hot meals delivered to your hostel room or study spot.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent hover:-translate-y-2 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mb-6`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-orange-500 group-hover:bg-clip-text transition-all">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Dishes Section */}
      <section id="menu" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-sm font-semibold text-orange-600">Customer Favorites</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Popular Dishes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most loved dishes that keep our customers coming back for more.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <DishSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4 text-lg font-semibold">
                Failed to load dishes
              </div>
              <div className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                {error.includes('HTML page') ? (
                  <div>
                    <p className="mb-2">API endpoint not available. This could be because:</p>
                    <ul className="text-left list-disc list-inside space-y-1">
                      <li>Backend server is not running</li>
                      <li>API route doesn't exist</li>
                      <li>CORS issues</li>
                    </ul>
                    <p className="mt-3">Using demo data for now.</p>
                  </div>
                ) : (
                  error
                )}
              </div>
              <button 
                onClick={handleRetry}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {popularDishes.map((dish, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2"
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={dish.image} 
                        alt={dish.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        {dish.category}
                      </div>
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {dish.badge}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-500 transition-colors">
                          {dish.name}
                        </h3>
                        <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                          {dish.price}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm text-gray-600 ml-2 font-medium">(48)</span>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 py-3 rounded-xl hover:from-red-500 hover:to-orange-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 font-semibold group/btn shadow-sm hover:shadow-lg">
                        Add to Cart 
                        <Heart className="w-4 h-4 group-hover/btn:fill-white transition-all" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-16">
                <button 
                  onClick={onShowRegister}
                  className="px-10 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 mx-auto font-semibold hover:scale-105"
                >
                  View Full Menu <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-purple-600">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 rounded-3xl p-8 md:p-12 relative shadow-2xl border border-red-100">
              <div className="absolute top-8 left-8 text-red-200 opacity-50">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                </svg>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-lg opacity-50"></div>
                  <img 
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    className="relative w-28 h-28 rounded-full object-cover border-4 border-white shadow-2xl"
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex gap-1 mb-4 justify-center md:justify-start">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-xl text-gray-700 mb-6 italic leading-relaxed font-medium">
                    "{testimonials[activeTestimonial].content}"
                  </p>
                  
                  <div>
                    <div className="font-bold text-gray-900 text-xl mb-1">
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className="text-red-500 font-medium">
                      {testimonials[activeTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Navigation */}
              <div className="flex justify-center mt-10 gap-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === activeTestimonial 
                        ? 'w-10 h-3 bg-gradient-to-r from-red-500 to-orange-500' 
                        : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Limited Time Offer</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to Taste the Difference?
          </h2>
          
          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Download our app now and get <span className="font-bold text-white text-2xl">₹100 off</span> on your first order! Join thousands of happy customers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-white text-red-500 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-2xl font-bold text-lg">
              Download App
            </button>
            <button className="px-10 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-red-500 transition-all duration-300 font-bold text-lg">
              Order Online
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6 group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-2xl">F</span>
                </div>
                <span className="ml-3 text-2xl font-bold">FoodExpress</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Delivering delicious food with love and care. Experience the best of Indian cuisine with our fast and reliable delivery service.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/in/kartikean-budarap-29722b2b1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-red-500 hover:to-orange-500 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-  gray-800 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-red-500 hover:to-orange-500 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-red-500 hover:to-orange-500 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/kartikbudarap/Mini_Project_Sem5.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-red-500 hover:to-orange-500 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>

            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Quick Links</h3>
              <ul className="space-y-3">
                {['Home', 'Menu', 'Features', 'Reviews', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-red-500 group-hover:to-orange-500 transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+91 9876543210</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-red-500 group-hover:to-orange-500 transition-all">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>hello@foodexpress.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-red-500 group-hover:to-orange-500 transition-all">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>Mumbai, Maharashtra</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 FoodExpress. All rights reserved. Made with 
              <Heart className="inline w-4 h-4 mx-1 fill-red-500 text-red-500" /> 
              for food lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
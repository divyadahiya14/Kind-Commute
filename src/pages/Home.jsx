import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Car, Users, Shield, Clock, MapPin, ArrowRight, Star } from 'lucide-react';

const Home = () => {
  const [searchData, setSearchData] = useState({
    departure: '',
    destination: '',
    date: ''
  });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.departure) params.append('departure', searchData.departure);
    if (searchData.destination) params.append('destination', searchData.destination);
    if (searchData.date) params.append('date', searchData.date);
    
    navigate(`/search?${params.toString()}`);
  };

  const features = [
    {
      icon: <Car className="h-12 w-12 text-blue-600" />,
      title: "Easy Ride Sharing",
      description: "Post your ride or find one that matches your route in just a few clicks."
    },
    {
      icon: <Users className="h-12 w-12 text-green-600" />,
      title: "Trusted Community",
      description: "Connect with verified drivers and passengers through our rating system."
    },
    {
      icon: <Shield className="h-12 w-12 text-purple-600" />,
      title: "Safe & Secure",
      description: "All users are verified, and we provide secure payment processing."
    },
    {
      icon: <Clock className="h-12 w-12 text-orange-600" />,
      title: "Save Time & Money",
      description: "Split travel costs and reduce your carbon footprint while making new connections."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular Commuter",
      rating: 5,
      comment: "KindCommute has made my daily commute so much more affordable and enjoyable. I've met amazing people!"
    },
    {
      name: "Mike Chen",
      role: "Weekend Traveler",
      rating: 5,
      comment: "Perfect for weekend trips! The drivers are friendly and the booking process is super simple."
    },
    {
      name: "Emily Davis",
      role: "Student",
      rating: 5,
      comment: "As a student, this app has saved me hundreds of dollars on transportation. Highly recommend!"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-700 to-blue-600 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Share Rides,
              <br />
              <span className="text-blue-200">Share Kindness</span>
            </h1>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto mt-8 mb-12">
              Connect with fellow travelers and make your commute more affordable, sustainable, and social. Join thousands of riders across the city.
            </p>

            {/* Search Form */}
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
              <form onSubmit={handleSearch} className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="From where?"
                    value={searchData.departure}
                    onChange={(e) => setSearchData({ ...searchData, departure: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-lg"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="To where?"
                    value={searchData.destination}
                    onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-lg"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="dd-mm-yyyy"
                    onFocus={e => e.target.type = 'date'}
                    onBlur={e => e.target.type = 'text'}
                    value={searchData.date}
                    onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-lg"
                  />
                  <span className="absolute right-3 top-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5m-1.5 3.75v6a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-6m13.5 0V7.5a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 003.75 7.5v3.75" />
                    </svg>
                  </span>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Search className="h-6 w-6" />
                  <span>Search Rides</span>
                </button>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 transition-colors shadow-md"
              >
                <Search className="h-6 w-6" />
                <span>Find a Ride</span>
                <ArrowRight className="h-6 w-6" />
              </Link>
              <Link
                to="/register"
                className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-12 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 transition-colors shadow-md"
              >
                <Car className="h-6 w-6" />
                <span>Offer a Ride</span>
                <ArrowRight className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose KindCommute?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make carpooling simple, safe, and social. Join our community of travelers 
              who care about saving money and the environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-blue-700 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-2xl text-blue-100">Getting started is simple and takes just minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Sign Up</h3>
              <p className="text-lg text-blue-100">Create your profile and choose whether you want to drive, ride, or both.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Search & Book</h3>
              <p className="text-lg text-blue-100">Find available rides or post your own trip with flexible timing and pricing.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Meet & Ride</h3>
              <p className="text-lg text-blue-100">Connect with your ride partners and enjoy a comfortable, social journey.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Rate & Review</h3>
              <p className="text-lg text-blue-100">Share your experience and help build a trusted community for everyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of travelers who have already discovered the benefits of carpooling with KindCommute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-medium transition-colors"
            >
              Get Started Today
            </Link>
            <Link
              to="/search"
              className="bg-transparent hover:bg-blue-500 text-white border-2 border-white px-8 py-4 rounded-lg font-medium transition-colors"
            >
              Browse Rides
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
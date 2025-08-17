import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Briefcase } from 'lucide-react';
import JobCard from '../components/Jobs/JobCard';
import { Job } from '../types';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock job data - replace with real API integration
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Senior Data Scientist',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120,000 - $160,000',
      description: 'We are seeking a Senior Data Scientist to join our AI/ML team. You will work on cutting-edge machine learning projects, develop predictive models, and drive data-driven decision making across the organization.',
      url: '#',
      posted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      matchScore: 92,
    },
    {
      id: '2',
      title: 'Machine Learning Engineer',
      company: 'AI Innovations',
      location: 'Remote',
      salary: '$100,000 - $140,000',
      description: 'Join our ML engineering team to build and deploy scalable machine learning systems. Experience with Python, TensorFlow, and cloud platforms required.',
      url: '#',
      posted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      matchScore: 88,
    },
    {
      id: '3',
      title: 'Data Analyst',
      company: 'DataDriven Solutions',
      location: 'New York, NY',
      salary: '$70,000 - $90,000',
      description: 'Looking for a detail-oriented Data Analyst to analyze business metrics, create reports, and provide insights to stakeholders. Strong SQL and Python skills preferred.',
      url: '#',
      posted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      matchScore: 75,
    },
    {
      id: '4',
      title: 'Junior Data Scientist',
      company: 'StartupTech',
      location: 'Austin, TX',
      salary: '$80,000 - $100,000',
      description: 'Perfect opportunity for a junior data scientist to grow their career. Work with modern data stack, build ML models, and learn from experienced mentors.',
      url: '#',
      posted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      matchScore: 82,
    },
    {
      id: '5',
      title: 'Business Intelligence Developer',
      company: 'Enterprise Corp',
      location: 'Chicago, IL',
      salary: '$90,000 - $120,000',
      description: 'Develop and maintain BI solutions, create dashboards, and work with stakeholders to understand reporting requirements. Experience with Tableau or Power BI required.',
      url: '#',
      posted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      matchScore: 68,
    },
  ];

  useEffect(() => {
    // Simulate API loading
    const loadJobs = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJobs(mockJobs);
      setIsLoading(false);
    };

    loadJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = location === '' || 
                           job.location.toLowerCase().includes(location.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Personalized job opportunities based on your skills and career goals
          </p>
        </div>

        {/* Search Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search jobs or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-gray-600">
            <Briefcase className="w-5 h-5 mr-2" />
            <span>{filteredJobs.length} jobs found</span>
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>Sort by Match Score</option>
            <option>Sort by Date Posted</option>
            <option>Sort by Salary</option>
          </select>
        </div>

        {/* Job Listings */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {!isLoading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
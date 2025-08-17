import React, { useState } from 'react';
import { TrendingUp, Target, BookOpen, Users } from 'lucide-react';
import SkillGapChart from '../components/Dashboard/SkillGapChart';
import StreakTracker from '../components/Dashboard/StreakTracker';
import RoadmapTimeline from '../components/Dashboard/RoadmapTimeline';
import { SkillGap, RoadmapItem } from '../types';
import { subDays } from 'date-fns';

const Dashboard: React.FC = () => {
  // Mock data - replace with real API calls
  const [skillGaps] = useState<SkillGap[]>([
    { skill: 'Python', current: 75, required: 90, gap: 15 },
    { skill: 'Machine Learning', current: 40, required: 85, gap: 45 },
    { skill: 'SQL', current: 80, required: 85, gap: 5 },
    { skill: 'Statistics', current: 50, required: 80, gap: 30 },
    { skill: 'Data Visualization', current: 65, required: 75, gap: 10 },
  ]);

  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([
    {
      id: '1',
      title: 'Complete Python for Data Science Course',
      description: 'Master advanced Python concepts including pandas, numpy, and scikit-learn',
      type: 'skill',
      duration: '4 weeks',
      completed: true,
      priority: 'high',
    },
    {
      id: '2',
      title: 'Build a Machine Learning Portfolio Project',
      description: 'Create an end-to-end ML project with data preprocessing, model training, and deployment',
      type: 'project',
      duration: '6 weeks',
      completed: false,
      priority: 'high',
    },
    {
      id: '3',
      title: 'Get AWS Machine Learning Specialty Certification',
      description: 'Earn industry-recognized certification in cloud-based ML services',
      type: 'certification',
      duration: '8 weeks',
      completed: false,
      priority: 'medium',
    },
  ]);

  const stats = [
    {
      title: 'Skills Learned',
      value: '12',
      change: '+2 this week',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Career Progress',
      value: '68%',
      change: '+5% this month',
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Goals Achieved',
      value: '4/7',
      change: '1 completed',
      icon: Target,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Network Connections',
      value: '23',
      change: '+3 this week',
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  const completedDays = [
    subDays(new Date(), 1),
    subDays(new Date(), 2),
    subDays(new Date(), 4),
    subDays(new Date(), 6),
  ];

  const handleToggleRoadmapItem = (id: string) => {
    setRoadmapItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Career Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your progress and stay on top of your career goals</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <SkillGapChart data={skillGaps} />
            <RoadmapTimeline 
              items={roadmapItems} 
              onToggleComplete={handleToggleRoadmapItem} 
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <StreakTracker
              currentStreak={7}
              longestStreak={14}
              completedDays={completedDays}
            />
            
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="font-medium text-blue-900">Update Skills</div>
                  <div className="text-sm text-blue-700">Add new skills you've learned</div>
                </button>
                <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="font-medium text-green-900">Find Jobs</div>
                  <div className="text-sm text-green-700">Browse matched opportunities</div>
                </button>
                <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="font-medium text-purple-900">Chat with AI</div>
                  <div className="text-sm text-purple-700">Get career guidance</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
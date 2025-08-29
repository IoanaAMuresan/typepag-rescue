import { useState, useEffect } from 'react';
import RescueDashboard from '../components/RescueDashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 TypePad Rescue System
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Comprehensive TypePad Blog Discovery & Migration Tool
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-red-800 font-medium">
              ⏰ TypePad shuts down September 30, 2024
            </p>
            <p className="text-red-700 text-sm">
              Help bloggers save their content before it's lost forever
            </p>
          </div>
        </div>
        
        <RescueDashboard />
      </div>
    </div>
  );
}

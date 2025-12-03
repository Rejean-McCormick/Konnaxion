// frontend/app/teambuilder/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { teambuilderService } from '@/services/teambuilder';
import { ITeambuilderUser, IAlgorithmConfig, ICreateSessionRequest } from '@/services/teambuilder/types';
import { CandidateSelector } from '@/components/teambuilder/CandidateSelector';
import { AlgorithmConfig } from '@/components/teambuilder/AlgorithmConfig';
import { api } from '@/services/apiClient'; // Using the central API client directly for user fetching if not in a specific service

export default function CreateSessionPage() {
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Data
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [availableCandidates, setAvailableCandidates] = useState<ITeambuilderUser[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);
  
  const [algorithmConfig, setAlgorithmConfig] = useState<IAlgorithmConfig>({
    target_team_size: 4,
    strategy: 'balanced_expertise',
    diversity_weight: 0.5,
  });

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Fetch all potential candidates (users) from the system
    // In a real app, this might be paginated or filtered by organization
    const fetchUsers = async () => {
      try {
        // Assuming you have a generic user list endpoint, or re-using a service
        // For now, we'll assume a direct call or a helper in teambuilderService if implemented
        // If not implemented in service, we use api client directly:
        const response = await api.get<ITeambuilderUser[]>('/users/'); 
        // Note: Ensure your backend /api/users/ endpoint returns list of users compatible with ITeambuilderUser
        setAvailableCandidates(response.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setError("Could not load candidate list.");
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      setError('Session name is required.');
      return;
    }
    if (selectedCandidateIds.length < 2) {
      setError('Please select at least 2 candidates.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: ICreateSessionRequest = {
        name: sessionName,
        description: sessionDescription,
        candidate_ids: selectedCandidateIds,
        algorithm_config: algorithmConfig,
      };

      const session = await teambuilderService.createSession(payload);
      
      // Redirect to the session detail page (where generation happens)
      router.push(`/teambuilder/${session.id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create session. Please try again.');
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render Steps
  // ---------------------------------------------------------------------------
  
  // Step 1: Basic Info
  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Session Name <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            required
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
            placeholder="e.g. Q3 Hackathon Teams"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={3}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
            placeholder="Optional context about this team formation..."
            value={sessionDescription}
            onChange={(e) => setSessionDescription(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Candidate Selection
  const renderStep2 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <p className="text-sm text-gray-500">
        Select the pool of users you want to organize into teams.
      </p>
      
      {usersLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <CandidateSelector
          candidates={availableCandidates}
          selectedIds={selectedCandidateIds}
          onChange={setSelectedCandidateIds}
        />
      )}
      
      <div className="text-right text-sm text-gray-500">
        {selectedCandidateIds.length} candidates selected
      </div>
    </div>
  );

  // Step 3: Algorithm Config
  const renderStep3 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <p className="text-sm text-gray-500">
        Configure how the engine should distribute the selected candidates.
      </p>
      
      <AlgorithmConfig
        config={algorithmConfig}
        onChange={setAlgorithmConfig}
      />
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-700 mt-4">
        <p>
          <strong>Summary:</strong> Creating teams of ~{algorithmConfig.target_team_size} people 
          using the <strong>{algorithmConfig.strategy === 'random' ? 'Random' : 'Balanced Expertise'}</strong> strategy.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/teambuilder" className="text-gray-500 hover:text-gray-700 text-sm">
              Sessions
            </Link>
          </li>
          <li>
            <span className="text-gray-400 text-sm">/</span>
          </li>
          <li>
            <span className="text-gray-900 font-medium text-sm">New Session</span>
          </li>
        </ol>
      </nav>

      <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
        {/* Header / Stepper */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Create Team Session</h2>
          
          {/* Progress Bar */}
          <div className="mt-4 flex items-center justify-between text-sm font-medium text-gray-500 relative">
             <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
             
             {[1, 2, 3].map((s) => (
               <div key={s} className={`flex flex-col items-center bg-gray-50 px-2 ${step >= s ? 'text-indigo-600' : ''}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors duration-300 ${
                    step >= s ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-gray-300 text-gray-400'
                 }`}>
                   {s}
                 </div>
                 <span>{s === 1 ? 'Basics' : s === 2 ? 'Candidates' : 'Logic'}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer / Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3)}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
          ) : (
            <Link href="/teambuilder">
              <button className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </button>
            </Link>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => Math.min(3, s + 1) as 1 | 2 | 3)}
              disabled={step === 1 && !sessionName.trim()}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: {step === 1 ? 'Select Candidates' : 'Configure Algorithm'}
            </button>
          ) : (
            <button
              onClick={handleCreateSession}
              disabled={loading}
              className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Create & View Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
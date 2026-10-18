'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LogEditor } from '@/components/LogEditor';
import { AnalysisView } from '@/components/AnalysisView';
import { HistoryView } from '@/components/HistoryView';
import { SampleLibraryView } from '@/components/SampleLibraryView';
import { ModelSetupView } from '@/components/ModelSetupView';
import { PricingView } from '@/components/PricingView';
import { FeedbackView } from '@/components/FeedbackView';
import { AboutView } from '@/components/AboutView';

import { Technology, AnalysisResult, ModelStatus, SampleError } from '@/types';
import { fetchModelStatus, analyzeLog, fetchSamples, checkBackendHealth } from '@/lib/api';
import { getHistory, saveAnalysis, deleteAnalysis, clearHistory } from '@/lib/storage';
import { SAMPLE_ERRORS } from '@/lib/samples';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');
  const [log, setLog] = useState<string>('');
  const [technology, setTechnology] = useState<Technology>('auto');
  const [redactSecrets, setRedactSecrets] = useState<boolean>(true);
  const [forceDemoMode, setForceDemoMode] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<string>('llama3.2:3b');
  const [ollamaUrl, setOllamaUrl] = useState<string>('http://localhost:11434');

  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isCheckingModel, setIsCheckingModel] = useState<boolean>(false);
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    available: false,
    is_local: true,
    ollama_url: 'http://localhost:11434',
    configured_model: 'llama3.2:3b',
    installed_models: [],
    recommended_models: []
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [samples, setSamples] = useState<SampleError[]>(SAMPLE_ERRORS);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Check health & model status
  const checkStatus = useCallback(async () => {
    setIsCheckingModel(true);
    try {
      const isHealthy = await checkBackendHealth();
      setBackendOnline(isHealthy);

      const status = await fetchModelStatus(ollamaUrl);
      setModelStatus(status);
      if (status.configured_model) {
        setActiveModel(status.configured_model);
      }
    } catch (err) {
      console.warn('Backend/Ollama healthcheck notice:', err);
    } finally {
      setIsCheckingModel(false);
    }
  }, [ollamaUrl]);

  // Initial mount
  useEffect(() => {
    checkStatus();
    setHistory(getHistory());
    fetchSamples().then((s) => {
      if (s && s.length > 0) setSamples(s);
    });
  }, [checkStatus]);

  // Execute Analysis
  const handleAnalyze = async () => {
    if (!log.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await analyzeLog({
        log,
        technology,
        redact_secrets: redactSecrets,
        force_demo_mode: forceDemoMode,
        model_name: activeModel,
        ollama_url: ollamaUrl
      });

      setAnalysisResult(result);
      // Automatically save to local history
      saveAnalysis(result);
      setHistory(getHistory());
      setSavedIds(prev => new Set(prev).add(result.id));
      setActiveTab('analyzer');
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample into editor
  const handleLoadSample = (sample: SampleError) => {
    setLog(sample.log);
    setTechnology(sample.technology);
    setActiveTab('analyzer');
    // Pre-populate analysis if available for instant demo
    if (sample.deterministic_analysis) {
      const demoResult: AnalysisResult = {
        id: `demo_${sample.id}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        detected_technology: sample.technology,
        detected_category: sample.category,
        severity: sample.severity,
        confidence: (sample.deterministic_analysis.confidence as any) || 'high',
        confidence_score: sample.deterministic_analysis.confidence_score || 0.98,
        summary: sample.deterministic_analysis.summary || '',
        likely_root_cause: sample.deterministic_analysis.likely_root_cause || '',
        evidence: sample.deterministic_analysis.evidence || [],
        safe_diagnostic_commands: (sample.deterministic_analysis.safe_diagnostic_commands as any) || [],
        suggested_remediation: sample.deterministic_analysis.suggested_remediation || [],
        rollback_precautions: (sample.deterministic_analysis.rollback_precautions as any) || [],
        insufficient_logs: false,
        missing_information_request: null,
        redacted_items_count: 0,
        inference_source: 'deterministic_demo',
        model_used: 'sample-deterministic-demo',
        execution_time_ms: 12
      };
      setAnalysisResult(demoResult);
    }
  };

  // History operations
  const handleSelectFromHistory = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setLog(result.evidence.join('\n') || `[Loaded from history: ${result.id}]`);
    setTechnology((result.detected_technology as Technology) || 'auto');
    setActiveTab('analyzer');
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteAnalysis(id);
    setHistory(updated);
    setSavedIds(prev => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setSavedIds(new Set());
  };

  const handleSaveToHistory = (res: AnalysisResult) => {
    saveAnalysis(res);
    setHistory(getHistory());
    setSavedIds(prev => new Set(prev).add(res.id));
  };

  const handleResetEditor = () => {
    setLog('');
    setAnalysisResult(null);
  };

  // Active inference source
  const currentInferenceSource: 'local_ollama' | 'remote_ollama' | 'deterministic_demo' =
    forceDemoMode || !modelStatus.available
      ? 'deterministic_demo'
      : modelStatus.is_local
      ? 'local_ollama'
      : 'remote_ollama';

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        backendOnline={backendOnline}
        ollamaOnline={modelStatus.available}
        activeModel={activeModel}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950">
        {/* Header */}
        <Header
          inferenceSource={currentInferenceSource}
          ollamaOnline={modelStatus.available}
          activeModel={activeModel}
          forceDemoMode={forceDemoMode}
          setForceDemoMode={setForceDemoMode}
          setActiveTab={setActiveTab}
          onResetEditor={handleResetEditor}
        />

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'analyzer' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Log Input Editor */}
              <LogEditor
                log={log}
                setLog={setLog}
                technology={technology}
                setTechnology={setTechnology}
                redactSecrets={redactSecrets}
                setRedactSecrets={setRedactSecrets}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                samples={samples}
                onLoadSample={handleLoadSample}
              />

              {/* Analysis Results */}
              {analysisResult && (
                <div className="pt-2">
                  <AnalysisView
                    result={analysisResult}
                    onSaveToHistory={handleSaveToHistory}
                    isSaved={savedIds.has(analysisResult.id)}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryView
              history={history}
              onSelectAnalysis={handleSelectFromHistory}
              onDeleteAnalysis={handleDeleteHistoryItem}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === 'samples' && (
            <SampleLibraryView
              samples={samples}
              onSelectSample={handleLoadSample}
            />
          )}

          {activeTab === 'models' && (
            <ModelSetupView
              modelStatus={modelStatus}
              ollamaUrl={ollamaUrl}
              setOllamaUrl={setOllamaUrl}
              selectedModel={activeModel}
              setSelectedModel={setActiveModel}
              onRefreshStatus={checkStatus}
              isChecking={isCheckingModel}
            />
          )}

          {activeTab === 'pricing' && <PricingView />}

          {activeTab === 'feedback' && <FeedbackView currentLogSnippet={log} />}

          {activeTab === 'about' && <AboutView />}
        </main>
      </div>
    </div>
  );
}

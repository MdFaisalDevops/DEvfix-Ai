import { AnalysisResult } from '@/types';

const STORAGE_KEY = 'devfix_analysis_history';
const MAX_HISTORY_ITEMS = 50;

export function getHistory(): AnalysisResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load DevFix analysis history:', err);
    return [];
  }
}

export function saveAnalysis(analysis: AnalysisResult): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getHistory();
    // Prepend new analysis, filter duplicates by id
    const filtered = current.filter(item => item.id !== analysis.id);
    const updated = [analysis, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save analysis to history:', err);
  }
}

export function deleteAnalysis(id: string): AnalysisResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete analysis:', err);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export function exportHistoryJson(): void {
  if (typeof window === 'undefined') return;
  const data = getHistory();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `devfix-analysis-history-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

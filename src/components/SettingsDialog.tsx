import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
export function SettingsDialog() {
  const isSettingsOpen = useAppStore(state => state.isSettingsOpen);
  const toggleSettings = useAppStore(state => state.toggleSettings);
  const ollamaApiUrl = useAppStore(state => state.ollamaApiUrl);
  const setOllamaApiUrl = useAppStore(state => state.setOllamaApiUrl);
  const connectToOllama = useAppStore(state => state.connectToOllama);
  const connectionState = useAppStore(state => state.connectionState);
  const [localApiUrl, setLocalApiUrl] = useState(ollamaApiUrl);
  useEffect(() => {
    setLocalApiUrl(ollamaApiUrl);
  }, [ollamaApiUrl]);
  const handleSave = () => {
    setOllamaApiUrl(localApiUrl);
    connectToOllama().then(() => {
      if (useAppStore.getState().connectionState === 'connected') {
        toggleSettings(false);
      }
    });
  };
  const handleTestConnection = () => {
    setOllamaApiUrl(localApiUrl);
    connectToOllama();
  };
  const ConnectionStatus = () => {
    switch (connectionState) {
      case 'connecting':
        return <div className="flex items-center space-x-2 text-sm"><Loader className="animate-spin h-4 w-4" /><span>Connecting...</span></div>;
      case 'connected':
        return <div className="flex items-center space-x-2 text-sm text-green-600"><CheckCircle className="h-4 w-4" /><span>Connected</span></div>;
      case 'error':
        return <div className="flex items-center space-x-2 text-sm text-red-600"><XCircle className="h-4 w-4" /><span>Connection Failed</span></div>;
      default:
        return <div className="text-sm text-gray-500">Enter your Ollama URL to connect.</div>;
    }
  };
  return (
    <Dialog open={isSettingsOpen} onOpenChange={toggleSettings}>
      <DialogContent className="font-mono bg-white border-2 border-black shadow-brutal rounded-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
          <DialogDescription>
            Configure your local Ollama API endpoint.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ollama-url" className="font-bold">Ollama API URL</Label>
            <Input
              id="ollama-url"
              value={localApiUrl}
              onChange={(e) => setLocalApiUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="border-2 border-black rounded-none focus:ring-brutal-yellow focus:ring-offset-0 focus:ring-2"
            />
          </div>
          <div className="h-6">
            <ConnectionStatus />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            onClick={handleTestConnection}
            className="bg-white border-2 border-black rounded-none shadow-brutal hover:shadow-brutal-hover active:translate-x-1 active:translate-y-1 hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            Test Connection
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-brutal-yellow text-black border-2 border-black rounded-none shadow-brutal hover:shadow-brutal-hover active:translate-x-1 active:translate-y-1 hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            Save & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Settings, Plus, Trash2, Edit, User, Send, Loader, Power, PowerOff, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SettingsDialog } from '@/components/SettingsDialog';
import { CharacterSheet } from '@/components/CharacterSheet';
import { Toaster, toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
function BrutalButton({ children, className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "bg-white border-2 border-black rounded-none shadow-brutal hover:shadow-brutal-hover active:translate-x-1 active:translate-y-1 hover:-translate-x-1 hover:-translate-y-1 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
function Avatar({ avatar, size = 'md' }: { avatar: string, size?: 'sm' | 'md' }) {
  const isUrl = avatar.startsWith('http');
  const sizeClasses = {
    sm: 'h-8 w-8 text-xl',
    md: 'h-10 w-10 text-2xl',
  };
  if (isUrl) {
    return <img src={avatar} alt="avatar" className={cn(sizeClasses[size], "object-cover border-2 border-black")} />;
  }
  return <div className={cn(sizeClasses[size], "flex items-center justify-center border-2 border-black bg-gray-100")}>{avatar}</div>;
}
function CharacterList() {
  const characters = useAppStore(state => state.characters);
  const activeCharacterId = useAppStore(state => state.activeCharacterId);
  const setActiveCharacterId = useAppStore(state => state.setActiveCharacterId);
  const toggleCharacterSheet = useAppStore(state => state.toggleCharacterSheet);
  const deleteCharacter = useAppStore(state => state.deleteCharacter);
  const isGroupChatMode = useAppStore(state => state.isGroupChatMode);
  const groupChatParticipantIds = useAppStore(state => state.groupChatParticipantIds);
  const toggleGroupParticipant = useAppStore(state => state.toggleGroupParticipant);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const handleClick = (charId: string) => {
    if (isGroupChatMode) {
      toggleGroupParticipant(charId);
    } else {
      setActiveCharacterId(charId);
    }
  };
  return (
    <div className="flex-grow overflow-y-auto space-y-2 pr-2">
      {characters.length === 0 && (
        <div className="text-center text-gray-500 p-4">
          No characters created. Click "Create Character" to begin.
        </div>
      )}
      {characters.map(char => {
        const isSelected = isGroupChatMode ? groupChatParticipantIds.includes(char.id) : activeCharacterId === char.id;
        return (
          <div
            key={char.id}
            onClick={() => handleClick(char.id)}
            className={cn(
              "p-3 border-2 border-black cursor-pointer transition-all flex items-center space-x-3",
              isSelected ? 'bg-brutal-yellow shadow-brutal' : 'bg-white hover:shadow-brutal'
            )}
          >
            {isGroupChatMode && <Checkbox checked={isSelected} className="border-2 border-black rounded-none data-[state=checked]:bg-black data-[state=checked]:text-white" />}
            <Avatar avatar={char.avatar} />
            <div className="flex-grow">
              <h3 className="font-bold text-lg">{char.name}</h3>
              <p className="text-xs text-gray-600 truncate">{char.model}</p>
            </div>
            <div className="flex space-x-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleCharacterSheet(true, char.id); }}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-200" onClick={(e) => { e.stopPropagation(); setDeletingId(char.id); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="font-mono bg-white border-2 border-black shadow-brutal rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the character.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <BrutalButton>Cancel</BrutalButton>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <BrutalButton
                className="bg-red-500 text-white"
                onClick={() => {
                  if (deletingId) deleteCharacter(deletingId);
                  setDeletingId(null);
                }}
              >
                Delete
              </BrutalButton>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
function StartGroupChatDialog({ open, onOpenChange, onStart }: { open: boolean, onOpenChange: (open: boolean) => void, onStart: (prompt: string) => void }) {
  const [prompt, setPrompt] = useState('');
  const handleSubmit = () => {
    if (prompt.trim()) {
      onStart(prompt.trim());
      onOpenChange(false);
      setPrompt('');
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-mono bg-white border-2 border-black shadow-brutal rounded-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Start Group Conversation</DialogTitle>
          <DialogDescription>
            Enter an initial topic or question to kick off the conversation between the selected characters.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="group-prompt" className="font-bold">Conversation Starter</Label>
          <Textarea
            id="group-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Discuss the future of artificial intelligence."
            className="mt-2 border-2 border-black rounded-none focus:ring-brutal-yellow focus:ring-offset-0 focus:ring-2"
            rows={4}
          />
        </div>
        <DialogFooter>
          <BrutalButton
            onClick={handleSubmit}
            className="bg-brutal-yellow text-black"
            disabled={!prompt.trim()}
          >
            Start Conversation
          </BrutalButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function Sidebar() {
  const toggleSettings = useAppStore(state => state.toggleSettings);
  const toggleCharacterSheet = useAppStore(state => state.toggleCharacterSheet);
  const connectionState = useAppStore(state => state.connectionState);
  const isGroupChatMode = useAppStore(state => state.isGroupChatMode);
  const toggleGroupChatMode = useAppStore(state => state.toggleGroupChatMode);
  const groupChatParticipantIds = useAppStore(state => state.groupChatParticipantIds);
  const startGroupConversation = useAppStore(state => state.startGroupConversation);
  const [isGroupChatDialogOpen, setGroupChatDialogOpen] = useState(false);
  const ConnectionIndicator = () => {
    switch (connectionState) {
      case 'connected':
        return <div className="flex items-center space-x-2"><Power className="h-4 w-4 text-green-600" /><span>Online</span></div>;
      case 'error':
        return <div className="flex items-center space-x-2"><PowerOff className="h-4 w-4 text-red-600" /><span>Offline</span></div>;
      default:
        return <div className="flex items-center space-x-2"><Loader className="h-4 w-4 animate-spin" /><span>Connecting</span></div>;
    }
  };
  return (
    <aside className="w-[380px] bg-white border-r-2 border-black flex flex-col p-4 space-y-4">
      <header className="border-b-2 border-black pb-4 space-y-4">
        <h1 className="text-4xl font-bold">Brutal.AI</h1>
        <div className="flex justify-between items-center">
          <ConnectionIndicator />
          <BrutalButton size="icon" onClick={() => toggleSettings(true)}>
            <Settings className="h-5 w-5" />
          </BrutalButton>
        </div>
        <div className="flex items-center justify-between p-2 border-2 border-black">
          <div className="flex items-center space-x-2 font-bold">
            <Users className="h-5 w-5" />
            <span>Group Chat Mode</span>
          </div>
          <Switch checked={isGroupChatMode} onCheckedChange={toggleGroupChatMode} />
        </div>
      </header>
      <CharacterList />
      {isGroupChatMode ? (
        <BrutalButton
          className="w-full bg-brutal-yellow text-black font-bold"
          disabled={groupChatParticipantIds.length < 2}
          onClick={() => setGroupChatDialogOpen(true)}
        >
          <MessageSquare className="mr-2 h-5 w-5" /> Start Conversation ({groupChatParticipantIds.length})
        </BrutalButton>
      ) : (
        <BrutalButton
          className="w-full bg-brutal-yellow text-black font-bold"
          onClick={() => toggleCharacterSheet(true)}
        >
          <Plus className="mr-2 h-5 w-5" /> Create Character
        </BrutalButton>
      )}
      <StartGroupChatDialog open={isGroupChatDialogOpen} onOpenChange={setGroupChatDialogOpen} onStart={startGroupConversation} />
    </aside>
  );
}
function ChatMessage({ message, avatar, isLastAssistantMessage }: { message: { role: 'user' | 'assistant', content: string, characterName?: string }, avatar: string, isLastAssistantMessage: boolean }) {
  const isUser = message.role === 'user';
  const isGenerating = useAppStore(state => state.isGenerating);
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[80%] p-4 border-2 border-black flex items-start space-x-3",
        isUser ? "bg-white" : "bg-gray-100"
      )}>
        <div className="flex-shrink-0">
          {isUser ? <User className="h-6 w-6" /> : <Avatar avatar={avatar} size="sm" />}
        </div>
        <div className="flex-grow">
          {!isUser && message.characterName && <p className="font-bold text-sm mb-1">{message.characterName}</p>}
          <p className="whitespace-pre-wrap">{message.content}{!isUser && isGenerating && isLastAssistantMessage && <span className="animate-pulse">|</span>}</p>
        </div>
      </div>
    </div>
  );
}
function ChatPanel() {
  const activeCharacterId = useAppStore(state => state.activeCharacterId);
  const characters = useAppStore(state => state.characters);
  const chatMessages = useAppStore(state => state.chatMessages);
  const isGenerating = useAppStore(state => state.isGenerating);
  const startChat = useAppStore(state => state.startChat);
  const isGroupChatMode = useAppStore(state => state.isGroupChatMode);
  const isOrchestrating = useAppStore(state => state.isOrchestrating);
  const groupChatParticipantIds = useAppStore(state => state.groupChatParticipantIds);
  const [prompt, setPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeCharacter = characters.find(c => c.id === activeCharacterId);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].content : null]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating || !activeCharacter) return;
    startChat(prompt.trim());
    setPrompt('');
  };
  const getCharacterForMessage = (message: (typeof chatMessages)[0]) => {
    if (message.role === 'assistant' && message.characterId) {
      return characters.find(c => c.id === message.characterId);
    }
    return activeCharacter;
  };
  if (!activeCharacter && !isGroupChatMode) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center border-2 border-black p-8">
          <h2 className="text-2xl font-bold">Select a Character</h2>
          <p>Choose a character from the left panel to start chatting.</p>
        </div>
      </div>
    );
  }
  if (isGroupChatMode && groupChatParticipantIds.length < 2) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center border-2 border-black p-8">
          <h2 className="text-2xl font-bold">Group Chat</h2>
          <p>Select 2 or more characters to start a group conversation.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <header className="p-4 border-b-2 border-black bg-white flex items-center space-x-4">
        {isGroupChatMode ? (
          <>
            <Users className="h-10 w-10" />
            <div>
              <h2 className="text-2xl font-bold">Group Conversation</h2>
              <p className="text-sm text-gray-600">{groupChatParticipantIds.length} participants</p>
            </div>
          </>
        ) : activeCharacter && (
          <>
            <Avatar avatar={activeCharacter.avatar} />
            <div>
              <h2 className="text-2xl font-bold">{activeCharacter.name}</h2>
              <p className="text-sm text-gray-600">{activeCharacter.model}</p>
            </div>
          </>
        )}
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatMessages.map((msg, index) => {
          const character = getCharacterForMessage(msg);
          return (
            <ChatMessage
              key={msg.id || index}
              message={msg}
              avatar={character?.avatar || '🤖'}
              isLastAssistantMessage={index === chatMessages.length - 1 && msg.role === 'assistant'}
            />
          )
        })}
        <div ref={messagesEndRef} />
      </main>
      <footer className="p-4 border-t-2 border-black bg-white">
        {isGroupChatMode ? (
          <div className="text-center font-bold p-4 border-2 border-black bg-gray-100">
            {isOrchestrating ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="animate-spin h-5 w-5" />
                <span>Conversation in progress...</span>
              </div>
            ) : (
              "Group conversation has ended."
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={activeCharacter ? `Message ${activeCharacter.name}...` : ''}
              className="flex-1 border-2 border-black rounded-none resize-none focus:ring-brutal-yellow focus:ring-offset-0 focus:ring-2"
              rows={1}
              disabled={isGenerating || !activeCharacter}
            />
            <BrutalButton type="submit" disabled={isGenerating || !prompt.trim() || !activeCharacter} className="bg-brutal-yellow text-black">
              {isGenerating ? <Loader className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
            </BrutalButton>
          </form>
        )}
      </footer>
    </div>
  );
}
export function HomePage() {
  const connectToOllama = useAppStore(state => state.connectToOllama);
  const connectionState = useAppStore(state => state.connectionState);
  const toggleSettings = useAppStore(state => state.toggleSettings);
  useEffect(() => {
    const initialConnect = async () => {
      await connectToOllama();
      const state = useAppStore.getState().connectionState;
      if (state === 'error') {
        toast.error("Could not connect to Ollama. Please check your settings.", {
          action: {
            label: "Settings",
            onClick: () => toggleSettings(true),
          },
        });
        toggleSettings(true);
      } else if (state === 'connected') {
        toast.success("Connected to Ollama!");
      }
    };
    if (connectionState === 'idle') {
      initialConnect();
    }
  }, [connectToOllama, connectionState, toggleSettings]);
  return (
    <div className="h-screen w-screen bg-white text-black font-mono flex antialiased">
      <Sidebar />
      <ChatPanel />
      <SettingsDialog />
      <CharacterSheet />
      <Toaster
        theme="light"
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            border: '2px solid black',
            boxShadow: '4px 4px 0px #000',
            borderRadius: 0,
          },
        }}
      />
    </div>
  );
}
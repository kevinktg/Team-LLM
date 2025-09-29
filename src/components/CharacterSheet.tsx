import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/stores/appStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
const characterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  avatar: z.string().min(1, 'Avatar is required. Use an emoji or image URL.'),
  systemPrompt: z.string().min(1, 'System prompt is required'),
  model: z.string().min(1, 'Model is required'),
});
type CharacterFormData = z.infer<typeof characterSchema>;
export function CharacterSheet() {
  const isCharacterSheetOpen = useAppStore(state => state.isCharacterSheetOpen);
  const toggleCharacterSheet = useAppStore(state => state.toggleCharacterSheet);
  const editingCharacterId = useAppStore(state => state.editingCharacterId);
  const characters = useAppStore(state => state.characters);
  const models = useAppStore(state => state.models);
  const addCharacter = useAppStore(state => state.addCharacter);
  const updateCharacter = useAppStore(state => state.updateCharacter);
  const editingCharacter = editingCharacterId ? characters.find(c => c.id === editingCharacterId) : null;
  const localModels = models.filter(m => m.isLocal);
  const externalModels = models.filter(m => !m.isLocal);
  const form = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: '',
      avatar: '🤖',
      systemPrompt: 'You are a helpful assistant.',
      model: '',
    },
  });
  useEffect(() => {
    if (editingCharacter) {
      form.reset(editingCharacter);
    } else {
      form.reset({
        name: '',
        avatar: '🤖',
        systemPrompt: 'You are a helpful assistant.',
        model: models.length > 0 ? models[0].name : '',
      });
    }
  }, [editingCharacter, isCharacterSheetOpen, form, models]);
  const onSubmit = (data: CharacterFormData) => {
    if (editingCharacter) {
      updateCharacter({ ...editingCharacter, ...data });
    } else {
      addCharacter(data);
    }
    toggleCharacterSheet(false);
  };
  return (
    <Sheet open={isCharacterSheetOpen} onOpenChange={toggleCharacterSheet}>
      <SheetContent className="font-mono bg-white border-l-2 border-black w-full sm:max-w-lg p-6">
        <SheetHeader>
          <SheetTitle className="text-3xl font-bold">{editingCharacter ? 'Edit Character' : 'Create Character'}</SheetTitle>
          <SheetDescription>
            Define the name, persona, and model for your AI character.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6 h-full flex flex-col">
            <div className="space-y-4 flex-grow">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-2 border-black rounded-none focus:ring-brutal-yellow focus:ring-offset-0 focus:ring-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Avatar (Emoji or URL)</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-2 border-black rounded-none focus:ring-brutal-yellow focus:ring-offset-0 focus:ring-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">System Prompt</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={8} className="border-2 border-black rounded-none focus:ring-brutal-yellow focus:ring-offset-0 focus:ring-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-2 border-black rounded-none focus:ring-brutal-yellow focus:ring-offset-0 focus:ring-2">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="font-mono bg-white border-2 border-black rounded-none">
                        {localModels.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>Local Models</SelectLabel>
                            {localModels.map(m => (
                              <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                        {externalModels.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>External Models</SelectLabel>
                            {externalModels.map(m => (
                              <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter>
              <Button
                type="submit"
                className="w-full bg-brutal-yellow text-black border-2 border-black rounded-none shadow-brutal hover:shadow-brutal-hover active:translate-x-1 active:translate-y-1 hover:-translate-x-1 hover:-translate-y-1 transition-all"
              >
                {editingCharacter ? 'Save Changes' : 'Create Character'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
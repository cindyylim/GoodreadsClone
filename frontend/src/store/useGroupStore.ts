import { create } from 'zustand';
import { Group, Topic } from '@/types';

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  topics: Topic[];
  loading: boolean;
  error: string;
  searchTerm: string;
  page: number;
  totalPages: number;
  totalGroups: number;
  isMember: boolean;
  setGroups: (groups: Group[]) => void;
  setCurrentGroup: (group: Group | null) => void;
  setTopics: (topics: Topic[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setSearchTerm: (term: string) => void;
  setPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setTotalGroups: (total: number) => void;
  setIsMember: (isMember: boolean) => void;
  addGroup: (group: Group) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  removeGroup: (id: string) => void;
  addTopic: (topic: Topic) => void;
  joinGroup: (userId: string) => void;
  leaveGroup: (userId: string) => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  currentGroup: null,
  topics: [],
  loading: false,
  error: '',
  searchTerm: '',
  page: 1,
  totalPages: 1,
  totalGroups: 0,
  isMember: false,
  
  setGroups: (groups) => set({ groups }),
  setCurrentGroup: (currentGroup) => set({ currentGroup }),
  setTopics: (topics) => set({ topics }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setPage: (page) => set({ page }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setTotalGroups: (totalGroups) => set({ totalGroups }),
  setIsMember: (isMember) => set({ isMember }),
  
  addGroup: (group) => set((state) => ({ 
    groups: [...state.groups, group] 
  })),
  
  updateGroup: (id, updatedGroup) => set((state) => ({
    groups: state.groups.map(group => 
      group._id === id ? { ...group, ...updatedGroup } : group
    ),
    currentGroup: state.currentGroup?._id === id 
      ? { ...state.currentGroup, ...updatedGroup } 
      : state.currentGroup
  })),
  
  removeGroup: (id) => set((state) => ({
    groups: state.groups.filter(group => group._id !== id),
    currentGroup: state.currentGroup?._id === id ? null : state.currentGroup
  })),
  
  addTopic: (topic) => set((state) => ({ 
    topics: [topic, ...state.topics] 
  })),
  
  joinGroup: (userId) => set((state) => ({
    currentGroup: state.currentGroup 
      ? { ...state.currentGroup, members: [...state.currentGroup.members, { _id: userId } as any] }
      : null,
    isMember: true
  })),
  
  leaveGroup: (userId) => set((state) => ({
    currentGroup: state.currentGroup 
      ? { ...state.currentGroup, members: state.currentGroup.members.filter(m => m._id !== userId) }
      : null,
    isMember: false
  }))
}));
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

export const useGroupStore = create<GroupState>((set) => ({
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
  
  setGroups: (groups: Group[]) => set({ groups }),
  setCurrentGroup: (currentGroup: Group | null) => set({ currentGroup }),
  setTopics: (topics: Topic[]) => set({ topics }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string) => set({ error }),
  setSearchTerm: (searchTerm: string) => set({ searchTerm }),
  setPage: (page: number) => set({ page }),
  setTotalPages: (totalPages: number) => set({ totalPages }),
  setTotalGroups: (totalGroups: number) => set({ totalGroups }),
  setIsMember: (isMember: boolean) => set({ isMember }),
  
  addGroup: (group: Group) => set((state) => ({
    groups: [...state.groups, group]
  })),
  
  updateGroup: (id: string, updatedGroup: Partial<Group>) => set((state) => ({
    groups: state.groups.map(group =>
      group._id === id ? { ...group, ...updatedGroup } : group
    ),
    currentGroup: state.currentGroup?._id === id
      ? { ...state.currentGroup, ...updatedGroup }
      : state.currentGroup
  })),
  
  removeGroup: (id: string) => set((state) => ({
    groups: state.groups.filter(group => group._id !== id),
    currentGroup: state.currentGroup?._id === id ? null : state.currentGroup
  })),
  
  addTopic: (topic: Topic) => set((state) => ({
    topics: [topic, ...state.topics]
  })),
  
  joinGroup: (userId: string) => set((state) => ({
    currentGroup: state.currentGroup
      ? { ...state.currentGroup, members: [...state.currentGroup.members, { _id: userId, name: '', email: '' }] }
      : null,
    isMember: true
  })),
  
  leaveGroup: (userId: string) => set((state) => ({
    currentGroup: state.currentGroup
      ? { ...state.currentGroup, members: state.currentGroup.members.filter(m => m._id !== userId) }
      : null,
    isMember: false
  }))
}));
import { create } from 'zustand';

export interface ImageItem {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  thumbnailUrl?: string | null;
  width: number;
  height: number;
  dominantColor: string;
  palette: string;
  mood: string;
  tags: string;
  viewsCount: number;
  createdAt: string | Date;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    likes: number;
    collections?: number;
  };
  isLikedByCurrentUser?: boolean;
}

interface LumioStoreState {
  // Soft Glow Mode
  softGlowEnabled: boolean;
  toggleSoftGlow: () => void;
  setSoftGlowEnabled: (enabled: boolean) => void;

  // Filters
  selectedCategory: string; // 'all' or slug
  selectedMood: string; // 'all' or mood
  searchQuery: string;
  selectedTag: string | null;
  setSelectedCategory: (cat: string) => void;
  setSelectedMood: (mood: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  resetFilters: () => void;

  // Lightbox / Focus Mode
  focusImage: ImageItem | null;
  focusQueue: ImageItem[];
  openFocusMode: (image: ImageItem, queue?: ImageItem[]) => void;
  closeFocusMode: () => void;
  navigateFocus: (direction: 'next' | 'prev') => void;

  // Visual Echo
  echoSourceImage: ImageItem | null;
  openVisualEcho: (image: ImageItem) => void;
  closeVisualEcho: () => void;

  // Notifications
  isNotificationOpen: boolean;
  unreadNotificationsCount: number;
  setNotificationOpen: (open: boolean) => void;
  setUnreadNotificationsCount: (count: number) => void;
  decrementUnreadNotifications: () => void;

  // Optimistic Likes map
  likedImagesMap: Record<string, { liked: boolean; count: number }>;
  setOptimisticLike: (imageId: string, liked: boolean, countChange: number) => void;
  initializeLikesMap: (images: ImageItem[]) => void;

  // Collection Mixer
  mixedCollectionIds: string[];
  toggleMixedCollection: (id: string) => void;
  clearMixedCollections: () => void;
}

export const useLumioStore = create<LumioStoreState>((set, get) => ({
  // Soft Glow Mode
  softGlowEnabled: false,
  toggleSoftGlow: () => set((state) => ({ softGlowEnabled: !state.softGlowEnabled })),
  setSoftGlowEnabled: (enabled: boolean) => set({ softGlowEnabled: enabled }),

  // Filters
  selectedCategory: 'all',
  selectedMood: 'all',
  searchQuery: '',
  selectedTag: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedMood: (mood) => set({ selectedMood: mood }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedTag: (selectedTag) => set({ selectedTag }),
  resetFilters: () => set({ selectedCategory: 'all', selectedMood: 'all', searchQuery: '', selectedTag: null }),

  // Focus Mode
  focusImage: null,
  focusQueue: [],
  openFocusMode: (image, queue = []) => set({ focusImage: image, focusQueue: queue }),
  closeFocusMode: () => set({ focusImage: null, focusQueue: [] }),
  navigateFocus: (direction) => {
    const { focusImage, focusQueue } = get();
    if (!focusImage || focusQueue.length === 0) return;
    const idx = focusQueue.findIndex((i) => i.id === focusImage.id);
    if (idx === -1) return;

    if (direction === 'next') {
      const nextIdx = (idx + 1) % focusQueue.length;
      set({ focusImage: focusQueue[nextIdx] });
    } else {
      const prevIdx = (idx - 1 + focusQueue.length) % focusQueue.length;
      set({ focusImage: focusQueue[prevIdx] });
    }
  },

  // Visual Echo
  echoSourceImage: null,
  openVisualEcho: (image) => set({ echoSourceImage: image }),
  closeVisualEcho: () => set({ echoSourceImage: null }),

  // Notifications
  isNotificationOpen: false,
  unreadNotificationsCount: 0,
  setNotificationOpen: (isNotificationOpen) => set({ isNotificationOpen }),
  setUnreadNotificationsCount: (unreadNotificationsCount) => set({ unreadNotificationsCount }),
  decrementUnreadNotifications: () => set((s) => ({ unreadNotificationsCount: Math.max(0, s.unreadNotificationsCount - 1) })),

  // Optimistic Likes
  likedImagesMap: {},
  setOptimisticLike: (imageId, liked, countChange) =>
    set((state) => {
      const current = state.likedImagesMap[imageId] || { liked: false, count: 0 };
      return {
        likedImagesMap: {
          ...state.likedImagesMap,
          [imageId]: {
            liked,
            count: Math.max(0, current.count + countChange),
          },
        },
      };
    }),
  initializeLikesMap: (images) =>
    set((state) => {
      const newMap = { ...state.likedImagesMap };
      images.forEach((img) => {
        if (!(img.id in newMap)) {
          newMap[img.id] = {
            liked: !!img.isLikedByCurrentUser,
            count: img._count?.likes ?? 0,
          };
        }
      });
      return { likedImagesMap: newMap };
    }),

  // Collection Mixer
  mixedCollectionIds: [],
  toggleMixedCollection: (id) =>
    set((state) => {
      const exists = state.mixedCollectionIds.includes(id);
      return {
        mixedCollectionIds: exists
          ? state.mixedCollectionIds.filter((item) => item !== id)
          : [...state.mixedCollectionIds, id],
      };
    }),
  clearMixedCollections: () => set({ mixedCollectionIds: [] }),
}));

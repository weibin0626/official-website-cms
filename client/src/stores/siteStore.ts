import { create } from 'zustand';
import * as sitesApi from '../api/sites';
import type { Site } from '../api/sites';

interface SiteState {
  sites: Site[];
  currentSite: Site | null;
  currentSiteId: string | null;
  loading: boolean;

  fetchSites: () => Promise<Site[]>;
  switchSite: (siteId: string) => void;
  getCurrentSiteConfig: () => Site | null;
  setCurrentSiteId: (siteId: string) => void;
  setSites: (sites: Site[]) => void;
}

export const useSiteStore = create<SiteState>((set, get) => ({
  sites: [],
  currentSite: null,
  currentSiteId: localStorage.getItem('currentSiteId'),
  loading: false,

  fetchSites: async () => {
    set({ loading: true });
    try {
      const sites = await sitesApi.listSites();
      const currentSiteId = get().currentSiteId || localStorage.getItem('currentSiteId');
      const currentSite = sites.find((s) => s.id === currentSiteId) || sites[0] || null;

      if (currentSite) {
        localStorage.setItem('currentSiteId', currentSite.id);
      }

      set({
        sites,
        currentSite,
        currentSiteId: currentSite?.id || null,
        loading: false,
      });

      return sites;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  switchSite: (siteId: string) => {
    const { sites } = get();
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      localStorage.setItem('currentSiteId', siteId);
      set({
        currentSite: site,
        currentSiteId: siteId,
      });
    }
  },

  getCurrentSiteConfig: () => {
    return get().currentSite;
  },

  setCurrentSiteId: (siteId: string) => {
    const { sites } = get();
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      localStorage.setItem('currentSiteId', siteId);
      set({ currentSiteId: siteId, currentSite: site });
    }
  },

  setSites: (sites: Site[]) => {
    const { currentSiteId } = get();
    const currentSite = sites.find((s) => s.id === currentSiteId) || sites[0] || null;
    if (currentSite) {
      localStorage.setItem('currentSiteId', currentSite.id);
    }
    set({ sites, currentSite, currentSiteId: currentSite?.id || null });
  },
}));

export default useSiteStore;

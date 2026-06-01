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
      const existingSiteId = get().currentSiteId;
      const storedSiteId = localStorage.getItem('currentSiteId');

      // Preserve existing currentSiteId if it's still valid in the new sites list
      let finalSiteId = existingSiteId || storedSiteId || null;
      let currentSite = sites.find((s) => s.id === finalSiteId) || null;

      // Only fallback to first site if currentSiteId is invalid
      if (!currentSite && sites.length > 0) {
        currentSite = sites[0];
        finalSiteId = currentSite.id;
      }

      if (finalSiteId) {
        localStorage.setItem('currentSiteId', finalSiteId);
      }

      set({
        sites,
        currentSite,
        currentSiteId: finalSiteId,
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
    let currentSite = sites.find((s) => s.id === currentSiteId) || null;

    // If currentSiteId is invalid, fallback to first site
    if (!currentSite && sites.length > 0) {
      currentSite = sites[0];
    }

    if (currentSite) {
      localStorage.setItem('currentSiteId', currentSite.id);
    }

    set({
      sites,
      currentSite,
      currentSiteId: currentSite?.id || null,
    });
  },
}));

export default useSiteStore;

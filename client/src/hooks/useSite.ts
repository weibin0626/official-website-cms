import { useSiteStore } from '../stores/siteStore';
import type { Site } from '../api/sites';

interface UseSiteReturn {
  sites: Site[];
  currentSite: Site | null;
  currentSiteId: string | null;
  loading: boolean;
  fetchSites: () => Promise<Site[]>;
  switchSite: (siteId: string) => void;
  getCurrentSiteConfig: () => Site | null;
}

export const useSite = (): UseSiteReturn => {
  const store = useSiteStore();

  return {
    sites: store.sites,
    currentSite: store.currentSite,
    currentSiteId: store.currentSiteId,
    loading: store.loading,
    fetchSites: store.fetchSites,
    switchSite: store.switchSite,
    getCurrentSiteConfig: store.getCurrentSiteConfig,
  };
};

export default useSite;

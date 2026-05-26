import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useSiteStore } from '../../stores/siteStore';

const SiteSwitcher: React.FC = () => {
  const { sites, currentSiteId, switchSite } = useSiteStore();

  const handleChange = (event: any) => {
    const newSiteId = event.target.value as string;
    switchSite(newSiteId);
    // Refresh page data after site switch
    window.location.reload();
  };

  if (sites.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
      <LanguageIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: 20 }} />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="site-switcher-label" sx={{ fontSize: '0.875rem' }}>
          当前站点
        </InputLabel>
        <Select
          labelId="site-switcher-label"
          value={currentSiteId || ''}
          onChange={handleChange}
          label="当前站点"
          sx={{
            fontSize: '0.875rem',
            '& .MuiSelect-select': { py: 0.75 },
          }}
        >
          {sites.map((site) => (
            <MenuItem key={site.id} value={site.id} sx={{ fontSize: '0.875rem' }}>
              {site.nameCn}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SiteSwitcher;

import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import LaunchIcon from '@mui/icons-material/Launch';
import { useSiteStore } from '../../stores/siteStore';

const SiteSwitcher: React.FC = () => {
  const { sites, currentSiteId, switchSite, currentSite } = useSiteStore();

  // 只显示 ACTIVE 的站点
  const activeSites = sites.filter((s) => s.status === 'ACTIVE');

  const handleChange = (event: any) => {
    const newSiteId = event.target.value as string;
    switchSite(newSiteId);
    // Refresh page data after site switch
    window.location.reload();
  };

  const handleVisitSite = () => {
    if (!currentSite) return;

    // 构建门户首页 URL
    const protocol = window.location.protocol;
    const port = window.location.port;
    const portSuffix = port ? `:${port}` : '';

    if (currentSite.domain) {
      // 有域名 → 通过域名访问（方案 B）
      window.open(`${protocol}//${currentSite.domain}${portSuffix}/`, '_blank');
    } else {
      // 无域名 → 通过 siteId 参数访问
      window.open(`${protocol}//${window.location.hostname}${portSuffix}/?siteId=${currentSite.id}`, '_blank');
    }
  };

  if (activeSites.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
      <Tooltip title="访问站点首页">
        <IconButton
          size="small"
          onClick={handleVisitSite}
          sx={{ mr: 0.5, color: 'text.secondary' }}
        >
          <LanguageIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
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
          {activeSites.map((site) => (
            <MenuItem key={site.id} value={site.id} sx={{ fontSize: '0.875rem' }}>
              {site.nameCn || site.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Tooltip title="新标签页打开">
        <IconButton
          size="small"
          onClick={handleVisitSite}
          sx={{ ml: 0.3, color: 'text.secondary' }}
        >
          <LaunchIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SiteSwitcher;

import React from 'react';
import { Paper, BottomNavigation as MuiBottomNavigation, BottomNavigationAction } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import HomeIcon from '@mui/icons-material/Home';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AppsIcon from '@mui/icons-material/Apps';
import VideogameAssetRoundedIcon from '@mui/icons-material/VideogameAssetRounded';
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const AppBottomNavigation = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  
  const authPages = ['/login', '/register', '/register/profile', '/confirm-email'];
  const isAuthPage = authPages.some(path => location.pathname.startsWith(path));
  const isSettingsPage = location.pathname.startsWith('/settings');
  const isBadgeShopPage = location.pathname.startsWith('/badge-shop');
  
  
  if (isAuthPage || isSettingsPage || isBadgeShopPage) {
    return null;
  }
  
  
  const isClickerPage = location.pathname.startsWith('/clicker');
  if (isClickerPage) {
    return null;
  }
  
  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/' || path === '/feed' || path === '/main') return 0;
    if (path === '/music') return 1;
    if (path === '/subscriptions') return 2;
    if (path.startsWith('/profile')) return 3;
    if (path === '/more') return 4;
    return false;
  };

  console.log("BottomNavigation rendering, user:", user, "pathname:", location.pathname);



  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        display: { xs: 'block', md: 'none' },
        zIndex: 1000,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(180deg, rgba(26,26,26,0.8) 0%, rgba(26,26,26,0.95) 100%)',
        backdropFilter: 'blur(10px)'
      }} 
      elevation={3}
    >
      <MuiBottomNavigation
        value={getCurrentValue()}
        onChange={(event, newValue) => {
          switch(newValue) {
            case 0:
              navigate('/');
              break;
            case 1:
              navigate('/music');
              break;
            case 2:
              navigate('/subscriptions');
              break;
            case 3:
              navigate(user ? `/profile/${user.username}` : '/login');
              break;
            case 4:
              navigate('/more');
              break;
            default:
              break;
          }
        }}
        sx={{
          bgcolor: 'transparent',
          height: 75,
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main'
            }
          }
        }}
      >
        <BottomNavigationAction 
          label="Лента" 
          icon={<Icon icon="solar:home-bold" width="28" height="28" />}
          sx={{ 
            minWidth: 'auto',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.8rem'
            }
          }}
        />
        <BottomNavigationAction 
          label="Музыка" 
          icon={<Icon icon="solar:music-notes-bold" width="28" height="28" />}
          sx={{ 
            minWidth: 'auto',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.8rem'
            }
          }}
        />
        <BottomNavigationAction 
          label="Подписки" 
          icon={<Icon icon="solar:users-group-rounded-bold" width="28" height="28" />}
          sx={{ 
            minWidth: 'auto',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.8rem'
            }
          }}
        />
        <BottomNavigationAction 
          label="Профиль" 
          icon={<Icon icon="solar:user-bold" width="28" height="28" />}
          sx={{ 
            minWidth: 'auto',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.8rem'
            }
          }}
        />
        <BottomNavigationAction 
          label="Еще" 
          icon={<Icon icon="solar:widget-2-bold" width="28" height="28" sx={{
            transform: 'scale(1.1)',
            filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))',
          }} />}
          sx={{ 
            minWidth: 'auto',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.8rem'
            }
          }}
        />
      </MuiBottomNavigation>
    </Paper>
  );
};

export default AppBottomNavigation; 
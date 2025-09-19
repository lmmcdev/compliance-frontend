import React from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Button,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Description as LicenseIcon,
  BarChart as ChartIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const drawerWidth = 60;

const menuItems = [
  { text: 'Call Logs', path: '/dashboard', icon: <PhoneIcon /> },
  { text: 'Charts', path: '/charts', icon: <ChartIcon /> },
  { text: 'People', path: '/people', icon: <PeopleIcon /> },
  { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  { text: 'Licenses', path: '/licenses', icon: <LicenseIcon /> },
];

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated, account, logout } = useAuth();
  const location = useLocation();
  //console.log(account)

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa', width: '100vw' }}>
      {/* Sidebar */}
      {isAuthenticated && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#fff',
              borderRight: '1px solid #e0e0e0',
              boxShadow: 'none',
              position: 'fixed',
              left: 0,
              top: 0,
              height: '100vh',
            },
          }}
        >
          <Box sx={{ overflow: 'auto', py: 1 }}>
            <List sx={{ px: 1 }}>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isActive(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: 'center',
                      px: 1.5,
                      borderRadius: 1,
                      '&.Mui-selected': {
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        '&:hover': {
                          backgroundColor: '#bbdefb',
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive(item.path) ? '#1976d2' : '#666',
                        minWidth: 0,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: isAuthenticated ? `calc(100vw - ${drawerWidth}px)` : '100vw',
          minHeight: '100vh',
          marginLeft: isAuthenticated ? `${drawerWidth}px` : 0,
          maxWidth: 'none',
        }}
      >
        {/* Top Bar */}
        {isAuthenticated && (
          <AppBar
            position="static"
            elevation={0}
            sx={{
              backgroundColor: '#fff',
              borderBottom: '1px solid #e0e0e0',
              boxShadow: 'none',
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between', px: 3, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  placeholder="mm/dd/yyyy"
                  size="small"
                  type="date"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                      borderRadius: 1,
                    },
                  }}
                />
                <TextField
                  placeholder="Assigned to"
                  size="small"
                  select
                  sx={{
                    minWidth: 120,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                      borderRadius: 1,
                    },
                  }}
                />
                <TextField
                  placeholder="Caller ID"
                  size="small"
                  select
                  sx={{
                    minWidth: 120,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                      borderRadius: 1,
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" sx={{ color: '#666' }}>
                  <SearchIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: '#666' }}>
                  <MoreIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: '#666' }}>
                  <PhoneIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: '#666' }}>
                  <MoreIcon />
                </IconButton>
                {account && (
                  <Button
                    onClick={logout}
                    variant="text"
                    size="small"
                    sx={{ color: '#666', textTransform: 'none' }}
                  >
                    Logout
                  </Button>
                )}
              </Box>
            </Toolbar>
          </AppBar>
        )}

        {/* Page Content */}
        <Box sx={{
          flexGrow: 1,
          overflow: 'auto',
          width: '100%',
          maxWidth: 'none',
          padding: 0,
          margin: 0,
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
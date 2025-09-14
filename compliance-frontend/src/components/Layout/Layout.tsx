import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Container,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as LicenseIcon,
  CloudUpload as UploadIcon,
  Assignment as ComplianceIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { text: 'License Management', path: '/licenses', icon: <LicenseIcon /> },
  { text: 'Upload License', path: '/upload', icon: <UploadIcon /> },
  { text: 'Compliance Cases', path: '/compliance', icon: <ComplianceIcon /> },
];

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated, account, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'primary.main',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Compliance Management System
          </Typography>
          
          {isAuthenticated && account && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                Welcome, {account.name}
              </Typography>
              <Button color="inherit" onClick={logout} variant="outlined">
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {isAuthenticated && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isActive(item.path)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive(item.path) ? 'white' : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: isAuthenticated ? `calc(100% - ${drawerWidth}px)` : '100%',
        }}
      >
        <Toolbar />
        <Container maxWidth={false}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
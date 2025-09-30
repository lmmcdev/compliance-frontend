import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Button,
  IconButton,
  TextField,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Description as LicenseIcon,
  BarChart as ChartIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  BugReport as IncidentIcon,
  AccountCircle as AccountIcon,
  NotificationsNone as NotificationIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

const menuItems = [
  { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { text: 'Charts', path: '/charts', icon: <ChartIcon /> },
  { text: 'People', path: '/people', icon: <PeopleIcon /> },
  { text: 'Incidents', path: '/incidents', icon: <IncidentIcon /> },
  { text: 'Licenses', path: '/licenses', icon: <LicenseIcon /> },
  { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated, account, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setSidebarCollapsed(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const isActive = (path: string) => location.pathname === path;

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const currentDrawerWidth = isMobile ? drawerWidth : (sidebarCollapsed ? collapsedDrawerWidth : drawerWidth);

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      {isAuthenticated && (
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={sidebarOpen}
          onClose={handleSidebarClose}
          sx={{
            width: currentDrawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: currentDrawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              borderRight: '1px solid #e2e8f0',
              boxShadow: isMobile ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
              position: 'fixed',
              left: 0,
              top: 0,
              height: '100vh',
              transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
            },
          }}
        >
          {/* Sidebar Header */}
          <Box sx={{
            p: 2,
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'space-between',
            minHeight: '64px',
          }}>
            <Box
              sx={{
                overflow: 'hidden',
                width: sidebarCollapsed && !isMobile ? 0 : 'auto',
                opacity: sidebarCollapsed && !isMobile ? 0 : 1,
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Typography variant="h6" sx={{
                color: '#1e293b',
                fontWeight: 600,
                fontSize: '18px',
                whiteSpace: 'nowrap',
              }}>
                Compliance
              </Typography>
            </Box>

            {!isMobile && (
              <IconButton
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                size="small"
                sx={{
                  color: '#64748b',
                  backgroundColor: 'rgba(100, 116, 139, 0.08)',
                  width: 32,
                  height: 32,
                  '&:hover': {
                    backgroundColor: '#00A1FF',
                    color: '#fff',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ChevronLeftIcon
                  fontSize="small"
                  sx={{
                    transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </IconButton>
            )}
          </Box>

          {/* Navigation Menu */}
          <Box sx={{ overflow: 'auto', py: 2, flex: 1 }}>
            <List sx={{ px: sidebarCollapsed && !isMobile ? 1 : 2 }}>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <Tooltip
                    title={sidebarCollapsed && !isMobile ? item.text : ''}
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      selected={isActive(item.path)}
                      onClick={handleSidebarClose}
                      sx={{
                        minHeight: 48,
                        justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                        px: sidebarCollapsed && !isMobile ? 1.5 : 2,
                        borderRadius: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        '&.Mui-selected': {
                          backgroundColor: '#DFF3FF',
                          color: '#00A1FF',
                          '&:hover': {
                            backgroundColor: '#BAE7FF',
                          },
                        },
                        '&:hover': {
                          backgroundColor: '#f1f5f9',
                          transform: 'translateX(4px)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive(item.path) ? '#00A1FF' : '#64748b',
                          minWidth: sidebarCollapsed && !isMobile ? 0 : 40,
                          justifyContent: 'center',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: sidebarCollapsed && !isMobile ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      <Box
                        sx={{
                          overflow: 'hidden',
                          width: sidebarCollapsed && !isMobile ? 0 : 'auto',
                          opacity: sidebarCollapsed && !isMobile ? 0 : 1,
                          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                          ml: sidebarCollapsed && !isMobile ? 0 : 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: isActive(item.path) ? '#00A1FF' : '#334155',
                            fontWeight: isActive(item.path) ? 600 : 500,
                            fontSize: '14px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.text}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Sidebar Footer */}
          <Box
            sx={{
              overflow: 'hidden',
              height: sidebarCollapsed && !isMobile ? 0 : 'auto',
              opacity: sidebarCollapsed && !isMobile ? 0 : 1,
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {(!sidebarCollapsed || isMobile) && (
            <Box sx={{
              p: 2,
              borderTop: '1px solid #e2e8f0',
              backgroundColor: 'rgba(248, 250, 252, 0.5)',
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}>
                <IconButton
                  size="small"
                  sx={{
                    backgroundColor: '#00A1FF',
                    color: '#fff',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      backgroundColor: '#0080CC',
                    }
                  }}
                >
                  <AccountIcon fontSize="small" />
                </IconButton>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {account?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: '#64748b',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                  }}>
                    Online
                  </Typography>
                </Box>
              </Box>
            </Box>
            )}
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
          minHeight: '100vh',
          width: isAuthenticated && !isMobile ? `calc(100vw - ${currentDrawerWidth}px)` : '100vw',
          position: 'relative',
          transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Top Bar */}
        {isAuthenticated && (
          <Box sx={{
            height: '65px',
            minHeight: '65px',
            maxHeight: '65px',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            width: isAuthenticated && !isMobile ? `calc(100vw - ${currentDrawerWidth}px)` : '100vw',
            position: 'fixed',
            left: isAuthenticated && !isMobile ? `${currentDrawerWidth}px` : 0,
            top: 0,
            zIndex: 1100,
            flexShrink: 0,
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {/* Mobile Menu Button - Only visible on mobile */}
            {isMobile && (
              <Box sx={{ px: 2 }}>
                <IconButton
                  onClick={toggleSidebar}
                  size="medium"
                  sx={{
                    color: '#64748b',
                    backgroundColor: 'rgba(100, 116, 139, 0.08)',
                    borderRadius: '10px',
                    width: '40px',
                    height: '40px',
                    '&:hover': {
                      backgroundColor: '#00A1FF',
                      color: '#fff',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <MenuIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Main Content Area - starts from left edge on desktop */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              px: 3,
              gap: 2,
            }}>
              {/* Search Bar */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                borderRadius: '12px',
                px: 2,
                py: 1,
                flex: 1,
                maxWidth: '500px',
                border: '1px solid #e2e8f0',
                '&:hover': {
                  backgroundColor: '#e2e8f0',
                  borderColor: '#00A1FF',
                },
                '&:focus-within': {
                  backgroundColor: '#fff',
                  borderColor: '#00A1FF',
                  boxShadow: '0 0 0 3px rgba(0, 161, 255, 0.1)',
                }
              }}>
                <SearchIcon sx={{ color: '#64748b', mr: 1, fontSize: '20px' }} />
                <TextField
                  placeholder="Search compliance records..."
                  size="small"
                  variant="standard"
                  sx={{
                    flex: 1,
                    '& .MuiInput-underline': {
                      '&:before': { display: 'none' },
                      '&:after': { display: 'none' },
                    },
                    '& .MuiInputBase-input': {
                      padding: 0,
                      fontSize: '14px',
                      '&::placeholder': {
                        color: '#64748b',
                        opacity: 1,
                      }
                    }
                  }}
                />
              </Box>

              {/* Spacer */}
              <Box sx={{ flex: 1 }} />

              {/* Right Section - Actions and User */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
              <IconButton
                size="medium"
                sx={{
                  color: '#64748b',
                  backgroundColor: 'rgba(100, 116, 139, 0.08)',
                  borderRadius: '10px',
                  width: '40px',
                  height: '40px',
                  '&:hover': {
                    backgroundColor: '#00A1FF',
                    color: '#fff',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <NotificationIcon fontSize="small" />
              </IconButton>

              {account && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2, pl: 2, borderLeft: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body2" sx={{
                      color: '#334155',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}>
                      {account.name || 'User'}
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: '#64748b',
                      fontSize: '12px',
                      display: 'block',
                      lineHeight: 1
                    }}>
                      {account.username || 'user@company.com'}
                    </Typography>
                  </Box>

                  <IconButton
                    size="medium"
                    sx={{
                      color: '#64748b',
                      backgroundColor: 'rgba(0, 161, 255, 0.08)',
                      borderRadius: '10px',
                      width: '40px',
                      height: '40px',
                      '&:hover': {
                        backgroundColor: '#00A1FF',
                        color: '#fff',
                      }
                    }}
                  >
                    <AccountIcon fontSize="small" />
                  </IconButton>

                  <Button
                    onClick={logout}
                    startIcon={<LogoutIcon />}
                    variant="outlined"
                    size="small"
                    sx={{
                      color: '#64748b',
                      borderColor: '#e2e8f0',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '13px',
                      px: 2,
                      py: 1,
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: '#fee2e2',
                        borderColor: '#ef4444',
                        color: '#dc2626',
                      }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Logout</Box>
                  </Button>
                </Box>
              )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Page Content */}
        <Box sx={{
          flexGrow: 1,
          overflow: 'auto',
          width: '100%',
          maxWidth: 'none',
          padding: 0,
          margin: 0,
          paddingTop: isAuthenticated ? '65px' : 0,
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
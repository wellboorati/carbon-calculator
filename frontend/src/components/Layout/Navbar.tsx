import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useColorMode } from '../../contexts/ColorModeContext';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Calculator', path: '/calculator' },
  { label: 'Tips', path: '/tips' },
  { label: 'FAQ', path: '/faq' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 800, color: 'primary.main' }}
        >
          Carbon Calculator
        </Typography>
        {NAV_LINKS.map((link) => (
          <Button
            key={link.path}
            onClick={() => navigate(link.path)}
            sx={{
              color: location.pathname === link.path ? 'text.primary' : 'text.secondary',
              fontWeight: location.pathname === link.path ? 700 : 400,
              borderBottom: location.pathname === link.path ? '2px solid' : '2px solid transparent',
              borderColor: location.pathname === link.path ? 'primary.main' : 'transparent',
              borderRadius: 0,
              px: 1.5,
            }}
          >
            {link.label}
          </Button>
        ))}
        <Tooltip title={theme.palette.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={toggleColorMode} sx={{ ml: 1, color: 'text.secondary' }}>
            {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

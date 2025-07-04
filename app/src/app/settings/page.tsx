"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Image from "next/image";
import Link from "next/link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SettingsIcon from "@mui/icons-material/Settings";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976d2" },
    secondary: { main: "#1976d2" },
    background: { default: "#181c24", paper: "#23283b" },
    text: { primary: "#fff" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: { styleOverrides: { root: { boxShadow: "0 4px 32px 0 #00000040" } } },
  },
});

export default function SettingsPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/login';
  };

  useEffect(() => {
    // Check for logged in user
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      window.location.href = '/login'; // Redirect to login if not logged in
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async () => {
    setError("");
    setSuccess("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type: 'create-user' }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess("User created successfully!");
      setOpenDialog(false);
      setForm({
        username: "",
        password: "",
      });
    } else {
      setError(data.error || "Something went wrong");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Image src="/g2techsoft-logo.svg" alt="G2TechSoft Logo" width={180} height={40} style={{ background: 'transparent' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button component={Link} href="/" variant="outlined" color="primary">Desktop</Button>
            <Button component={Link} href="/laptop" variant="outlined" color="primary">Laptop</Button>
            <IconButton
              aria-label="settings menu"
              aria-controls={open ? 'settings-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleMenuClick}
              color="inherit"
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              id="settings-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'settings-button',
              }}
            >
              <MenuItem component={Link} href="/settings" onClick={handleMenuClose}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, letterSpacing: 2, color: 'primary.main' }}>
          Settings
        </Typography>
        <Paper sx={{ p: 3 }} elevation={3}>
          <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>Add User</Button>
          {success && <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>}
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        </Paper>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField name="username" label="Username" value={form.username} onChange={handleChange} required />
              <TextField name="password" label="Password" type="password" value={form.password} onChange={handleChange} required />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddUser} color="primary">Add User</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
} 
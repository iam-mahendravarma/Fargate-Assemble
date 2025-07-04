"use client";
import { useState } from "react";
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
} from "@mui/material";
import Image from "next/image";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#c5122c" },
    secondary: { main: "#c5122c" },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "rgba(0, 0, 0, 0.87)" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: { styleOverrides: { root: { boxShadow: "0 4px 32px 0 #00000040" } } },
  },
});

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, type: 'signin' }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('loggedInUser', username);
      window.location.href = "/";
    } else {
      setError(data.error || "Invalid username or password");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Paper sx={{ p: 4, width: 1, textAlign: "center" }}>
          <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
            <Image src="/g2techsoft-logo.svg" alt="G2TechSoft Logo" width={180} height={40} style={{ background: 'transparent' }} />
          </Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, letterSpacing: 2, color: 'primary.main' }}>
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            <Button type="submit" variant="contained" color="primary" fullWidth size="large">
              Submit
            </Button>
          </form>
        </Paper>
      </Container>
    </ThemeProvider>
  );
} 
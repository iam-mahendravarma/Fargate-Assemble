"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import * as XLSX from "xlsx";
import Link from "next/link";
import Image from "next/image";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SettingsIcon from "@mui/icons-material/Settings";

interface Asset {
  _id?: string;
  bayNumber: string;
  employeeName: string;
  cpuNumber: string;
  ram: string;
  hardDisk: string;
  processor: string;
  machineIp: string;
  remarks: string;
}

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

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [form, setForm] = useState<Asset>({
    bayNumber: "",
    employeeName: "",
    cpuNumber: "",
    ram: "",
    hardDisk: "",
    processor: "",
    machineIp: "",
    remarks: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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
    } else {
      fetchAssets(); // Fetch assets only if logged in
    }
  }, []);

  const fetchAssets = async () => {
    const res = await fetch("/api/assets");
    const data = await res.json();
    setAssets(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch("/api/assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, _id: editingId }),
      });
      setEditingId(null);
    } else {
      await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm({
      bayNumber: "",
      employeeName: "",
      cpuNumber: "",
      ram: "",
      hardDisk: "",
      processor: "",
      machineIp: "",
      remarks: "",
    });
    fetchAssets();
  };

  const handleEdit = (asset: Asset) => {
    setForm(asset);
    setEditingId(asset._id!);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await fetch("/api/assets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      setDeleteId(null);
      setOpenDialog(false);
      fetchAssets();
    }
  };

  const filteredAssets = assets.filter((asset) =>
    Object.values(asset).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(assets);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");
    XLSX.writeFile(workbook, "assets.xlsx");
  };

  interface ExcelRow {
    Bay?: string;
    bayNumber?: string;
    "Employee Name"?: string;
    employeeName?: string;
    CPU?: string;
    cpuNumber?: string;
    RAM?: string;
    ram?: string;
    "Hard Disk"?: string;
    hardDisk?: string;
    Processor?: string;
    processor?: string;
    IP?: string;
    machineIp?: string;
    Remarks?: string;
    remarks?: string;
    _id?: string;
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        // Support both camelCase and spaced headers
        const mapped = (jsonData as ExcelRow[]).map((row) => {
          // If already camelCase, use as is
          let asset;
          if (
            row.bayNumber !== undefined &&
            row.employeeName !== undefined &&
            row.cpuNumber !== undefined &&
            row.ram !== undefined &&
            row.hardDisk !== undefined &&
            row.processor !== undefined &&
            row.machineIp !== undefined
          ) {
            asset = {
              ...row,
              _id: row._id || `temp_${Math.random().toString(36).substr(2, 9)}`
            };
          } else {
            asset = {
              bayNumber: row["Bay"] || row["bayNumber"] || "",
              employeeName: row["Employee Name"] || row["employeeName"] || "",
              cpuNumber: row["CPU"] || row["cpuNumber"] || "",
              ram: row["RAM"] || row["ram"] || "",
              hardDisk: row["Hard Disk"] || row["hardDisk"] || "",
              processor: row["Processor"] || row["processor"] || "",
              machineIp: row["IP"] || row["machineIp"] || "",
              remarks: row["Remarks"] || row["remarks"] || "",
              _id: row._id || `temp_${Math.random().toString(36).substr(2, 9)}`
            };
          }
          // Ensure all required fields are present
          return {
            bayNumber: asset.bayNumber || "",
            employeeName: asset.employeeName || "",
            cpuNumber: asset.cpuNumber || "",
            ram: asset.ram || "",
            hardDisk: asset.hardDisk || "",
            processor: asset.processor || "",
            machineIp: asset.machineIp || "",
            remarks: asset.remarks || "",
            _id: asset._id
          };
        });
        if (mapped.length > 0) {
          console.log("First imported row:", mapped[0]);
        }
        setAssets(mapped as Asset[]);
      };
      reader.readAsBinaryString(file);
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
            <Button component={Link} href="/" variant="contained" color="primary">Desktop</Button>
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
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, letterSpacing: 2, color: 'secondary.main' }}>
          Desktop Asset
        </Typography>
        <Paper sx={{ p: 3, mb: 4, maxWidth: 1500, margin: '0 auto' }} elevation={3}>
          <form onSubmit={handleSubmit}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" useFlexGap>
              <TextField
                name="bayNumber"
                label="Bay Number"
                value={form.bayNumber}
                onChange={handleChange}
                required
                size="small"
              />
              <TextField
                name="employeeName"
                label="Employee Name"
                value={form.employeeName}
                onChange={handleChange}
                required
                size="small"
              />
              <TextField
                name="cpuNumber"
                label="CPU Number"
                value={form.cpuNumber}
                onChange={handleChange}
                required
                size="small"
              />
              <TextField
                name="ram"
                label="RAM"
                value={form.ram}
                onChange={handleChange}
                required
                size="small"
              />
              <TextField
                name="hardDisk"
                label="Hard Disk"
                value={form.hardDisk}
                onChange={handleChange}
                required
                size="small"
              />
              <TextField
                name="processor"
                label="Processor"
                value={form.processor}
                onChange={handleChange}
                required
                size="small"
              />
              <TextField
                name="machineIp"
                label="Machine IP"
                value={form.machineIp}
                onChange={handleChange}
                required
                size="small"
              />
              <TextField
                name="remarks"
                label="Remarks"
                value={form.remarks}
                onChange={handleChange}
                size="small"
              />
              <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 120 }}>
                {editingId ? "Update" : "Add"} Asset
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      bayNumber: "",
                      employeeName: "",
                      cpuNumber: "",
                      ram: "",
                      hardDisk: "",
                      processor: "",
                      machineIp: "",
                      remarks: "",
                    });
                  }}
                  sx={{ minWidth: 120 }}
                >
                  Cancel
                </Button>
              )}
            </Stack>
          </form>
        </Paper>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2, maxWidth: 1500, margin: '0 auto' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TableContainer component={Paper} elevation={2} sx={{ minWidth: 1200, margin: '0 auto', backgroundColor: '#f5f5f5' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bay Number</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>CPU Number</TableCell>
                <TableCell>RAM</TableCell>
                <TableCell>Hard Disk</TableCell>
                <TableCell>Processor</TableCell>
                <TableCell>Machine IP</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset._id}>
                  <TableCell>{asset.bayNumber}</TableCell>
                  <TableCell>{asset.employeeName}</TableCell>
                  <TableCell>{asset.cpuNumber}</TableCell>
                  <TableCell>{asset.ram}</TableCell>
                  <TableCell>{asset.hardDisk}</TableCell>
                  <TableCell>{asset.processor}</TableCell>
                  <TableCell>{asset.machineIp}</TableCell>
                  <TableCell>{asset.remarks}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEdit(asset)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(asset._id!)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{deleteId ? "Confirm Delete" : "Edit Asset"}</DialogTitle>
          <DialogContent>
            {deleteId ? (
              <Typography>Are you sure you want to delete this asset?</Typography>
            ) : (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  name="bayNumber"
                  label="Bay Number"
                  value={form.bayNumber}
                  onChange={handleChange}
                  required
                />
                <TextField
                  name="employeeName"
                  label="Employee Name"
                  value={form.employeeName}
                  onChange={handleChange}
                  required
                />
                <TextField
                  name="cpuNumber"
                  label="CPU Number"
                  value={form.cpuNumber}
                  onChange={handleChange}
                  required
                />
                <TextField
                  name="ram"
                  label="RAM"
                  value={form.ram}
                  onChange={handleChange}
                  required
                />
                <TextField
                  name="hardDisk"
                  label="Hard Disk"
                  value={form.hardDisk}
                  onChange={handleChange}
                  required
                />
                <TextField
                  name="processor"
                  label="Processor"
                  value={form.processor}
                  onChange={handleChange}
                  required
                />
                <TextField
                  name="machineIp"
                  label="Machine IP"
                  value={form.machineIp}
                  onChange={handleChange}
                  required
                />
                <TextField
                  name="remarks"
                  label="Remarks"
                  value={form.remarks}
                  onChange={handleChange}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            {deleteId ? (
              <Button onClick={confirmDelete} color="error">
                Delete
              </Button>
            ) : (
              <Button onClick={handleSubmit} color="primary">
                Save
              </Button>
            )}
          </DialogActions>
        </Dialog>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2, maxWidth: 1500, margin: '0 auto' }}>
          <Button variant="contained" color="primary" onClick={handleExport}>
            Export to Excel
          </Button>
          <Button variant="contained" color="primary" component="label">
            Import from Excel
            <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

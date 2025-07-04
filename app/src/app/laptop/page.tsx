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
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Link from "next/link";
import Image from "next/image";
import * as XLSX from "xlsx";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";

interface Laptop {
  _id?: string;
  seatNo: string;
  location: string;
  assetTag: string;
  sysNo: string;
  processor: string;
  ram: string;
  hddSize: string;
  make: string;
  os: string;
  serviceTag: string;
  column1: string;
  remarks: string;
  purchasedOn?: string;
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

export default function LaptopPage() {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [form, setForm] = useState<Laptop>({
    seatNo: "",
    location: "",
    assetTag: "",
    sysNo: "",
    processor: "",
    ram: "",
    hddSize: "",
    make: "",
    os: "",
    serviceTag: "",
    column1: "",
    remarks: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [searchTerm, setSearchTerm] = useState("");

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
      fetchLaptops(); // Fetch laptops only if logged in
    }
  }, []);

  const fetchLaptops = async () => {
    const res = await fetch("/api/laptops");
    const data = await res.json();
    setLaptops(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch("/api/laptops", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, _id: editingId }),
      });
      setEditingId(null);
    } else {
      await fetch("/api/laptops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm({
      seatNo: "",
      location: "",
      assetTag: "",
      sysNo: "",
      processor: "",
      ram: "",
      hddSize: "",
      make: "",
      os: "",
      serviceTag: "",
      column1: "",
      remarks: "",
    });
    fetchLaptops();
  };

  const handleEdit = (laptop: Laptop) => {
    setForm(laptop);
    setEditingId(laptop._id!);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await fetch("/api/laptops", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      setDeleteId(null);
      setOpenDialog(false);
      fetchLaptops();
    }
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(laptops);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laptops");
    XLSX.writeFile(workbook, "laptops.xlsx");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        interface ExcelRow {
          "Seat No"?: string;
          seatNo?: string;
          "Location"?: string;
          location?: string;
          "Asset Tag"?: string;
          assetTag?: string;
          "Sys No"?: string;
          sysNo?: string;
          "Processor"?: string;
          processor?: string;
          "Ram"?: string;
          ram?: string;
          "HDD Size"?: string;
          hddSize?: string;
          "Make"?: string;
          make?: string;
          "OS"?: string;
          os?: string;
          "Service Tag"?: string;
          serviceTag?: string;
          "Column1"?: string;
          column1?: string;
          "Comments"?: string;
          remarks?: string;
          "Purchased On"?: string;
        }

        // Map Excel headers to app field names and add _id
        const mappedLaptops = (jsonData as ExcelRow[]).map((row) => ({
          seatNo: row["Seat No"] || row.seatNo || "",
          location: row["Location"] || row.location || "",
          assetTag: row["Asset Tag"] || row.assetTag || "",
          sysNo: row["Sys No"] || row.sysNo || "",
          processor: row["Processor"] || row.processor || "",
          ram: row["Ram"] || row.ram || "",
          hddSize: row["HDD Size"] || row.hddSize || "",
          make: row["Make"] || row.make || "",
          os: row["OS"] || row.os || "",
          serviceTag: row["Service Tag"] || row.serviceTag || "",
          column1: row["Column1"] || row.column1 || "",
          remarks: row["Comments"] || row.remarks || "",
          purchasedOn: row["Purchased On"] ? new Date(row["Purchased On"]).toISOString() : undefined,
        }));

        try {
          const res = await fetch("/api/laptops", {
            method: "POST", // Use POST for batch insert
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mappedLaptops), // Send array of laptops
          });
          if (res.ok) {
            fetchLaptops(); // Refresh the list after successful import
            console.log("Laptops imported successfully!");
          } else {
            const errorData = await res.json();
            console.error("Import failed:", errorData.error);
          }
        } catch (error) {
          console.error("Error during import fetch:", error);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const filteredLaptops = laptops.filter((laptop) =>
    Object.values(laptop).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
            <Button component={Link} href="/laptop" variant="contained" color="primary">Laptop</Button>
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
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, letterSpacing: 2, color: 'secondary.main' }}>
          Laptop Asset
        </Typography>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
          <form onSubmit={handleSubmit}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" useFlexGap>
              <TextField name="seatNo" label="Seat No" value={form.seatNo} onChange={handleChange} required size="small" />
              <TextField name="location" label="Location" value={form.location} onChange={handleChange} required size="small" />
              <TextField name="assetTag" label="Asset Tag" value={form.assetTag} onChange={handleChange} required size="small" />
              <TextField name="sysNo" label="Sys No" value={form.sysNo} onChange={handleChange} required size="small" />
              <TextField name="processor" label="Processor" value={form.processor} onChange={handleChange} required size="small" />
              <TextField name="ram" label="Ram" value={form.ram} onChange={handleChange} required size="small" />
              <TextField name="hddSize" label="HDD Size" value={form.hddSize} onChange={handleChange} required size="small" />
              <TextField name="make" label="Make" value={form.make} onChange={handleChange} required size="small" />
              <TextField name="os" label="OS" value={form.os} onChange={handleChange} required size="small" />
              <TextField name="serviceTag" label="Service Tag" value={form.serviceTag} onChange={handleChange} required size="small" />
              <TextField name="column1" label="Column1" value={form.column1} onChange={handleChange} size="small" />
              <TextField name="remarks" label="Remarks" value={form.remarks} onChange={handleChange} size="small" />
              <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 120 }}>
                {editingId ? "Update" : "Add"} Laptop
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      seatNo: "",
                      location: "",
                      assetTag: "",
                      sysNo: "",
                      processor: "",
                      ram: "",
                      hddSize: "",
                      make: "",
                      os: "",
                      serviceTag: "",
                      column1: "",
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
          placeholder="Search laptops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TableContainer component={Paper} elevation={2} sx={{ minWidth: 1200, backgroundColor: '#f5f5f5' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Seat No</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Asset Tag</TableCell>
                <TableCell>Sys No</TableCell>
                <TableCell>Processor</TableCell>
                <TableCell>Ram</TableCell>
                <TableCell>HDD Size</TableCell>
                <TableCell>Make</TableCell>
                <TableCell>OS</TableCell>
                <TableCell>Service Tag</TableCell>
                <TableCell>Column1</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLaptops.map((laptop) => (
                <TableRow key={laptop._id}>
                  <TableCell>{laptop.seatNo}</TableCell>
                  <TableCell>{laptop.location}</TableCell>
                  <TableCell>{laptop.assetTag}</TableCell>
                  <TableCell>{laptop.sysNo}</TableCell>
                  <TableCell>{laptop.processor}</TableCell>
                  <TableCell>{laptop.ram}</TableCell>
                  <TableCell>{laptop.hddSize}</TableCell>
                  <TableCell>{laptop.make}</TableCell>
                  <TableCell>{laptop.os}</TableCell>
                  <TableCell>{laptop.serviceTag}</TableCell>
                  <TableCell>{laptop.column1}</TableCell>
                  <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 200 }}>{laptop.remarks}</TableCell>
                  <TableCell align="center" sx={{ minWidth: 100 }}>
                    <IconButton color="primary" onClick={() => handleEdit(laptop)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(laptop._id!)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleExport}>
            Export to Excel
          </Button>
          <Button variant="contained" color="primary" component="label">
            Import from Excel
            <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
          </Button>
        </Box>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{deleteId ? "Confirm Delete" : "Edit Laptop"}</DialogTitle>
          <DialogContent>
            {deleteId ? (
              <Typography>Are you sure you want to delete this laptop?</Typography>
            ) : (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField name="seatNo" label="Seat No" value={form.seatNo} onChange={handleChange} required />
                <TextField name="location" label="Location" value={form.location} onChange={handleChange} required />
                <TextField name="assetTag" label="Asset Tag" value={form.assetTag} onChange={handleChange} required />
                <TextField name="sysNo" label="Sys No" value={form.sysNo} onChange={handleChange} required />
                <TextField name="processor" label="Processor" value={form.processor} onChange={handleChange} required />
                <TextField name="ram" label="Ram" value={form.ram} onChange={handleChange} required />
                <TextField name="hddSize" label="HDD Size" value={form.hddSize} onChange={handleChange} required />
                <TextField name="make" label="Make" value={form.make} onChange={handleChange} required />
                <TextField name="os" label="OS" value={form.os} onChange={handleChange} required />
                <TextField name="serviceTag" label="Service Tag" value={form.serviceTag} onChange={handleChange} required />
                <TextField name="column1" label="Column1" value={form.column1} onChange={handleChange} />
                <TextField name="remarks" label="Remarks" value={form.remarks} onChange={handleChange} />
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
        </Box>
      </Container>
    </ThemeProvider>
  );
} 
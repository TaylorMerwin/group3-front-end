// components/NavBar.jsx
// "use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import NextLink from "next/link";

export default function NavBar() {
  return (
    <AppBar position="static" style={{ backgroundColor: '#000000' }}> {/* Set color to "primary" */}
      <Toolbar>
        <Typography variant="h6" >
        <Link href="/" component={NextLink} sx={{ ml: 80, color: 'white', textDecoration: 'none' }}>
            Home
          </Link>
          <Link href="/add" component={NextLink} sx={{ ml: 5, color: 'white', textDecoration: 'none' }}>
            Add
          </Link>
          {/* <Link href="/update"  component={NextLink} sx={{ ml: 5, color: 'white', textDecoration: 'none' }}>
            Update/Delete
          </Link> */}

          <Link href="/AllBooks" component={NextLink} sx={{ ml: 5, color: 'white', textDecoration: 'none' }}>
            Books
          </Link>
          <Link href="/view" component={NextLink} sx={{ ml: 5, color: 'white', textDecoration: 'none' }}>
            View
          </Link>
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

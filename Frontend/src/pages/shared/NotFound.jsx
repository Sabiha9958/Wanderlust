import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
} from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 520,
          width: "100%",
          borderRadius: 4,
          boxShadow: 6,
        }}
      >
        <CardContent>
          <Stack spacing={3} alignItems="center" textAlign="center">
            {/* Icon */}
            <Box
              sx={{
                bgcolor: "primary.light",
                p: 2,
                borderRadius: "50%",
              }}
            >
              <SearchOffIcon sx={{ fontSize: 44, color: "primary.main" }} />
            </Box>

            {/* Text */}
            <Box>
              <Typography variant="h3" fontWeight={800}>
                404
              </Typography>
              <Typography variant="h6" color="text.primary">
                Page not found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The page you're looking for doesn’t exist or may have been
                moved.
              </Typography>
            </Box>

            {/* Actions */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              width="100%"
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                fullWidth
              >
                Go Back
              </Button>

              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => navigate("/")}
                fullWidth
              >
                Home
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotFound;

import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/warehouse/auth/token', {
        email,
        password,
      });

      if (res.data.code === 0 && res.data.result?.authenticated) {
        localStorage.setItem('token', res.data.result.token);
        navigate('/dashboard');
      } else {
        alert('Sai thông tin đăng nhập');
      }
    } catch (err) {
      alert('Lỗi kết nối server');
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, mt: 12 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Đăng nhập
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            type="password"
            label="Mật khẩu"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ marginTop: 2 }}
          >
            Đăng nhập
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

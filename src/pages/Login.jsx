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
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg('');
  try {
    const res = await axios.post('http://localhost:8080/warehouse/auth/token', {
      email,
      password,
    });

    if (res.data.code === 0 && res.data.result?.authenticated) {
      localStorage.setItem('token', res.data.result.token);
      navigate('/dashboard');
    } else {
      setErrorMsg('Sai thông tin đăng nhập');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  } catch (err) {
    if (err.response) {
      setErrorMsg('Sai thông tin đăng nhập');
      setTimeout(() => setErrorMsg(''), 5000);
    } else {    
      setErrorMsg('Lỗi kết nối server');
      setTimeout(() => setErrorMsg(''), 5000);  
    }
  }
};


  return (
    <Box
      sx={{
        bgcolor: '#E9E4D4',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          bgcolor: 'transparent',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 3,
            bgcolor: '#F5F1E9',
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(109,95,75,0.4)',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: '#6D5F4B', mb: 1 }}
          >
            Đăng nhập
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& label': { color: '#6D5F4B' },
                '& input': { color: '#6D5F4B' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#6D5F4B' },
                  '&:hover fieldset': { borderColor: '#6D5F4B' },
                  '&.Mui-focused fieldset': { borderColor: '#6D5F4B' },
                },
              }}
            />
            <TextField
              fullWidth
              type="password"
              label="Mật khẩu"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& label': { color: '#6D5F4B' },
                '& input': { color: '#6D5F4B' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#6D5F4B' },
                  '&:hover fieldset': { borderColor: '#6D5F4B' },
                  '&.Mui-focused fieldset': { borderColor: '#6D5F4B' },
                },
              }}
            />

            {/* Hiển thị thông báo lỗi */}
            {errorMsg && (
              <Typography
                variant="body2"
                sx={{ color: 'red', mt: 1, mb: 1, textAlign: 'center' }}
              >
                {errorMsg}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                marginTop: 2,
                bgcolor: '#6D5F4B',
                color: '#E0D7C6',
                '&:hover': { bgcolor: '#574B3E' },
              }}
            >
              Đăng nhập
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

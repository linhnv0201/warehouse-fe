import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Grid, Tabs, Tab, Divider, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import axios from 'axios';

export default function PurchaseOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [receiveOrders, setReceiveOrders] = useState([]);
  const [loadingRO, setLoadingRO] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedReceiveOrder, setSelectedReceiveOrder] = useState(null);

//   //Của thanh toán
    const [purchaseInvoices, setPurchaseInvoices] = useState([]);
    const [loadingPI, setLoadingPI] = useState(false);
    const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/warehouse/purchase-orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data.result);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderId]);

  
// Hàm xử lý Duyệt đơn hàng
const handleApproveOrder = async () => {
  try {
    await axios.patch(`http://localhost:8080/warehouse/purchase-orders/${orderId}/status?status=APPROVED`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOrder((prevOrder) => ({ ...prevOrder, status: 'APPROVED' }));
    alert('Đơn hàng đã được duyệt!');
  } catch {
    alert('Lỗi khi duyệt đơn hàng');
  }
};

// Hàm xử lý Hủy đơn hàng
const handleCancelOrder = async () => {
  try {
    await axios.patch(`http://localhost:8080/warehouse/purchase-orders/${orderId}/status?status=CANCELLED`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOrder((prevOrder) => ({ ...prevOrder, status: 'CANCELLED' }));
    alert('Đơn hàng đã bị hủy!');
  } catch {
    alert('Lỗi khi hủy đơn hàng');
  }
};

    const fetchPurchaseInvoices = async (receiveOrderId) => {
    setLoadingPI(true);
    try {
        const res = await axios.get(`http://localhost:8080/warehouse/purchase-invoices/by-receive-order/${receiveOrderId}`, {
        headers: { Authorization: `Bearer ${token}` },
        });
        setPurchaseInvoices(res.data || []);
    } catch (error) {
        setPurchaseInvoices([]);
        alert('Lỗi khi lấy hóa đơn mua');
    } finally {
        setLoadingPI(false);
    }
    };

    const handleOpenInvoice = async (receiveOrderId) => {
    await fetchPurchaseInvoices(receiveOrderId);
    setOpenInvoiceDialog(true);
    };
    const handleCloseInvoice = () => {
    setOpenInvoiceDialog(false);
    setPurchaseInvoices([]);
    setSelectedInvoice(null);
    };

  const fetchReceiveOrders = async () => {
    setLoadingRO(true);
    try {
      const res = await axios.get(`http://localhost:8080/warehouse/receive-orders/by-purchase-order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReceiveOrders(res.data.result || []);
    } catch {
      setReceiveOrders([]);
    } finally {
      setLoadingRO(false);
    }
  };

  const handleCreateReceiveOrder = async () => {
    const payload = {
      purchaseOrderId: Number(orderId),
      items: order.items.map((item) => ({
        purchaseOrderItemId: item.id,
        quantity: item.remainingQuantity,
      })),
    };

    try {
      await axios.post(`http://localhost:8080/warehouse/receive-orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchReceiveOrders();
      alert('Tạo phiếu nhập thành công!');
    } catch {
      alert('Tạo phiếu nhập thất bại!');
    }
  };

  const handleOpenDetail = async (receiveOrderId) => {
    try {
      const response = await axios.get(`http://localhost:8080/warehouse/receive-orders/${receiveOrderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.code === 0) {
        setSelectedReceiveOrder(response.data.result);
        setOpenDetailDialog(true);
      } else {
        alert('Lấy chi tiết phiếu nhập kho thất bại');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi khi gọi API lấy chi tiết phiếu nhập kho');
    }
  };

  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setSelectedReceiveOrder(null);
  };

  useEffect(() => {
    if (tab === 1 && order) {
      fetchReceiveOrders();
    }
  }, [tab, order]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress sx={{ color: '#5D4037' }} /></Box>;
  }

  if (!order) {
    return <Typography align="center" mt={5} sx={{ color: '#5D4037' }}>Không tìm thấy đơn hàng.</Typography>;
  }

  return (
    <Paper sx={{ p: 4, mt: 4, bgcolor: '#efebe9' }}>
      <Button
        variant="outlined"
        sx={{ mb: 2, color: '#5D4037', borderColor: '#5D4037' }}
        onClick={() => navigate(-1)}
      >
        ← Quay lại
      </Button>

      <Typography variant="h6" gutterBottom sx={{ color: '#5D4037' }}>
        Chi tiết đơn hàng: <strong>{order.code}</strong>
      </Typography>

      <Tabs value={tab} onChange={(_, newVal) => setTab(newVal)} sx={{ mb: 2 }}>
        <Tab label="Tổng quan" />
        <Tab label="Phiếu nhập" />
        {/* <Tab label="Thanh toán" /> */}
      </Tabs>

      {tab === 0 && (
        <>
<Grid container spacing={2} sx={{ color: '#5D4037', mb: 2 }}>
  <Grid item xs={12} sm={6}>
    <Typography><strong>Mã đơn hàng:</strong> {order.code}</Typography>
    <Typography><strong>Trạng thái:</strong> {order.status}</Typography>
    <Typography><strong>Ngày tạo đơn:</strong> {new Date(order.createdAt).toLocaleString()}</Typography>
    <Typography><strong>Nhà cung cấp:</strong> {order.supplierName}</Typography>
  </Grid>
  
  <Grid item xs={12} sm={6}>
    <Typography><strong>Người tạo:</strong> {order.createdBy}</Typography>
    <Typography><strong>Nhập về kho:</strong> {order.warehouseName}</Typography>
    <Typography><strong>Tên đơn hàng:</strong> {order.orderName}</Typography>
  </Grid>

  {/* Thêm 2 nút Duyệt và Hủy vào đây */}
  {order.status === 'PENDING' && (
    <Grid item xs={12} sx={{ textAlign: 'right', mt: 2 }}>
      <Button
        variant="contained"
        color="success"
        onClick={handleApproveOrder}
        sx={{ mr: 2 }}
      >
        Duyệt
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={handleCancelOrder}
      >
        Hủy
      </Button>
    </Grid>
  )}
</Grid>

<Divider sx={{ my: 3 }} />


          <TableContainer component={Paper} sx={{ bgcolor: '#d7ccc8' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#a1887f' }}>
                  <TableCell sx={{ color: '#fff' }}>STT</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Mã sản phẩm</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Tên sản phẩm</TableCell>
                  <TableCell sx={{ color: '#fff' }}>ĐVT</TableCell>
                  <TableCell sx={{ color: '#fff', textAlign: 'right' }}>SL</TableCell>
                  <TableCell sx={{ color: '#fff', textAlign: 'right' }}>SL chưa nhập</TableCell>
                  <TableCell sx={{ color: '#fff', textAlign: 'right' }}>Đơn giá (trước VAT)</TableCell>
                  <TableCell sx={{ color: '#fff', textAlign: 'right' }}>Thuế VAT (%)</TableCell>
                  <TableCell sx={{ color: '#fff', textAlign: 'right' }}>Thành tiền (sau VAT)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items?.map((item, idx) => {
                  const unitPrice = item.unitPrice || 0;
                  const quantity = item.quantity || 0;
                  const taxRate = item.taxRate || 0;
                  const totalBeforeVAT = unitPrice * quantity;
                  const vatAmount = totalBeforeVAT * taxRate / 100;
                  const totalPrice = totalBeforeVAT + vatAmount;

                  return (
                    <TableRow key={item.id} sx={{ bgcolor: '#efebe9' }}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{item.productCode}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.unit || 'Cái'}</TableCell>
                      <TableCell align="right">{quantity}</TableCell>
                      <TableCell align="right">{item.remainingQuantity}</TableCell>
                      <TableCell align="right">{unitPrice.toLocaleString()} ₫</TableCell>
                      <TableCell align="right">{taxRate.toLocaleString()} %</TableCell>
                      <TableCell align="right">{totalPrice.toLocaleString()} ₫</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="h6" sx={{ color: '#5D4037' }}>
              <strong>Tổng đơn (sau VAT):</strong> {order.totalPrice?.toLocaleString()} ₫
            </Typography>
          </Box>
        </>
      )}

      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#5D4037' }}>Danh sách phiếu nhập</Typography>

            {order.status === 'APPROVED' ? (
              <Button
                variant="contained"
                onClick={handleCreateReceiveOrder}
                sx={{ bgcolor: '#5D4037', ':hover': { bgcolor: '#4e342e' } }}
              >
                + Tạo phiếu nhập
              </Button>
            ) : (
              <Typography sx={{ color: '#5D4037', fontStyle: 'italic', mt: 1 }}>
                * Chỉ có thể tạo phiếu nhập khi đơn hàng đã được duyệt (Approved).
              </Typography>
            )}
          </Box>

          {loadingRO ? (
            <CircularProgress sx={{ color: '#5D4037' }} />
          ) : receiveOrders.length === 0 ? (
            <Typography>Chưa có phiếu nhập nào.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: '#d7ccc8' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#a1887f' }}>
                    <TableCell sx={{ color: '#fff' }}>Mã phiếu nhập</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Ngày tạo</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Người tạo</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Chi tiết</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Hóa đơn mua</TableCell>                   

                  </TableRow>
                </TableHead>
                <TableBody>
                  {receiveOrders.map((ro) => (
                    <TableRow key={ro.id} sx={{ bgcolor: '#efebe9' }}>
                      <TableCell>{ro.code}</TableCell>
                      <TableCell>{new Date(ro.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{ro.createdBy?.fullname || '---'}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleOpenDetail(ro.id)} sx={{ color: '#5D4037' }}>
                          Xem chi tiết
                        </Button>
                      </TableCell>         
                        <TableCell>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenInvoice(ro.id)}
                            sx={{ color: '#5D4037', borderColor: '#5D4037' }}
                        >
                            Xem hóa đơn
                        </Button>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Modal chi tiết phiếu nhập */}
<Dialog open={openDetailDialog} onClose={handleCloseDetail} fullWidth maxWidth="md">
  <DialogTitle>Chi tiết phiếu nhập {selectedReceiveOrder?.code}</DialogTitle>
  <DialogContent>
    <Box>
      {/* Thông tin cơ bản của phiếu nhập */}
      <Typography><strong>Mã phiếu nhập:</strong> {selectedReceiveOrder?.code}</Typography>
      <Typography><strong>Ngày tạo:</strong> {new Date(selectedReceiveOrder?.createdAt).toLocaleString()}</Typography>
      <Typography><strong>Người tạo:</strong> {selectedReceiveOrder?.createdBy}</Typography>
      <Typography><strong>Chi phí vận chuyển:</strong> {selectedReceiveOrder?.shippingCost.toLocaleString()} ₫</Typography>

      <Divider sx={{ my: 2 }} />

      {/* Danh sách sản phẩm trong phiếu nhập */}
      <Typography variant="h6" sx={{ color: '#5D4037' }}>Danh sách sản phẩm:</Typography>


<TableContainer component={Paper} sx={{ maxWidth: '80vw', mx: 'auto', mt: 2 }}>
  <Table size="small" aria-label="Danh sách sản phẩm phiếu nhập">
    <TableHead>
      <TableRow sx={{ bgcolor: '#f0f0f0' }}>
        <TableCell><strong>#</strong></TableCell>
        <TableCell><strong>Sản phẩm</strong></TableCell>
        <TableCell align="right"><strong>Số lượng</strong></TableCell>
        <TableCell align="right"><strong>Đơn giá</strong></TableCell>
        <TableCell align="right"><strong>Thuế VAT (%)</strong></TableCell>
        <TableCell align="right"><strong>Thành tiền</strong></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {selectedReceiveOrder?.items?.map((item, idx) => (
        <TableRow key={item.id} hover>
          <TableCell>{idx + 1}</TableCell>
          <TableCell>
            <Typography variant="body1" fontWeight="bold">
              {item.productName}
            </Typography>
          </TableCell>
          <TableCell align="right">{item.quantity}</TableCell>
          <TableCell align="right">
            {Number(item.unitPrice).toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
            })}
          </TableCell>
          <TableCell align="right">{item.taxRate}</TableCell>
          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {Number(item.totalPrice).toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
            })}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
    </Box>
  </DialogContent>

  {/* Đặt tổng tiền dưới cùng bên phải */}
  <DialogActions sx={{ justifyContent: 'flex-end', bgcolor: '#f5f5f5', p: 2 }}>
    <Typography variant="h6" sx={{ color: '#5D4037' }}>
      <strong>Tổng tiền (sau VAT):</strong> {selectedReceiveOrder?.totalAmount?.toLocaleString()} ₫
    </Typography>
    <Button onClick={handleCloseDetail} color="primary">Đóng</Button>
  </DialogActions>
</Dialog>

 {/* Thông tin hóa đơn */}
<Dialog open={openInvoiceDialog} onClose={handleCloseInvoice} fullWidth maxWidth="md">
  <DialogTitle sx={{ backgroundColor: '#8D6E63', color: '#fff' }}>Hóa đơn mua</DialogTitle>
  <DialogContent sx={{ backgroundColor: '#D7CCC8', paddingBottom: 2 }}>
    {loadingPI ? (
      <CircularProgress sx={{ color: '#5D4037' }} />
    ) : purchaseInvoices.length === 0 ? (
      <Typography sx={{ color: '#5D4037' }}>Chưa có hóa đơn mua nào cho phiếu nhập này.</Typography>
    ) : (
      <TableContainer component={Paper} sx={{ maxHeight: 300, bgcolor: '#f4e1d2' }}>
        <Table stickyHeader size="small" aria-label="Danh sách hóa đơn mua">
          <TableHead>
            <TableRow sx={{ bgcolor: '#6D4C41' }}>
            <TableCell sx={{ bgcolor: '#6D4C41', color: '#fff', fontWeight: 'bold' }}>Mã hóa đơn</TableCell>
            <TableCell sx={{ bgcolor: '#6D4C41', color: '#fff', fontWeight: 'bold' }}>Ngày tạo</TableCell>
            <TableCell sx={{ bgcolor: '#6D4C41', color: '#fff', fontWeight: 'bold' }}>Nhà cung cấp</TableCell>
            <TableCell sx={{ bgcolor: '#6D4C41', color: '#fff', fontWeight: 'bold' }}>Tổng tiền</TableCell>
            <TableCell sx={{ bgcolor: '#6D4C41', color: '#fff', fontWeight: 'bold' }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseInvoices.map((pi) => (
              <TableRow key={pi.id} sx={{ bgcolor: '#efebe9' }}>
                <TableCell>{pi.code}</TableCell>
                <TableCell>{new Date(pi.createdAt).toLocaleString()}</TableCell>
                <TableCell>{pi.supplierName}</TableCell>
                <TableCell>
                  {pi.totalAmount.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </TableCell>
                <TableCell>{pi.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DialogContent>
  <DialogActions sx={{ backgroundColor: '#f5f5f5', padding: 2 }}>
    <Button onClick={handleCloseInvoice} sx={{ color: '#5D4037' }}>Đóng</Button>
  </DialogActions>
</Dialog>

    </Paper>
  );
}

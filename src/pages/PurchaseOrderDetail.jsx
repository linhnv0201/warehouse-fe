import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TextField,
  TableHead, TableRow, Button, Grid, Tabs, Tab, Divider, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl,  InputLabel , MenuItem , Select
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
  const [currentReceiveOrderId, setCurrentReceiveOrderId] = useState(null);


  //Của tạo phiếu nhập
const [orderDetails, setOrderDetails] = useState(null);
const [shippingCost, setShippingCost] = useState(0);
const [receiveQuantities, setReceiveQuantities] = useState([]);
const [openCreateReceiveOrderDialog, setOpenCreateReceiveOrderDialog] = useState(false);

  //Của hóa đơn
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [loadingPI, setLoadingPI] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);



  //Của payment
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentNote, setPaymentNote] = useState('');
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [openCreatePaymentDialog, setOpenCreatePaymentDialog] = useState(false);
    const paymentMethods = [
        { value: 'CASH', label: 'Tiền mặt' },
        { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
    ];
    const [purchaseInvoice, setPurchaseInvoice] = React.useState(null);
    const [payments, setPayments] = React.useState([]);
    const [loadingPayments, setLoadingPayments] = React.useState(false);
    const [openPaymentsDialog, setOpenPaymentsDialog] = React.useState(false);
    const [paymentError, setPaymentError] = useState("");




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

// Hàm lấy dữ liệu hóa đơn mua
    const fetchPurchaseInvoices = async (receiveOrderId) => {
  setLoadingPI(true);
  try {
    const res = await axios.get(
      `http://localhost:8080/warehouse/purchase-invoices/by-receive-order/${receiveOrderId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.data.code === 0 && res.data.result) {
      // API trả về 1 hóa đơn (object), ta bọc thành mảng để map hiển thị
      setPurchaseInvoices([res.data.result]);
    } else {
      setPurchaseInvoices([]);
      alert("Không có hóa đơn mua cho phiếu nhập này.");
    }
  } catch (error) {
    setPurchaseInvoices([]);
    alert("Lỗi khi lấy hóa đơn mua.");
  } finally {
    setLoadingPI(false);
  }
    };

  const handleOpenInvoice = async (receiveOrderId) => {
    setCurrentReceiveOrderId(receiveOrderId); 
    await fetchPurchaseInvoices(receiveOrderId);
    setOpenInvoiceDialog(true);
    };

    const handleCloseInvoice = () => {
  setOpenInvoiceDialog(false);
  setPurchaseInvoices([]);
  setSelectedInvoice(null);
    };
//End hóa đơn

//Lấy phiếu nhập
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

  // Xử lý tạo phiếu nhập
    const handleOpenCreateReceiveOrder = async (purchaseOrderId) => {
  try {
    const response = await axios.get(`http://localhost:8080/warehouse/purchase-orders/${purchaseOrderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.code === 0) {
      setOrderDetails(response.data.result); // Lưu chi tiết đơn hàng
      setOpenCreateReceiveOrderDialog(true); // Mở dialog
    } else {
      alert("Không thể lấy thông tin đơn hàng.");
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin đơn hàng:", error);
    alert("Đã xảy ra lỗi khi gọi API.");
  }
    };

const handleCreateReceiveOrder = async (purchaseOrderId) => {
  try {
    const itemsToReceive = receiveQuantities
      .map(item => ({
        purchaseOrderItemId: item.id,
        quantity: parseInt(item.quantity) || 0
      }))
      .filter(item => item.quantity > 0);

    if (itemsToReceive.length === 0) {
      alert("Vui lòng nhập số lượng cho ít nhất một mặt hàng.");
      return;
    }

    const receiveOrderData = {
      shippingCost: parseFloat(shippingCost) || 0,
      items: itemsToReceive
    };

    await axios.post(
      `http://localhost:8080/warehouse/receive-orders/${purchaseOrderId}`,
      receiveOrderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    alert("Tạo phiếu nhập thành công!");
    setOpenCreateReceiveOrderDialog(false);
    setShippingCost(0);
    setReceiveQuantities([]);

    // 🔄 Cập nhật danh sách phiếu nhập mới nhất
    fetchReceiveOrders();

  } catch (error) {
    console.error("Lỗi khi tạo phiếu nhập:", error);
    alert("Tạo phiếu nhập thất bại!");
  }
};


  // Kết thúc tạo phiếu nhập

  //Chi tiết phiếu nhập
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


    const handleCreatePayment = async () => {
      if (!selectedInvoice) {
        setPaymentError('Không có hóa đơn để thanh toán');
        return;
      }

      const remaining = selectedInvoice.remainingAmount || 0;
      const amount = Number(paymentAmount);

      // Kiểm tra nhập hợp lệ
      if (!amount || amount <= 0 || amount > remaining) {
        setPaymentError(`Số tiền phải > 0 và ≤ ${remaining.toLocaleString('vi-VN')} ₫`);
        return;
      }

      setPaymentError(''); // Xóa lỗi nếu hợp lệ

      const data = {
        amount,
        paymentMethod,
        note: paymentNote || `Thanh toán hóa đơn số ${selectedInvoice.code}`,
      };

      try {
        const res = await fetch(`http://localhost:8080/warehouse/payments/${selectedInvoice.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Lỗi ${res.status}: ${errorText}`);
        }

        await res.json();

        alert('Thanh toán thành công!');
        setOpenCreatePaymentDialog(false);
        setPaymentAmount('');
        setPaymentNote('');
        setPaymentError('');

        // 🔄 Cập nhật hóa đơn
        if (selectedInvoice.receiveOrderId) {
          await fetchPurchaseInvoices(selectedInvoice.receiveOrderId);
        }

        setOpenInvoiceDialog(true);
      } catch (err) {
        console.error(err);
        setPaymentError(`Tạo thanh toán thất bại: ${err.message}`);
      }
    };



    const fetchPurchaseInvoiceByRO = async (receiveOrderId) => {
  try {
    const res = await axios.get(`http://localhost:8080/warehouse/purchase-invoices/by-receive-order/${receiveOrderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.code === 0) {
      return res.data.result;  // trả về object hóa đơn
    }
  } catch (error) {
    alert('Lỗi khi lấy hóa đơn mua');
  }
  return null;
};

    const fetchPaymentsByInvoice = async (invoiceId) => {
  setLoadingPayments(true);
  try {
    const res = await axios.get(`http://localhost:8080/warehouse/payments/by-invoice/${invoiceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.code === 0) {
      setPayments(res.data.result || []);
    } else {
      setPayments([]);
      alert('Không lấy được danh sách thanh toán');
    }
  } catch (error) {
    setPayments([]);
    alert('Lỗi khi lấy danh sách thanh toán');
  } finally {
    setLoadingPayments(false);
  }
};

    const handleOpenPaymentsDialog = async (receiveOrderId) => {
  const invoice = await fetchPurchaseInvoiceByRO(receiveOrderId);
  if (!invoice) {
    alert('Phiếu nhập chưa có hóa đơn mua.');
    return;
  }
  setPurchaseInvoice(invoice);
  await fetchPaymentsByInvoice(invoice.id);
  setOpenPaymentsDialog(true);
};

    const handleClosePaymentsDialog = () => {
  setOpenPaymentsDialog(false);
  setPayments([]);
  setPurchaseInvoice(null);
};


    //End paymnent


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
                onClick={() => handleOpenCreateReceiveOrder(orderId)} // truyền purchaseOrderId
                sx={{ bgcolor: '#5D4037', ':hover': { bgcolor: '#4e342e' } }}
                >
                + Tạo phiếu nhập
                </Button>

            ) : (
              <Typography sx={{ color: '#5D4037', fontStyle: 'italic', mt: 1 }}>
                * Chỉ có thể tạo phiếu nhập khi đơn hàng ở trạng thái được duyệt (Approved).
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
                    <TableCell sx={{ color: '#fff' }}>Thanh toán</TableCell>                   

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
                        
                        <TableCell>
                            <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenPaymentsDialog(ro.id)}
                            sx={{ color: '#5D4037', borderColor: '#5D4037' }}
                            >
                            Danh sách thanh toán
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

 {/* Tao phiếu nhập */}
      <Dialog
  open={openCreateReceiveOrderDialog}
  onClose={() => setOpenCreateReceiveOrderDialog(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Tạo phiếu nhập kho</DialogTitle>
  <DialogContent dividers>
    {orderDetails && (
      <Box mb={2}>
        <Typography variant="subtitle1"><strong>Mã đơn hàng:</strong> {orderDetails.code}</Typography>
        <Typography variant="subtitle1"><strong>Nhà cung cấp:</strong> {orderDetails.supplierName}</Typography>
        <Typography variant="subtitle1"><strong>Kho:</strong> {orderDetails.warehouseName}</Typography>
        <Typography variant="subtitle1"><strong>Người tạo:</strong> {orderDetails.createdBy}</Typography>
      </Box>
    )}

    <TextField
      label="Chi phí vận chuyển (Shipping Cost)"
      type="number"
      value={shippingCost}
      onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
      fullWidth
      margin="normal"
    />

    {orderDetails?.items.map(item => {
      const quantityObj = receiveQuantities.find(q => q.id === item.id);
      const quantityValue = quantityObj ? quantityObj.quantity : '';

      return (
        <Box
          key={item.id}
          mb={2}
          p={2}
          border="1px solid #ccc"
          borderRadius={2}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ boxShadow: 1 }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: 'bold', minWidth: 200 }}>
              Sản phẩm: {item.productName}
            </Typography>
            <Typography sx={{ mt: 0.5, minWidth: 150 }}>
              Số lượng còn lại: {item.remainingQuantity}
            </Typography>
          </Box>

            <TextField
            label="Số lượng nhập"
            type="number"
            value={
                receiveQuantities.find(q => q.id === item.id)?.quantity ?? ''
            }
            onChange={e => {
                const inputValue = e.target.value;

                // Chỉ cho nhập số nguyên >= 0 hoặc để rỗng (cho phép xoá)
                if (
                inputValue === '' ||
                (/^\d+$/.test(inputValue) && Number(inputValue) <= item.remainingQuantity)
                ) {
                const existing = receiveQuantities.find(q => q.id === item.id);
                let updatedQuantities;

                if (existing) {
                    // Cập nhật quantity nếu item đã có
                    updatedQuantities = receiveQuantities.map(q =>
                    q.id === item.id ? { ...q, quantity: inputValue } : q
                    );
                } else {
                    // Thêm mới nếu chưa có trong danh sách
                    updatedQuantities = [...receiveQuantities, { id: item.id, quantity: inputValue }];
                }

                setReceiveQuantities(updatedQuantities);
                }
            }}
            inputProps={{ min: 0, max: item.remainingQuantity }}
            sx={{ width: 120 }}
            variant="outlined"
            />

        </Box>
      );
    })}
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenCreateReceiveOrderDialog(false)} color="secondary">
      Hủy
    </Button>
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleCreateReceiveOrder(orderDetails.id)}
    >
      Tạo phiếu nhập
    </Button>
  </DialogActions>
</Dialog>

 {/* Thông tin hóa đơn */}
<Dialog
  open={openInvoiceDialog}
  onClose={handleCloseInvoice}
  fullWidth
  maxWidth="md"
>
  <DialogTitle sx={{ backgroundColor: '#6B4C3B', color: '#fff' }}>
    Hóa đơn mua
  </DialogTitle>

  <DialogContent sx={{ backgroundColor: '#E6D4C3', paddingBottom: 2 }}>
    {loadingPI ? (
      <CircularProgress sx={{ color: '#A67C52' }} />
    ) : purchaseInvoices.length === 0 ? (
      <Typography sx={{ color: '#6B4C3B', fontStyle: 'italic' }}>
        Chưa có hóa đơn mua nào cho phiếu nhập này.
      </Typography>
    ) : (
      <TableContainer component={Paper} sx={{ maxHeight: 300, bgcolor: '#F8EFE8' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#8C6744' }}>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Mã hóa đơn</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Ngày tạo</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Nhà cung cấp</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Tổng tiền</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Còn thiếu</TableCell>              
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseInvoices.map((pi) => (
              <TableRow
                key={pi.id}
                sx={{
                  bgcolor: selectedInvoice?.id === pi.id ? '#C4A484' : '#F1E4DA',
                }}
              >
                <TableCell>{pi.code}</TableCell>
                <TableCell>{new Date(pi.createdAt).toLocaleString()}</TableCell>
                <TableCell>{pi.supplierName}</TableCell>
                <TableCell>
                  {pi.totalAmount.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </TableCell>
                <TableCell>
                  {pi.remainingAmount.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </TableCell>              

                <TableCell>
                  {pi.status}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: '#6B4C3B', color: '#fff' }}
                    onClick={() => {
                      setOpenInvoiceDialog(false); // Đóng dialog hóa đơn
                      setSelectedInvoice({ ...pi, receiveOrderId: currentReceiveOrderId }); // Ghi nhớ hóa đơn đang thao tác
                      setOpenCreatePaymentDialog(true); // Mở dialog thanh toán
                    }}
                    disabled={pi.status === 'PAID'}
                  >
                    Tạo thanh toán
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DialogContent>

  <DialogActions sx={{ backgroundColor: '#F3E6DC', padding: 2 }}>
    <Button onClick={handleCloseInvoice} sx={{ color: '#6B4C3B' }}>
      Đóng
    </Button>
  </DialogActions>
</Dialog>


{/* Danh sách thanh toán */}
<Dialog open={openPaymentsDialog} onClose={handleClosePaymentsDialog} fullWidth maxWidth="md">
  <DialogTitle sx={{ backgroundColor: '#8D6E63', color: '#fff' }}>
    Danh sách thanh toán - Hóa đơn: {purchaseInvoice?.code || ''}
  </DialogTitle>
  <DialogContent sx={{ backgroundColor: '#D7CCC8', paddingBottom: 2 }}>
    {loadingPayments ? (
      <CircularProgress sx={{ color: '#5D4037' }} />
    ) : payments.length === 0 ? (
      <Typography sx={{ color: '#5D4037' }}>
        Chưa có thanh toán nào cho hóa đơn này.
      </Typography>
    ) : (
      <TableContainer component={Paper} sx={{ maxHeight: 300, bgcolor: '#f4e1d2' }}>
        <Table stickyHeader size="small" aria-label="Danh sách thanh toán">
          <TableHead>
            <TableRow sx={{ bgcolor: '#6D4C41' }}>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Mã thanh toán</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Số tiền</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Phương thức</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Ghi chú</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Ngày thanh toán</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Người tạo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id} sx={{ bgcolor: '#efebe9' }}>
                <TableCell>{p.code}</TableCell>
                <TableCell>
                  {p.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </TableCell>
                <TableCell>{p.paymentMethod}</TableCell>
                <TableCell>{p.note}</TableCell>
                <TableCell>{new Date(p.paidAt).toLocaleString()}</TableCell>
                <TableCell>{p.createdByName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DialogContent>
  <DialogActions sx={{ backgroundColor: '#f5f5f5', padding: 2 }}>
    <Button onClick={handleClosePaymentsDialog} sx={{ color: '#5D4037' }}>
      Đóng
    </Button>
  </DialogActions>
</Dialog>

  {/* Tạo thanh toán */}
  <Dialog open={openCreatePaymentDialog} onClose={() => setOpenCreatePaymentDialog(false)} fullWidth maxWidth="sm">
  <DialogTitle sx={{ backgroundColor: '#6B4C3B', color: '#fff' }}>
    Thanh toán hóa đơn
  </DialogTitle>

  <DialogContent sx={{ backgroundColor: '#F9F1EB' }}>
    {selectedInvoice && (
      <>
        <Typography><strong>Mã hóa đơn:</strong> {selectedInvoice.code}</Typography>
        <Typography><strong>Tổng tiền:</strong> {selectedInvoice.totalAmount.toLocaleString('vi-VN')} ₫</Typography>
        <Typography sx={{ mb: 2 }}>
          <strong>Còn nợ:</strong> {(selectedInvoice.remainingAmount).toLocaleString('vi-VN')} ₫
        </Typography>
      </>
    )}

    {/* <TextField
  fullWidth
  label="Số tiền thanh toán"
  type="number"
  value={paymentAmount}
  onChange={(e) => {
    const value = Number(e.target.value);
    const max = selectedInvoice ? selectedInvoice.remainingAmount - (selectedInvoice.paidAmount || 0) : 0;

    if (value > max) {
      setPaymentError(`Không được vượt quá ${max.toLocaleString('vi-VN')} ₫`);
    } else {
      setPaymentError(""); 
    }

    setPaymentAmount(value);
  }}
  margin="normal"
  error={!!paymentError}
  helperText={paymentError}
/> */}
<TextField
  fullWidth
  label="Số tiền thanh toán"
  type="number"
  value={paymentAmount}
  onChange={(e) => {
    let val = e.target.value;

    // Cho phép xóa toàn bộ
    if (val === '') {
      setPaymentAmount('');
      setPaymentError('');
      return;
    }

    // Loại bỏ số 0 ở đầu nếu có nhiều chữ số
    if (/^0\d+/.test(val)) {
      val = val.replace(/^0+/, '');
    }

    const num = Number(val);
    const max = selectedInvoice ? selectedInvoice.remainingAmount - (selectedInvoice.paidAmount || 0) : 0;

    if (num > max) {
      setPaymentError(`Không được vượt quá ${max.toLocaleString('vi-VN')} ₫`);
    } else {
      setPaymentError('');
    }

    setPaymentAmount(val);
  }}
  margin="normal"
  error={!!paymentError}
  helperText={paymentError}
/>


    <FormControl fullWidth margin="normal">
      <InputLabel>Phương thức thanh toán</InputLabel>
      <Select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        label="Phương thức thanh toán"
      >
        {paymentMethods.map((method) => (
          <MenuItem key={method.value} value={method.value}>
            {method.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <TextField
      fullWidth
      label="Ghi chú"
      value={paymentNote}
      onChange={(e) => setPaymentNote(e.target.value)}
      multiline
      rows={2}
      margin="normal"
    />
  </DialogContent>

  <DialogActions sx={{ backgroundColor: '#F3E6DC', padding: 2 }}>
    <Button onClick={() => setOpenCreatePaymentDialog(false)} sx={{ color: '#6B4C3B' }}>
      Hủy
    </Button>
    <Button
      onClick={() => {
        setPurchaseInvoice(selectedInvoice);
        handleCreatePayment();
      }}
      variant="contained"
      sx={{ backgroundColor: '#6B4C3B', color: '#fff' }}
    >
      Tạo thanh toán
    </Button>
  </DialogActions>
</Dialog>
    </Paper>
  );
}
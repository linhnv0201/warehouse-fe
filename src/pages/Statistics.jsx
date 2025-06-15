import React, { useEffect, useState } from "react";
import {
  Box, Tabs, Tab, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import axios from "axios";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6D5F4B", "#C2B49A"];
const FILTERS = [
  { label: "1 ngày", value: 1 },
  { label: "7 ngày", value: 7 },
  { label: "30 ngày", value: 30 },
  { label: "Tất cả", value: 0 }
];

export default function Statistics() {
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [total, setTotal] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDays, setFilterDays] = useState(0);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    const base = "http://localhost:8080/warehouse/statistics/";
    const type = tab === 0 ? "purchase-orders" : "sales-orders";

    try {
      const [ordersRes, totalRes] = await Promise.all([
        axios.get(`${base}${type}/approved-completed`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${base}${type}/total-approved-completed`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setOrders(ordersRes.data);
      setTotal(totalRes.data);
    } catch (err) {
      console.error("Lỗi khi fetch dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filterDays === 0) {
      setFiltered(orders);
      computeChartAndTotal(orders);
      return;
    }

    const cutoff = Date.now() - filterDays * 24 * 60 * 60 * 1000;
    const filteredData = orders.filter(o => {
      const approvedTime = o.approvedAt && new Date(o.approvedAt).getTime();
      return approvedTime && approvedTime >= cutoff;
    });

    setFiltered(filteredData);
    computeChartAndTotal(filteredData);
  };

  const computeChartAndTotal = (data) => {
    const totalSum = data.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    setTotal(totalSum);

    const statusMap = {};
    data.forEach(o => {
      const status = o.status;
      statusMap[status] = (statusMap[status] || 0) + (o.totalPrice || 0);
    });

    const formatted = Object.entries(statusMap).map(([status, value]) => ({
      name: status === "APPROVED" ? "Đơn được duyệt" :
            status === "COMPLETED" ? "Đơn hoàn thành" : status,
      value
    }));

    setChartData(formatted);
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  useEffect(() => {
    applyFilter();
  }, [orders, filterDays]);

  const title = tab === 0 ? "Thống kê đơn mua" : "Thống kê đơn bán";

  return (
    <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh" }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Đơn mua" />
        <Tab label="Đơn bán" />
      </Tabs>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" sx={{ color: "#6D5F4B" }}>{title}</Typography>

        <FormControl size="small">
          <InputLabel>Khoảng thời gian</InputLabel>
          <Select
            value={filterDays}
            label="Khoảng thời gian"
            onChange={e => setFilterDays(e.target.value)}
          >
            {FILTERS.map(f => (
              <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <CircularProgress sx={{ color: "#6D5F4B" }} />
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
            <Paper sx={{ p: 2, minWidth: 220, bgcolor: "#FDFBF7" }}>
              <Typography sx={{ color: "#6D5F4B", mb: .5 }}>💰 Tổng tiền</Typography>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
                {Number(total).toLocaleString("vi-VN")} VND
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, flex: 1, bgcolor: "#FFF" }}>
              <Typography sx={{ color: "#6D5F4B", mb: 2 }}>
                Biểu đồ tổng tiền theo trạng thái
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100}
                    label={({ name, value }) => `${name}: ${value.toLocaleString("vi-VN")} VND`}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `${Number(v).toLocaleString("vi-VN")} VND`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          <TableContainer component={Paper} sx={{ bgcolor: "#FFF" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#E9E4D4" }}>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Tên đơn</TableCell>
                  <TableCell>{tab === 0 ? "Nhà cung cấp" : "Khách hàng"}</TableCell>
                  <TableCell>Kho</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày duyệt</TableCell>
                  <TableCell align="right">Tổng tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(o => (
                  <TableRow key={o.id}>
                    <TableCell>{o.code}</TableCell>
                    <TableCell>{o.orderName}</TableCell>
                    <TableCell>{tab === 0 ? o.supplier?.name : o.customer?.name}</TableCell>
                    <TableCell>{o.warehouse?.name}</TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell>
                      {o.approvedAt
                        ? new Date(o.approvedAt).toLocaleString("vi-VN")
                        : "-"}
                    </TableCell>
                    <TableCell align="right">
                      {o.totalPrice?.toLocaleString("vi-VN")} VND
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}

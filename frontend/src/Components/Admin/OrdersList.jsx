import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'
import Swal from 'sweetalert2'
import { allOrders, deleteOrder, clearErrors } from '../../actions/orderActions'
import { DELETE_ORDER_RESET } from '../../constants/orderConstants'
import {
    errMsg, successMsg, formatDate, formatPeso, orderNumber, orderStatusClass, ORDER_STATUSES,
} from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'

const OrdersList = () => {
    const dispatch = useDispatch()
    const { loading, error, orders, totalAmount } = useSelector(state => state.allOrders)
    const { error: actionError, isDeleted } = useSelector(state => state.order)
    const [statusFilter, setStatusFilter] = useState('')

    useEffect(() => {
        dispatch(allOrders())
    }, [dispatch])

    useEffect(() => {
        if (error) { errMsg(error); dispatch(clearErrors()) }
        if (actionError) { errMsg(actionError); dispatch(clearErrors()) }
    }, [error, actionError, dispatch])

    useEffect(() => {
        if (isDeleted) {
            successMsg('Order deleted')
            dispatch({ type: DELETE_ORDER_RESET })
            dispatch(allOrders())
        }
    }, [isDeleted, dispatch])

    const confirmDelete = async (order) => {
        const result = await Swal.fire({
            title: `Delete order #${orderNumber(order)}?`,
            text: 'This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        })
        if (result.isConfirmed) dispatch(deleteOrder(order._id))
    }

    const rows = useMemo(
        () => (statusFilter ? orders.filter(o => o.orderStatus === statusFilter) : orders),
        [orders, statusFilter],
    )

    const columns = useMemo(() => [
        { field: 'number', headerName: 'Order #', width: 120, valueGetter: (value, row) => orderNumber(row) },
        { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 160, valueGetter: (value, row) => (row.user ? row.user.name : 'Deleted user') },
        { field: 'createdAt', headerName: 'Date', width: 130, valueFormatter: (value) => formatDate(value) },
        { field: 'discountCode', headerName: 'Discount', width: 120, valueGetter: (value) => value || '-' },
        { field: 'totalPrice', headerName: 'Total', width: 130, type: 'number', valueFormatter: (value) => formatPeso(value) },
        {
            field: 'orderStatus',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => <span className={`badge ${orderStatusClass(params.value)}`}>{params.value}</span>,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div className="d-flex gap-2 align-items-center h-100">
                    <Link to={`/admin/order/${params.row._id}`} className="btn btn-sm btn-outline-primary">Process</Link>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => confirmDelete(params.row)}>Delete</button>
                </div>
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [dispatch])

    return (
        <div>
            <MetaData title="All Orders" />
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h2 className="mb-0">Orders</h2>
                    <p className="text-muted mb-0">Total sales (excluding cancelled): <strong>{formatPeso(totalAmount)}</strong></p>
                </div>
                <select
                    className="form-select"
                    style={{ width: 'auto' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                >
                    <option value="">All statuses</option>
                    {ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
            </div>

            <div className="pop-grid-wrap">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row._id}
                    loading={loading}
                    autoHeight
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
                    }}
                />
            </div>
        </div>
    )
}

export default OrdersList

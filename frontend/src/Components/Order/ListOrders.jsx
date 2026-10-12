import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'
import { myOrders, clearErrors, downloadReceipt } from '../../actions/orderActions'
import { errMsg, formatDate, formatPeso, orderNumber, orderStatusClass, getErrorMessage } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'

// My orders (customer)
const ListOrders = () => {
    const dispatch = useDispatch()
    const { loading, error, orders } = useSelector(state => state.myOrders)

    useEffect(() => {
        dispatch(myOrders())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
    }, [error, dispatch])

    const handleReceipt = async (order) => {
        try {
            await downloadReceipt(order)
        } catch (e) {
            errMsg(getErrorMessage(e))
        }
    }

    const columns = useMemo(() => [
        { field: 'number', headerName: 'Order #', width: 130, valueGetter: (value, row) => orderNumber(row) },
        { field: 'createdAt', headerName: 'Date', width: 140, valueFormatter: (value) => formatDate(value) },
        { field: 'items', headerName: 'Items', width: 90, type: 'number', valueGetter: (value, row) => row.orderItems.reduce((n, i) => n + i.quantity, 0) },
        { field: 'totalPrice', headerName: 'Total', width: 140, type: 'number', valueFormatter: (value) => formatPeso(value) },
        {
            field: 'orderStatus',
            headerName: 'Status',
            width: 140,
            renderCell: (params) => <span className={`badge ${orderStatusClass(params.value)}`}>{params.value}</span>,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 200,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div className="d-flex gap-2 align-items-center h-100">
                    <Link to={`/order/${params.row._id}`} className="btn btn-sm btn-outline-primary">View</Link>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleReceipt(params.row)}>Receipt</button>
                </div>
            ),
        },
    ], [])

    return (
        <div className="container-xl pop-page">
            <MetaData title="My Orders" />
            <div className="pop-page-header">
                <h2>My Orders</h2>
                <p className="text-muted mb-0">Track your purchases and download receipts</p>
            </div>

            {!loading && orders.length === 0 ? (
                <div className="pop-empty">
                    <h4>No orders yet</h4>
                    <p className="text-muted">When you place an order it will show up here.</p>
                    <Link to="/products" className="btn btn-primary">Start shopping</Link>
                </div>
            ) : (
                <div className="pop-grid-wrap">
                    <DataGrid
                        rows={orders}
                        columns={columns}
                        getRowId={(row) => row._id}
                        loading={loading}
                        autoHeight
                        disableRowSelectionOnClick
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                            sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export default ListOrders

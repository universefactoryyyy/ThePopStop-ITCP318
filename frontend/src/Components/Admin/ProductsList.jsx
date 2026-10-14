import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'
import Swal from 'sweetalert2'
import SearchIcon from '@mui/icons-material/Search'
import {
    getAdminProducts, deleteProduct, bulkDeleteProducts, restoreProduct, clearErrors,
} from '../../actions/productActions'
import {
    DELETE_PRODUCT_RESET, BULK_DELETE_PRODUCTS_RESET, RESTORE_PRODUCT_RESET,
} from '../../constants/productConstants'
import { errMsg, successMsg, formatPeso, productImage, stockStatusClass } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'

const EMPTY_SELECTION = { type: 'include', ids: new Set() }

// Admin products: search, sort, pagination, checkbox selection with BULK delete
const ProductsList = () => {
    const dispatch = useDispatch()
    const { loading, error, products } = useSelector(state => state.adminProducts)
    const { loading: busy, error: actionError, isDeleted, bulkDeleted, isRestored } = useSelector(state => state.product)

    const [search, setSearch] = useState('')
    const [selection, setSelection] = useState(EMPTY_SELECTION)

    useEffect(() => {
        dispatch(getAdminProducts())
    }, [dispatch])

    useEffect(() => {
        if (error) { errMsg(error); dispatch(clearErrors()) }
        if (actionError) { errMsg(actionError); dispatch(clearErrors()) }
    }, [error, actionError, dispatch])

    useEffect(() => {
        if (isDeleted) {
            successMsg('Product deleted')
            dispatch({ type: DELETE_PRODUCT_RESET })
            dispatch(getAdminProducts())
        }
    }, [isDeleted, dispatch])

    useEffect(() => {
        if (bulkDeleted !== undefined) {
            successMsg(`${bulkDeleted} product${bulkDeleted === 1 ? '' : 's'} deleted`)
            dispatch({ type: BULK_DELETE_PRODUCTS_RESET })
            setSelection(EMPTY_SELECTION)
            dispatch(getAdminProducts())
        }
    }, [bulkDeleted, dispatch])

    useEffect(() => {
        if (isRestored) {
            successMsg('Product restored')
            dispatch({ type: RESTORE_PRODUCT_RESET })
            dispatch(getAdminProducts())
        }
    }, [isRestored, dispatch])

    // search by name, series, brand or SKU
    const rows = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return products
        return products.filter(p =>
            [p.name, p.series, p.brand, p.sku].some(value => String(value || '').toLowerCase().includes(term)))
    }, [products, search])

    const selectedIds = useMemo(() => {
        if (selection.type === 'exclude') return rows.filter(r => !selection.ids.has(r._id)).map(r => r._id)
        return Array.from(selection.ids)
    }, [selection, rows])

    const confirmDelete = async (product) => {
        const result = await Swal.fire({
            title: `Delete "${product.name}"?`,
            text: 'The product is hidden from the shop. You can restore it later.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        })
        if (result.isConfirmed) dispatch(deleteProduct(product._id))
    }

    const confirmBulkDelete = async () => {
        const result = await Swal.fire({
            title: `Delete ${selectedIds.length} product${selectedIds.length === 1 ? '' : 's'}?`,
            text: 'The selected products are hidden from the shop. You can restore them later.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete selected',
        })
        if (result.isConfirmed) dispatch(bulkDeleteProducts(selectedIds))
    }

    const columns = useMemo(() => [
        {
            field: 'image',
            headerName: 'Photo',
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: (params) => <img src={productImage(params.row)} alt="" className="pop-grid-thumb" />,
        },
        { field: 'name', headerName: 'Name', flex: 1.4, minWidth: 200 },
        { field: 'series', headerName: 'Series', width: 140 },
        { field: 'brand', headerName: 'Brand', width: 130 },
        { field: 'price', headerName: 'Price', width: 120, type: 'number', valueFormatter: (value) => formatPeso(value) },
        { field: 'stock', headerName: 'Stock', width: 90, type: 'number' },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                params.row.deletedAt
                    ? <span className="badge bg-secondary">Deleted</span>
                    : <span className={`badge ${stockStatusClass(params.value)}`}>{params.value}</span>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 190,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <div className="pop-grid-actions">
                    {params.row.deletedAt ? (
                        <button type="button" className="btn btn-sm btn-outline-success" onClick={() => dispatch(restoreProduct(params.row._id))}>Restore</button>
                    ) : (
                        <>
                            <Link to={`/admin/product/${params.row._id}`} className="btn btn-sm btn-outline-primary">Edit</Link>
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => confirmDelete(params.row)}>Delete</button>
                        </>
                    )}
                </div>
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [dispatch])

    return (
        <div>
            <MetaData title="Admin Products" />
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h2 className="mb-0">Products</h2>
                <Link to="/admin/product" className="btn btn-primary">+ New product</Link>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <div className="input-group pop-search-box">
                    <span className="input-group-text"><SearchIcon fontSize="small" /></span>
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Search name, series, brand or SKU"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search products"
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-danger"
                    disabled={selectedIds.length === 0 || busy}
                    onClick={confirmBulkDelete}
                >
                    Delete selected{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                </button>
            </div>

            <div className="pop-grid-wrap">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row._id}
                    loading={loading || busy}
                    checkboxSelection
                    disableRowSelectionOnClick
                    isRowSelectable={(params) => !params.row.deletedAt}
                    rowSelectionModel={selection}
                    onRowSelectionModelChange={setSelection}
                    rowHeight={64}
                    autoHeight
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    getRowClassName={(params) => (params.row.deletedAt ? 'pop-row-deleted' : '')}
                />
            </div>
        </div>
    )
}

export default ProductsList

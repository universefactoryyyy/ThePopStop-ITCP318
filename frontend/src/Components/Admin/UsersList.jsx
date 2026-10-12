import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'
import Swal from 'sweetalert2'
import SearchIcon from '@mui/icons-material/Search'
import { allUsers, deleteUser, clearErrors } from '../../actions/userActions'
import { DELETE_USER_RESET } from '../../constants/userConstants'
import { errMsg, successMsg, formatDate } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'

const UsersList = () => {
    const dispatch = useDispatch()
    const { loading, error, users } = useSelector(state => state.allUsers)
    const { user: me } = useSelector(state => state.auth)
    const { error: actionError, isDeleted } = useSelector(state => state.user)
    const [search, setSearch] = useState('')

    useEffect(() => {
        dispatch(allUsers())
    }, [dispatch])

    useEffect(() => {
        if (error) { errMsg(error); dispatch(clearErrors()) }
        if (actionError) { errMsg(actionError); dispatch(clearErrors()) }
    }, [error, actionError, dispatch])

    useEffect(() => {
        if (isDeleted) {
            successMsg('User deleted')
            dispatch({ type: DELETE_USER_RESET })
            dispatch(allUsers())
        }
    }, [isDeleted, dispatch])

    const confirmDelete = async (user) => {
        const result = await Swal.fire({
            title: `Delete ${user.name}?`,
            text: 'The account is deactivated and removed from the list. Their past orders are kept.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        })
        if (result.isConfirmed) dispatch(deleteUser(user._id))
    }

    const rows = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return users
        return users.filter(u => [u.name, u.email, u.username].some(v => String(v || '').toLowerCase().includes(term)))
    }, [users, search])

    const columns = useMemo(() => [
        {
            field: 'avatar',
            headerName: '',
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                params.row.avatar && params.row.avatar.url
                    ? <img src={params.row.avatar.url} alt="" className="pop-avatar" />
                    : <span className="pop-avatar pop-avatar-fallback">{params.row.name.charAt(0).toUpperCase()}</span>
            ),
        },
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
        { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200 },
        { field: 'username', headerName: 'Username', width: 130, valueGetter: (value) => value || '-' },
        {
            field: 'role',
            headerName: 'Role',
            width: 110,
            renderCell: (params) => <span className={`badge ${params.value === 'admin' ? 'bg-primary text-dark' : 'bg-secondary'}`}>{params.value}</span>,
        },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 110,
            renderCell: (params) => <span className={`badge ${params.value ? 'bg-success' : 'bg-danger'}`}>{params.value ? 'Active' : 'Inactive'}</span>,
        },
        { field: 'createdAt', headerName: 'Joined', width: 130, valueFormatter: (value) => formatDate(value) },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 170,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div className="d-flex gap-2 align-items-center h-100">
                    <Link to={`/admin/user/${params.row._id}`} className="btn btn-sm btn-outline-primary">Edit</Link>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        disabled={me && me._id === params.row._id}
                        onClick={() => confirmDelete(params.row)}
                    >
                        Delete
                    </button>
                </div>
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [dispatch, me])

    return (
        <div>
            <MetaData title="All Users" />
            <h2 className="mb-3">Users</h2>
            <div className="input-group pop-search-box mb-3">
                <span className="input-group-text"><SearchIcon fontSize="small" /></span>
                <input
                    type="search"
                    className="form-control"
                    placeholder="Search name, email or username"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search users"
                />
            </div>
            <div className="pop-grid-wrap">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row._id}
                    loading={loading}
                    rowHeight={60}
                    autoHeight
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                />
            </div>
        </div>
    )
}

export default UsersList

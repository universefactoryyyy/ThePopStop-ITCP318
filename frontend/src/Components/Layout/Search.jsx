import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import SearchIcon from '@mui/icons-material/Search'
import { formatPeso, PLACEHOLDER_IMAGE } from '../../Utils/helpers'

const API = import.meta.env.VITE_API

// Autocomplete search bar: type a name, brand or keyword and pick a suggestion,
// or press Enter to see every matching product
const Search = () => {
    const navigate = useNavigate()
    const [input, setInput] = useState('')
    const [options, setOptions] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const q = input.trim()
        if (!q) {
            setOptions([])
            return
        }
        const controller = new AbortController()
        const timer = setTimeout(async () => {
            try {
                setLoading(true)
                const { data } = await axios.get(`${API}/products/suggest`, { params: { q }, signal: controller.signal })
                setOptions(data.suggestions)
            } catch (error) {
                // aborted or offline - keep the old suggestions
            } finally {
                setLoading(false)
            }
        }, 250)
        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [input])

    const handleChange = (event, value) => {
        if (value === null || value === undefined) return
        if (typeof value === 'string') {
            const keyword = value.trim()
            navigate(keyword ? `/search/${encodeURIComponent(keyword)}` : '/products')
        } else {
            navigate(`/product/${value._id}`)
        }
    }

    return (
        <Autocomplete
            freeSolo
            className="pop-search"
            options={options}
            loading={loading}
            inputValue={input}
            onInputChange={(event, value) => setInput(value)}
            onChange={handleChange}
            filterOptions={(x) => x}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderOption={(props, option) => {
                const { key, ...rest } = props
                return (
                    <li key={option._id} {...rest} className={`${rest.className || ''} pop-search-option`}>
                        <img src={option.image || PLACEHOLDER_IMAGE} alt="" />
                        <span className="pop-search-option-text">
                            <strong>{option.name}</strong>
                            <small>{option.brand} &middot; {option.series} &middot; {formatPeso(option.price)}</small>
                        </span>
                    </li>
                )
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    size="small"
                    placeholder="Search by name, brand or keyword..."
                    slotProps={{
                        input: {
                            ...params.slotProps.input,
                            startAdornment: (
                                <>
                                    <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                                    {params.slotProps.input.startAdornment}
                                </>
                            ),
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress color="inherit" size={16} /> : null}
                                    {params.slotProps.input.endAdornment}
                                </>
                            ),
                            sx: { borderRadius: 999 },
                        },
                        htmlInput: { ...params.slotProps.htmlInput, 'aria-label': 'Search products' },
                        inputLabel: params.slotProps.inputLabel,
                    }}
                />
            )}
        />
    )
}

export default Search

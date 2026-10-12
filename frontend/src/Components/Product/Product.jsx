import { useState } from 'react'
import { Link } from 'react-router-dom'
import Rating from '@mui/material/Rating'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { formatPeso, PLACEHOLDER_IMAGE, stockStatusClass } from '../../Utils/helpers'
import { useAddToCart } from '../../Utils/hooks'

// One product card of the catalog grid
const Product = ({ product }) => {
    const addToCart = useAddToCart()
    const [adding, setAdding] = useState(false)
    const [hover, setHover] = useState(false)

    const images = product.images || []
    const mainImage = images.length ? images[0].url : PLACEHOLDER_IMAGE
    // the second photo is shown on hover
    const shownImage = hover && images.length > 1 ? images[1].url : mainImage
    const soldOut = product.status === 'Out of Stock'

    const handleAdd = async () => {
        setAdding(true)
        await addToCart(product, 1)
        setAdding(false)
    }

    return (
        <div className="card pop-product-card h-100">
            <Link
                to={`/product/${product._id}`}
                className="pop-product-img-wrap"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <img className="pop-product-img" src={shownImage} alt={product.name} loading="lazy" />
                <span className={`badge ${stockStatusClass(product.status)} pop-stock-badge`}>{product.status}</span>
            </Link>
            <div className="card-body d-flex flex-column">
                <span className="pop-chip">{product.series}</span>
                <h6 className="card-title mt-2 mb-1">
                    <Link to={`/product/${product._id}`} className="pop-product-title">{product.name}</Link>
                </h6>
                <small className="text-muted">{product.brand}</small>

                <div className="d-flex align-items-center gap-1 my-2">
                    <Rating value={product.ratings || 0} precision={0.5} readOnly size="small" />
                    <small className="text-muted">({product.numOfReviews || 0})</small>
                </div>

                <div className="mt-auto d-flex align-items-center justify-content-between">
                    <span className="pop-price">{formatPeso(product.price)}</span>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                        disabled={soldOut || adding}
                        onClick={handleAdd}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <AddShoppingCartIcon fontSize="small" /> {soldOut ? 'Sold out' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Product

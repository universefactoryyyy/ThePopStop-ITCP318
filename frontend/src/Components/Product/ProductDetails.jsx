import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import Rating from '@mui/material/Rating'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { getProductDetails, clearErrors } from '../../actions/productActions'
import { formatPeso, PLACEHOLDER_IMAGE, stockStatusClass } from '../../Utils/helpers'
import { useAddToCart } from '../../Utils/hooks'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import ProductReviews from '../Review/ProductReviews'

const ProductDetails = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const addToCart = useAddToCart()
    const { loading, error, product } = useSelector(state => state.productDetails)

    const [quantity, setQuantity] = useState(1)
    const [activeIndex, setActiveIndex] = useState(0)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        setQuantity(1)
        setActiveIndex(0)
        dispatch(getProductDetails(id))
        return () => { dispatch(clearErrors()) }
    }, [dispatch, id])

    // a different product may still be in the store while the new one loads
    const isCurrent = product && product._id === id

    if (!isCurrent) {
        if (error) {
            return (
                <div className="container-xl pop-page">
                    <MetaData title="Product not found" />
                    <div className="pop-empty">
                        <h4>Oops!</h4>
                        <p className="text-muted">{error}</p>
                        <Link to="/products" className="btn btn-primary">Back to products</Link>
                    </div>
                </div>
            )
        }
        return <Loader />
    }

    const images = product.images && product.images.length ? product.images : [{ url: PLACEHOLDER_IMAGE }]
    const stock = Number(product.stock) || 0
    const soldOut = stock <= 0
    const mainImage = images[Math.min(activeIndex, images.length - 1)]

    const handleAdd = async () => {
        setAdding(true)
        await addToCart(product, quantity)
        setAdding(false)
    }

    return (
        <div className="container-xl pop-page">
            <MetaData title={product.name} />

            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/products">Products</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
                </ol>
            </nav>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="pop-gallery-main">
                        <img src={mainImage.url} alt={product.name} />
                    </div>
                    {images.length > 1 && (
                        <div className="pop-gallery-thumbs">
                            {images.map((image, index) => (
                                <button
                                    type="button"
                                    key={image.public_id || index}
                                    className={`pop-thumb ${index === activeIndex ? 'active' : ''}`}
                                    onClick={() => setActiveIndex(index)}
                                    aria-label={`Show photo ${index + 1}`}
                                >
                                    <img src={image.url} alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-md-6">
                    <span className="pop-chip">{product.series}</span>
                    <h2 className="mt-2 mb-1">{product.name}</h2>
                    <p className="text-muted mb-2">by {product.brand}</p>

                    <div className="d-flex align-items-center gap-2 mb-3">
                        <Rating value={product.ratings || 0} precision={0.5} readOnly />
                        <span className="text-muted">({product.numOfReviews || 0} reviews)</span>
                    </div>

                    <p className="pop-price pop-price-lg">{formatPeso(product.price)}</p>

                    <p className="mb-3">
                        <span className={`badge ${stockStatusClass(product.status)}`}>{product.status}</span>
                        {!soldOut && <span className="text-muted ms-2">{stock} available</span>}
                    </p>

                    <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>

                    <div className="d-flex align-items-center gap-3 mt-4">
                        <div className="input-group pop-qty" style={{ width: 140 }}>
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={soldOut || quantity <= 1}
                                aria-label="Decrease quantity"
                            >&minus;</button>
                            <input
                                type="number"
                                className="form-control text-center"
                                value={quantity}
                                min={1}
                                max={stock}
                                readOnly
                                aria-label="Quantity"
                            />
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                                disabled={soldOut || quantity >= stock}
                                aria-label="Increase quantity"
                            >+</button>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary btn-lg d-inline-flex align-items-center gap-2"
                            disabled={soldOut || adding}
                            onClick={handleAdd}
                        >
                            <AddShoppingCartIcon /> {soldOut ? 'Out of stock' : 'Add to cart'}
                        </button>
                    </div>
                </div>
            </div>

            <ProductReviews product={product} />
        </div>
    )
}

export default ProductDetails

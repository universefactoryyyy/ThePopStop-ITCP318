import { useParams } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import ProductCatalog from './ProductCatalog'

// /products and /search/:keyword - the catalog with filters and infinite scroll
const Products = () => {
    const { keyword } = useParams()

    return (
        <div className="container-xl pop-page">
            <MetaData title={keyword ? `Search: ${keyword}` : 'Products'} />
            <div className="pop-page-header">
                <h2>{keyword ? 'Search results' : 'All Products'}</h2>
                <p className="text-muted mb-0">Authentic figures and collectibles, filter them your way</p>
            </div>
            {/* a new search starts with fresh filters */}
            <ProductCatalog key={keyword || 'all'} keyword={keyword || ''} />
        </div>
    )
}

export default Products

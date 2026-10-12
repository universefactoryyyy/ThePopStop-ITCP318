import { Link } from 'react-router-dom'
import MetaData from './Layout/MetaData'
import ProductCatalog from './Product/ProductCatalog'

const BRANDS = ['POP MART', 'LABUBU', 'SKULLPANDA', 'CRYBABY', 'PINO JELLY', 'FUNKO']

const Home = () => {
    return (
        <>
            <MetaData title="Shop" />

            <section className="pop-hero">
                <div className="container-xl">
                    <span className="pop-chip pop-chip-lg">New drops every week</span>
                    <h1 className="pop-hero-title">
                        Where <span className="pop-hero-accent">Collectors</span> Come Alive
                    </h1>
                    <p className="pop-hero-text">
                        Discover authentic POP MART, Labubu, Skullpanda, and exclusive collectibles curated for true enthusiasts.
                    </p>
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                        <a href="#catalog" className="btn btn-primary btn-lg">Shop Now</a>
                        <Link to="/about" className="btn btn-outline-primary btn-lg">About Us</Link>
                    </div>
                </div>
            </section>

            <div className="pop-marquee" aria-hidden="true">
                <div className="pop-marquee-track">
                    {[0, 1, 2, 3].map(i => (
                        <span key={i}>{BRANDS.join('  \u2726  ') + '  \u2726  '}</span>
                    ))}
                </div>
            </div>

            <div className="container-xl pop-page" id="catalog">
                <div className="pop-page-header">
                    <h2>Our Collection</h2>
                    <p className="text-muted mb-0">Scroll and keep discovering &mdash; more figures load as you go</p>
                </div>
                <ProductCatalog />
            </div>
        </>
    )
}

export default Home

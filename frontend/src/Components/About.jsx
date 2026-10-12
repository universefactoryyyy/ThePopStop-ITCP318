import FavoriteIcon from '@mui/icons-material/FavoriteBorder'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import DiamondIcon from '@mui/icons-material/DiamondOutlined'
import ShieldIcon from '@mui/icons-material/ShieldOutlined'
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined'
import HeadsetMicIcon from '@mui/icons-material/HeadsetMicOutlined'
import MetaData from './Layout/MetaData'

const OFFERS = [
    { icon: <DiamondIcon fontSize="large" />, title: 'Authentic Products', text: '100% authentic collectible figurines and plushies' },
    { icon: <ShieldIcon fontSize="large" />, title: 'Secure Checkout', text: 'Safe and easy payment process' },
    { icon: <LocalShippingIcon fontSize="large" />, title: 'Fast Shipping', text: 'Quick delivery across the Philippines' },
    { icon: <HeadsetMicIcon fontSize="large" />, title: 'Friendly Support', text: 'Always here to help you' },
]

const About = () => {
    return (
        <div className="container-xl pop-page">
            <MetaData title="About Us" />
            <div className="pop-page-header text-center">
                <h2>About Us</h2>
                <p className="text-muted">Your destination for premium collectibles culture</p>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-6">
                    <div className="card h-100 pop-feature-card">
                        <div className="card-body text-center">
                            <span className="pop-feature-icon"><FavoriteIcon fontSize="large" /></span>
                            <h3 className="h4">Our Story</h3>
                            <p className="mb-0">
                                The Pop Stop was founded with a passion for pop culture and collectibles. We believe that every figurine tells a story and brings joy to collectors of all ages.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card h-100 pop-feature-card">
                        <div className="card-body text-center">
                            <span className="pop-feature-icon"><TrackChangesIcon fontSize="large" /></span>
                            <h3 className="h4">Our Mission</h3>
                            <p className="mb-0">
                                To be the most trusted source for high-quality collectibles, providing excellent customer service and a seamless shopping experience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-center mb-4">What We Offer</h3>
            <div className="row g-4">
                {OFFERS.map(offer => (
                    <div className="col-md-3 col-sm-6" key={offer.title}>
                        <div className="card h-100 text-center pop-feature-card">
                            <div className="card-body">
                                <span className="pop-feature-icon">{offer.icon}</span>
                                <h5>{offer.title}</h5>
                                <p className="mb-0 small">{offer.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default About

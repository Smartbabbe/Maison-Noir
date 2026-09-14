import { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import CartSidebar from './components/CartSidebar'
import HomePage from './pages/HomePage'
import CollectionPage from './pages/CollectionPage'
import AboutPage from './pages/AboutPage'
import CheckoutPage from './pages/CheckoutPage'
import TrackOrderPage from './pages/TrackOrderPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <ThemeProvider>
      <CartProvider>
        <div className="min-h-screen">
          <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
          <CartSidebar onNavigate={handleNavigate}/>

          {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
          {currentPage === 'checkout' && <CheckoutPage onNavigate={handleNavigate} />}
                    {currentPage === 'track-order' && <TrackOrderPage onNavigate={handleNavigate} />}
          {currentPage === 'collection' && <CollectionPage />}
          {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}
        </div>
      </CartProvider>
    </ThemeProvider>
  )
}

import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { SearchModal } from './SearchModal'
import { AdvancedSEO } from '@/components/seo/AdvancedSEO'

export function Layout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <AdvancedSEO />
      <Navbar />
      <SearchModal />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

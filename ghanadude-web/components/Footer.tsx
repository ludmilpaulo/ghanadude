import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold text-lg mb-3">GhanaDude</h3>
          <p className="text-sm text-gray-600">Premium apparel. Custom branding. Fast delivery.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/category/all">All products</Link></li>
            <li><Link href="/category/men">Men</Link></li>
            <li><Link href="/category/women">Women</Link></li>
            <li><Link href="/category/accessories">Accessories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Get help</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shipping">Shipping</Link></li>
            <li><Link href="/returns">Returns</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="container py-4 border-t text-sm text-gray-600 flex items-center justify-between">
        <span>© {new Date().getFullYear()} GhanaDude</span>
        <span>Built with ❤️ in Africa</span>
      </div>
    </footer>
  )
}

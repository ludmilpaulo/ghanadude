import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-brand-50 to-white">
      <div className="container py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
            Premium Ghanaian Apparel — <span className="text-brand-700">Made for You</span>
          </h1>
          <p className="mt-4 text-gray-600 max-w-xl">
            Shop ready-to-wear styles or customize your own. Upload your logo for branded merch.
          </p>
          <div className="mt-6 flex gap-4">
            <Link href="/category/all" className="inline-block bg-brand-600 text-white px-5 py-3 rounded-2xl shadow-soft hover:bg-brand-700">
              Shop now
            </Link>
            <Link href="/custom" className="inline-block bg-white border px-5 py-3 rounded-2xl hover:bg-gray-50">
              Custom orders
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3]">
          <Image src="/placeholder.svg" alt="" fill className="object-cover rounded-3xl shadow-soft" />
        </div>
      </div>
    </section>
  )
}

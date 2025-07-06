
import Link from 'next/link';

export default function Header() {
  return (
    <header className="main-header">
      <div className="container">
        <nav className="navbar navbar-expand-lg">
          <Link href="/">PetBidThai</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link href="/live">ประมูลสด</Link>
              </li>
              <li className="nav-item">
                <Link href="/brands">ฝากแบรนด์</Link>
              </li>
              <li className="nav-item">
                <Link href="/newest">Newest Items</Link>
              </li>
              <li className="nav-item">
                <Link href="/top-sellers">Top Sellers</Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}

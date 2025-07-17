'use client';

import UseSticky from '@/hooks/UseSticky';
import Link from 'next/link';
import NavMenu from './NavMenu';
import MobileMenus from './mobile-menus';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const HeaderOne = () => {
  const { sticky } = UseSticky();
  const [openMenu, setOpenMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleResize = useCallback(() => {
    if (window.innerWidth <= 990) {
      setOpenMenu(false);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  if (typeof window !== 'undefined') {
    require('bootstrap/dist/js/bootstrap');
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className={`header-area ${sticky ? 'sticky-on' : ''} ${openMenu ? 'mobile-menu-open' : ''}`}>
        <nav className="navbar navbar-expand-lg">
          <div className="container">

            <Link className="navbar-brand" href="/">
              <img className="light-logo" src="/assets/img/core-img/logo.png" alt="" />
              <img className="dark-logo" src="/assets/img/core-img/logo-white.png" alt="" />
            </Link>

            <button onClick={() => setOpenMenu(!openMenu)} className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#funtoNav" aria-controls="funtoNav" aria-expanded="false" aria-label="Toggle navigation">
              <i className="bi bi-grid"></i>
            </button>

            {openMenu && <MobileMenus openMenu={openMenu} setOpenMenu={setOpenMenu} />}

            <div className="collapse navbar-collapse d-none d-xl-block" id="funtoNav">
              <NavMenu />

              <div className="header-meta d-flex align-items-center ms-lg-auto">

                <form onSubmit={handleSearch} className="search-form position-relative d-flex align-items-center me-3">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="ค้นหา..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="position-absolute" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </form>

                <div className="user-dropdown dropdown mx-3">
                  
                </div>

            

              </div>
            </div>

          </div>
        </nav>
      </header>
    </>
  );
};

export default HeaderOne;

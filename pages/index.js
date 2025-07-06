
import Head from 'next/head';
import Header from '../components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>PetBidThai | หน้าแรก</title>
        <meta name="description" content="เว็บประมูลสัตว์เลี้ยงออนไลน์" />
      </Head>
      <Header />
      <main className="slider-one rn-section-gapTop">
        <div className="container">
          <div className="row row-reverce-sm align-items-center">
            <div className="col-lg-5 col-md-6 col-sm-12 mt_sm--50">
              <h2 className="title">
                Discover Digital Art, Collect and Sell Your Specific NFTs.
              </h2>
              <p className="slide-disc">
                Partner with one of the world’s largest retailers to showcase your brand and products.
              </p>
              <div className="button-group">
                <Link href="#">Get Started</Link>
                <Link href="/create">Create</Link>
              </div>
            </div>
            <div className="col-lg-5 col-md-6 col-sm-12 offset-lg-1">
              <div className="slider-thumbnail">
                {/* You can place your image here */}
                <img src="/assets/images/slider/slider-1.png" alt="slider" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

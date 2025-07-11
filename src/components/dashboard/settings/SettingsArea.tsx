'use client'

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import live_bids_data from '@/data/live-bids-data';
import dynamic from 'next/dynamic';

const MyTimer = dynamic(() => import('../../common/Timer'), { ssr: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LivebidsArea = () => {
  const [count, setCount] = useState(8);
  const [noMorePost, setNoMorePost] = useState(false);
  const countSlice = live_bids_data.slice(0, count);
  const [active, setActive] = useState(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  const handleLoadMore = () => {
    setCount(count + 4);
    if (count >= live_bids_data.length) {
      setNoMorePost(true);
    }
  };

  const handleActive = (id: any) => {
    if (active === id) {
      setActive(null);
    } else {
      setActive(id);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      const role = userData?.role || null;
      setUserRole(role);

      if (role === 'admin') {
        const { data: userList } = await supabase
          .from('users')
          .select('*')
          .neq('role', 'admin');
        setUsers(userList || []);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ status: 'approved' })
      .eq('id', userId);
    if (!error) alert('✅ อนุมัติเรียบร้อย');
  };

  const handleBan = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'banned' ? 'approved' : 'banned';
    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', userId);
    if (!error) alert(`🛑 เปลี่ยนสถานะเป็น ${newStatus}`);
  };

  return (
    <>
      {userRole === 'admin' && (
        <div className="create-new-button">
          <Link className="shadow-lg btn btn-warning" href="/create-new" title="Create New Auction">
            <i className="fz-18 bi bi-plus-lg"></i>
          </Link>
        </div>
      )}

      <div className="admin-wrapper">
        <div className="container">
          <h5 className="mb-3">Your all live bids</h5>
          <div className="row g-4">
            {countSlice.map((item, i) => (
              <div key={i} className="col-12 col-sm-6 col-xl-4 col-xxl-3">
                <div className="nft-card card border-0">
                  <div className="card-body">
                    <div className="img-wrap">
                      <img src={item.image} alt="" />
                      <div className="badge bg-dark position-absolute">
                        <img src={item.badgeInfo[0].icon} alt="" />
                        {item.badgeInfo[0].text}
                      </div>
                      <div className="dropdown">
                        <button
                          onClick={() => handleActive(item.id)}
                          className={`btn dropdown-toggle rounded-pill shadow-sm ${active === item.id ? 'show' : ''}`}
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className={`dropdown-menu dropdown-menu-end ${active === item.id ? 'show' : ''}`}>
                          <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-share"></i>Share</a></li>
                          <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-flag"></i>Report</a></li>
                          <li><a className="dropdown-item" href="#"><i className="me-1 bi bi-bookmark"></i>Bookmark</a></li>
                        </ul>
                      </div>
                      <MyTimer endTime={item.end_time} />
                    </div>
                    <div className="row gx-2 align-items-center mt-3">
                      <div className="col-8" style={{ color: '#8084AE' }}>
                        <span className="d-block fz-12">
                          <i className="bi bi-bag me-1"></i>{item.topLevelInfo[0].text}</span></div>
                      <div className="col-4 text-end">
                        <button className="wishlist-btn" type="button"><i className="bi"></i></button>
                      </div>
                    </div>
                    <div className="row gx-2 align-items-center mt-2">
                      <div className="col-8">
                        <div className="name-info d-flex align-items-center">
                          <div className="author-img position-relative">
                            <img className="shadow" src={item.authorAvater} alt="" />
                            <i className="bi bi-check position-absolute bg-success"></i>
                          </div>
                          <div className="name-author">
                            <Link className="name d-block hover-primary fw-bold text-truncate" href="/item-details">Fancy Car</Link>
                            <Link className="author d-block fz-12 hover-primary text-truncate" href="/author">@ {item.authorName}</Link></div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="price text-end" style={{ color: '#8084AE' }}>
                          <span className="fz-12 d-block">{item.priceText}</span>
                          <h6 className="mb-0">{item.currentPrice}</h6>
                        </div>
                      </div>
                      {userRole === 'admin' && (
                        <div className="col-12">
                          <a className="btn btn-danger rounded-pill btn-sm mt-3 w-100" href="#">
                            <i className="me-1 bi bi-pencil"></i>Edit this item</a></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Admin User Management */}
          {userRole === 'admin' && (
            <div className="mt-5">
              <h5 className="mb-3">🛠 จัดการผู้ใช้งาน</h5>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>ชื่อ</th>
                      <th>อีเมล</th>
                      <th>เบอร์</th>
                      <th>Facebook</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.fullname}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.facebook}</td>
                        <td>{user.role}</td>
                        <td>{user.status}</td>
                        <td>
                          {user.status === 'pending' && (
                            <button className="btn btn-success btn-sm me-2" onClick={() => handleApprove(user.id)}>✅ อนุมัติ</button>
                          )}
                          <button className="btn btn-danger btn-sm" onClick={() => handleBan(user.id, user.status)}>
                            {user.status === 'banned' ? 'ปลดแบน' : 'แบน'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LivebidsArea;
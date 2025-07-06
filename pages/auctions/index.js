
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    async function fetchAuctions() {
      const { data, error } = await supabase.from('auctions').select('*');
      if (data) setAuctions(data);
    }
    fetchAuctions();
  }, []);

  return (
    <div className="container mt-5">
      <h2>รายการประมูล</h2>
      <ul>
        {auctions.map((auction) => (
          <li key={auction.id}>
            <strong>{auction.title}</strong> - ราคาเริ่มต้น: {auction.starting_bid}
          </li>
        ))}
      </ul>
    </div>
  );
}

import React from 'react';
import Link from 'next/link'; // นำเข้า Link จาก next/link

const AuctionProcess = () => {
  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h1 className="display-4 text-white">ขั้นตอนการส่งนกประมูลกับแอดมิน</h1>
        <p className="text-white">ลงขายนกประมูลได้ง่าย ๆ เพียงทำตามขั้นตอนด้านล่างนี้</p>
      </div>

      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="card shadow-sm border-light">
            <div className="card-header bg-warning text-white">
              <h3 className="card-title">ขั้นตอนการส่งนกประมูลกับแอดมิน</h3>
            </div>
            <div className="card-body">
              <p className="text-white">
                หากท่านต้องการประมูลนก เพียงทำการซื้อคูปองในราคา <strong>100 บาท</strong> และท่านสามารถลงขายได้ 5 ครั้ง
                เพียงทำตามขั้นตอนด้านล่างนี้:
              </p>
              <ul className="text-white">
                <li>ซื้อคูปอง 100 บาท (สามารถติดต่อแอดมินเพื่อขอซื้อคูปองได้)</li>
                <li>ส่งรูปนกของท่านให้แอดมิน (ขั้นต่ำ 2 รูป สูงสุด 5 รูป)</li>
                <li>ระบุราคาเริ่มต้นที่ท่านต้องการ</li>
                <li>ระบุเงื่อนไขการจัดส่งนก</li>
              </ul>

              <h4 className="text-white mt-4">แอดมินจะดำเนินการจัดประมูลให้โดยที่ท่านไม่ต้องทำอะไร:</h4>
              <ul className="text-white">
                <li>แอดมินจะจัดการประมูลให้อย่างครบถ้วน</li>
                <li>ท่านไม่ต้องทำอะไรเพิ่ม นอกจากรอรับเงินหลังจากการประมูลเสร็จสิ้น</li>
              </ul>

              <p className="text-white mt-4">
                เมื่อประมูลเสร็จ ท่านจะได้รับเงินจากการประมูลผ่านช่องทางที่แอดมินแจ้งให้ทราบ
              </p>

              {/* ลิงค์ไปยังฟอร์มการส่งข้อมูลการประมูล */}
              <div className="text-center mt-4">
                <Link href="/auction-form" className="btn btn-primary">
                  ส่งฟอร์มประมูลให้แอดมิน
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <p className="lead text-white">
          หากท่านมีคำถามหรือสนใจสมัครลงประมูล สามารถติดต่อแอดมินผ่าน <strong>PetBidThai Facebook</strong>
        </p>
      </div>
    </div>
  );
};

export default AuctionProcess;

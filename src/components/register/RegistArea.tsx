import React from 'react';

const MembershipTerms = () => {
  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h1 className="display-4 text-white">เงื่อนไขการสมัครสมาชิก</h1>
        <p className="text-white">สมัครสมาชิกกับเราเพื่อเริ่มประมูลและขายนกในเว็บ PetBidThai</p>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-light">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title">สมาชิกทั่วไป (General)</h3>
            </div>
            <div className="card-body">
              <p className="text-white">
                สมาชิกทั่วไปสามารถเข้าร่วมการประมูลนกได้ โดยไม่มีค่าใช้จ่าย แต่หากต้องการเข้าร่วมการประมูลนก
                ท่านจะต้องติดต่อแอดมินเพื่อขอรายละเอียดเกี่ยวกับค่าใช้จ่าย
              </p>
              <ul className="text-white">
                <li>สามารถประมูลนกได้โดยไม่มีค่าใช้จ่าย</li>
                <li>หากต้องการลงประกาศประมูลนก ต้องติดต่อแอดมินเพื่อสอบถามค่าใช้จ่าย</li>
              </ul>
              <p className="text-white">กรุณาติดต่อแอดมินที่ <strong>PetBidThai Facebook</strong> เพื่อสมัครสมาชิกทั่วไป</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-light">
            <div className="card-header bg-success text-white">
              <h3 className="card-title">สมาชิก VIP</h3>
            </div>
            <div className="card-body">
              <p className="text-white">
                สมาชิก VIP จะได้รับสิทธิพิเศษในการใช้บริการต่างๆ ในเว็บ PetBidThai เช่น การลงโฆษณาในเว็บไซต์ การลงประกาศประมูลนกโดยไม่ต้องเสียค่าใช้จ่าย และอื่นๆ
              </p>
              <ul className="text-white">
                <li>ได้พื้นที่โฆษณาในเว็บไซต์ PetBidThai</li>
                <li>สามารถลงประกาศประมูลนกโดยไม่เสียค่าใช้จ่าย</li>
                <li>สามารถลงขายสินค้าผ่านเว็บไซต์ PetBidThai ในห้องซื้อขายฟรี</li>
                <li>แบนด์เนอร์ของท่านจะโชว์ในหน้าแรกของเว็บไซต์ PetBidThai</li>
              </ul>
              <p className="text-white"><strong>ค่าใช้จ่าย:</strong> 500 บาท/ปี</p>
              <p className="text-white">กรุณาติดต่อแอดมินที่ <strong>PetBidThai Facebook</strong> เพื่อสมัครสมาชิก VIP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <p className="lead text-white">
          หากท่านต้องการสมัครสมาชิก กรุณาติดต่อแอดมินผ่านช่องทาง <strong>PetBidThai Facebook</strong> เพื่อขอข้อมูลเพิ่มเติม
        </p>
      </div>
    </div>
  );
};

export default MembershipTerms;

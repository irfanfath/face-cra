import React from 'react';

function PrivacyPolicy({ isOpen, onClose }) {
  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Kebijakan Privasi</h2>
          <div className="close-button" onClick={onClose}>×</div>
        </div>
        <div className="modal-content">
          <p className="section-title">Tujuan Pengumpulan Data Pribadi</p>
          <p>Untuk memproses pendaftaran akun dan menyediakan layanan pelanggan e-KYC.</p>
          
          <p className="section-title">Jenis Data Pribadi yang Dikumpulkan</p>
          <p>Log transaksi (bukan data pribadi).</p>
          
          <p className="section-title">Cara Penggunaan Data Pribadi</p>
          <p>Data akan digunakan untuk verifikasi identitas, pengiriman informasi terkait layanan, dan komunikasi terkait permintaan layanan.</p>
          
          <p className="section-title">Penerima Data Pribadi</p>
          <p>Data tidak akan dibagikan dengan pihak ketiga kecuali dengan persetujuan Anda atau sesuai dengan hukum yang berlaku.</p>
          
          <p className="section-title">Masa Penyimpanan Data Pribadi</p>
          <p>Data pribadi tidak disimpan setelah pemrosesan, yang disimpan hanya log transaksi.</p>
          
          <p className="section-title">Hak Subjek Data</p>
          <p>Anda berhak meminta / menghapus akses ke log transaksi.</p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
